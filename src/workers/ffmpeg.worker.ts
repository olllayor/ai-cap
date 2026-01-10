import { expose } from 'comlink';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;

const api = {
	async load() {
		if (ffmpeg) return;

		ffmpeg = new FFmpeg();

		ffmpeg.on('log', ({ message, type }) => {
			if (type === 'fferr') {
				console.error('[FFmpeg Error]', message);
			} else {
				console.log('[FFmpeg Log]', message);
			}
		});

		const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';

		// We load the core and wasm from a CDN to avoid bundling issues for now
		await ffmpeg.load({
			coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
			wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
		});
	},

	async extractAudio(file: File): Promise<Float32Array> {
		if (!ffmpeg) throw new Error('FFmpeg not loaded');

		const inputName = 'input.mp4';
		const outputName = 'output.raw';

		await ffmpeg.writeFile(inputName, await fetchFile(file));

		// Run extraction: 16kHz, Mono, Raw Float32 (f32le)
		await ffmpeg.exec([
			'-i',
			inputName,
			'-vn',
			'-c:a',
			'pcm_f32le',
			'-ar',
			'16000',
			'-ac',
			'1',
			'-f',
			'f32le',
			outputName,
		]);

		const data = await ffmpeg.readFile(outputName);

		await ffmpeg.deleteFile(inputName);
		await ffmpeg.deleteFile(outputName);

		if (typeof data === 'string') {
			throw new Error('FFmpeg returned string data unexpectedly');
		}

		return new Float32Array(data.buffer);
	},

	async burnSubtitles(
		videoFile: File,
		assContent: string,
		onProgress?: (progress: number) => void,
	): Promise<Blob> {
		if (!ffmpeg) throw new Error('FFmpeg not loaded');

		console.log('[BurnSubtitles] Starting subtitle burn process...');

		const inputName = 'input.mp4';
		const subName = 'subs.ass';
		const outputName = 'output.mp4';
		const fontName = 'LiberationSans-Regular.ttf';

		// Base URL assuming the files are in the public folder of the deployment
		const baseURL = new URL('/', self.location.origin);
		const fontURL = new URL(fontName, baseURL).href;

		try {
			// 1. Setup virtual file system for fonts
			console.log('[BurnSubtitles] Setting up virtual font environment...');

						const fontData = await fetch(fontURL).then((r) => r.arrayBuffer());
						console.log(`[BurnSubtitles] Fetched font: ${fontData.byteLength} bytes`);
			
						try {
							await ffmpeg.createDir('/fonts');
						} catch (e) { /* ignore */ }
						try {
							await ffmpeg.createDir('/tmp');
						} catch (e) { /* ignore */ }
			
						await ffmpeg.writeFile(`/${fontName}`, new Uint8Array(fontData));
						console.log('[BurnSubtitles] Virtual font environment created.');
			
						// Debug: List files in root
						const rootDir = await ffmpeg.listDir('/');
						console.log('[BurnSubtitles] Root dir contents:', rootDir);
			
						// 2. Write input files
						console.log('[BurnSubtitles] Writing input video and ASS to FFmpeg FS...');
						await ffmpeg.writeFile(inputName, await fetchFile(videoFile));
						await ffmpeg.writeFile(subName, assContent);
						console.log('[BurnSubtitles] Files written successfully');
			
						// 3. Setup progress tracking
						ffmpeg.on('progress', ({ progress }) => {
							if (onProgress) {
								onProgress(Math.round(progress * 100));
							}
						});
			
						// 4. Run FFmpeg
						const ffmpegArgs = [
							'-y',
							'-loglevel',
							'info',
							'-i',
							inputName,
							// Use the subtitles filter with fontsdir pointing to root.
							// We force Fontname=Geneva because we replaced the file with Geneva.ttf
							'-vf',
							`subtitles=${subName}:fontsdir=/:force_style='Fontname=Geneva'`,
							'-c:v',
							'libx264',
							'-preset',
							'ultrafast',
							'-crf',
							'28',
							'-c:a',
							'copy',
							outputName,
						];			console.log('[BurnSubtitles] FFmpeg command:', ffmpegArgs.join(' '));
			console.log('[BurnSubtitles] Starting FFmpeg execution...');

			await ffmpeg.exec(ffmpegArgs);

			console.log('[BurnSubtitles] FFmpeg execution completed successfully');

			// 5. Read and return output
			console.log('[BurnSubtitles] Reading output file...');
			const data = await ffmpeg.readFile(outputName);

			if (!(data instanceof Uint8Array)) {
				throw new Error('FFmpeg output is not Uint8Array');
			}

			if (data.byteLength === 0) {
				console.error('[BurnSubtitles] FFmpeg produced empty output file (0 bytes)');
				throw new Error('FFmpeg produced empty output file');
			}

			console.log('[BurnSubtitles] Output file size:', data.byteLength, 'bytes');

			const blob = new Blob([data.slice().buffer], { type: 'video/mp4' });
			console.log('[BurnSubtitles] Success! Output blob created.');
			return blob;
		} catch (error) {
			console.error('[BurnSubtitles] ERROR occurred:', error);
			throw new Error(`Video export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
		} finally {
			// Cleanup
			console.log('[BurnSubtitles] Cleaning up temporary files...');
			try {
				await Promise.all([
					ffmpeg.deleteFile(inputName),
					ffmpeg.deleteFile(subName),
					ffmpeg.deleteFile(outputName).catch(() => {}),
					// Cleanup font files
					ffmpeg.deleteFile(`/${fontName}`).catch(() => {}),
					ffmpeg.deleteFile('/tmp').catch(() => {}),
				]);
				console.log('[BurnSubtitles] Cleanup complete.');
			} catch (cleanupError) {
				console.warn('[BurnSubtitles] Cleanup failed for some files:', cleanupError);
			}
		}
	},
};

// Helper to convert File to Uint8Array
async function fetchFile(file: File): Promise<Uint8Array> {
	return new Uint8Array(await file.arrayBuffer());
}

expose(api);

export type FFmpegWorkerApi = typeof api;
