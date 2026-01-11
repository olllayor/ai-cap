import { expose } from 'comlink';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;

export type SubtitleFont = { family: string; data: Uint8Array | null } | null;

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
		font: SubtitleFont,
		onProgress?: (progress: number) => void,
	): Promise<Blob> {
		if (!ffmpeg) throw new Error('FFmpeg not loaded');

		console.log('[BurnSubtitles] Starting subtitle burn process...');

		const inputName = 'input.mp4';
		const subName = 'subs.ass';
		const outputName = 'output.mp4';
		const fontsDir = '/fonts';
		const fontFile = `${fontsDir}/caption-font.ttf`;

		try {
			// 1. Setup virtual file system for fonts
			console.log('[BurnSubtitles] Setting up virtual font environment...');
			try {
				await ffmpeg.createDir(fontsDir);
			} catch {
				// ignore
			}

			let fontBytes = font?.data ?? null;
			if (!fontBytes) {
				const fallbackUrl = new URL('/fonts/noto-sans.ttf', self.location.origin).href;
				const buffer = await fetch(fallbackUrl).then((r) => {
					if (!r.ok) throw new Error(`Fallback font fetch failed: ${r.status}`);
					return r.arrayBuffer();
				});
				fontBytes = new Uint8Array(buffer);
			}

			const fontByteLength = fontBytes.byteLength;
			await ffmpeg.writeFile(fontFile, fontBytes);
			console.log('[BurnSubtitles] Wrote font file:', fontFile, `(${fontByteLength} bytes)`);

			// 2. Write input files
			console.log('[BurnSubtitles] Writing input video and ASS to FFmpeg FS...');
			await ffmpeg.writeFile(inputName, await fetchFile(videoFile));
			await ffmpeg.writeFile(subName, assContent);
			console.log('[BurnSubtitles] Files written successfully');

			// 3. Setup progress tracking
			ffmpeg.on('progress', ({ progress }) => {
				if (onProgress) onProgress(Math.round(progress * 100));
			});

			// 4. Run FFmpeg
			const ffmpegArgs = [
				'-y',
				'-loglevel',
				'info',
				'-i',
				inputName,
				'-vf',
				`subtitles=${subName}:fontsdir=${fontsDir}`,
				'-c:v',
				'libx264',
				'-preset',
				'ultrafast',
				'-crf',
				'28',
				'-c:a',
				'copy',
				outputName,
			];
			console.log('[BurnSubtitles] FFmpeg command:', ffmpegArgs.join(' '));
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
					ffmpeg.deleteFile(inputName).catch(() => {}),
					ffmpeg.deleteFile(subName).catch(() => {}),
					ffmpeg.deleteFile(outputName).catch(() => {}),
					ffmpeg.deleteFile(fontFile).catch(() => {}),
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
