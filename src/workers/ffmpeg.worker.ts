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
		fontData?: Uint8Array,
		onProgress?: (progress: number) => void,
	): Promise<Blob> {
		if (!ffmpeg) throw new Error('FFmpeg not loaded');

		console.log('[BurnSubtitles] Starting subtitle burn process...');
		console.log('[BurnSubtitles] Video file size:', videoFile.size, 'bytes');
		console.log('[BurnSubtitles] Font data received:', !!fontData, fontData ? `${fontData.byteLength} bytes` : 'null');
		console.log('[BurnSubtitles] ASS content length:', assContent.length, 'characters');
		console.log('[BurnSubtitles] ASS content first 800 chars:', assContent.substring(0, 800));

		const inputName = 'input.mp4';
		const subName = 'subs.ass';
		const outputName = 'output.mp4';
		const fontsDir = '/fonts';

		try {
			// 1. Prepare Font Files
			if (fontData) {
				console.log('[BurnSubtitles] Writing font to virtual FS...');
				try {
					await ffmpeg.createDir(fontsDir);
				} catch {
					// Ignore if exists
				}
				// Write the font file using the generic name "CustomFont" to match the ASS file reference.
				// Note: libass in FFmpeg.wasm without fontconfig will search for fonts in fontsdir
				// by matching font filenames (without extension) to the font name in the ASS style.
				await ffmpeg.writeFile(`${fontsDir}/CustomFont.ttf`, fontData);
				console.log('[BurnSubtitles] Font written to /fonts/CustomFont.ttf');
			}

			// 3. Write input files
			console.log('[BurnSubtitles] Writing input video to FFmpeg FS...');
			await ffmpeg.writeFile(inputName, await fetchFile(videoFile));
			console.log('[BurnSubtitles] Writing ASS subtitle file to FFmpeg FS...');
			await ffmpeg.writeFile(subName, assContent);
			console.log('[BurnSubtitles] Files written successfully');

			// Setup progress tracking
			ffmpeg.on('progress', ({ progress }) => {
				if (onProgress) {
					onProgress(Math.round(progress * 100));
				}
			});

			// 4. Run FFmpeg with FontConfig configuration
			// We point to our virtual fonts.conf via environment variable
			const ffmpegArgs = [
				'-y',
				'-loglevel',
				'info',
				'-i',
				inputName,
				'-vf',
				`subtitles=${subName}:fontsdir=${fontsDir}`, // Use fontsdir explicitly
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

			try {
				// We can't easily set process environment variables in browser worker 
				// for the WASM module without the load() options, but fontsdir parameter
				// in subtitles filter is a good alternative.
				await ffmpeg.exec(ffmpegArgs);
				console.log('[BurnSubtitles] FFmpeg execution completed successfully');
			} catch (execError) {
				console.error('[BurnSubtitles] FFmpeg exec failed:', execError);
				throw execError;
			}

			// Read output
			console.log('[BurnSubtitles] Reading output file...');

			// Try checking if file exists first
			try {
				const dir = await ffmpeg.listDir('.');
				console.log(
					'[BurnSubtitles] Directory listing:',
					dir.map((d) => d.name),
				);
			} catch (e) {
				console.warn('[BurnSubtitles] Failed to list directory:', e);
			}

			const data = await ffmpeg.readFile(outputName);
			let byteLength = 0;

			// Handle Uint8Array specifically
			if (data instanceof Uint8Array) {
				byteLength = data.byteLength;
				if (byteLength === 0) {
					console.error('[BurnSubtitles] FFmpeg produced empty output file (0 bytes)');
					throw new Error('FFmpeg produced empty output file');
				}
			} else if (typeof data === 'string') {
				console.error('[BurnSubtitles] FFmpeg returned string data instead of binary');
				throw new Error('FFmpeg returned unexpected string data');
			}

			console.log('[BurnSubtitles] Output file size:', byteLength, 'bytes');

			// Cleanup
			console.log('[BurnSubtitles] Cleaning up temporary files...');
			await ffmpeg.deleteFile(inputName);
			await ffmpeg.deleteFile(subName);
			await ffmpeg.deleteFile(outputName);
			console.log('[BurnSubtitles] Cleanup complete');

			console.log('[BurnSubtitles] Creating output blob...');
			// Use a copy to avoid SharedArrayBuffer issues if cross-origin isolation is enabled
			const blob = new Blob([data.slice().buffer], { type: 'video/mp4' });
			console.log('[BurnSubtitles] Success! Output blob size:', blob.size, 'bytes');
			return blob;
		} catch (error) {
			console.error('[BurnSubtitles] ERROR occurred:', error);
			console.error('[BurnSubtitles] Error stack:', error instanceof Error ? error.stack : 'N/A');

			// Cleanup on error
			try {
				console.log('[BurnSubtitles] Attempting cleanup after error...');
				await ffmpeg.deleteFile(inputName).catch(() => {});
				await ffmpeg.deleteFile(subName).catch(() => {});
				await ffmpeg.deleteFile(outputName).catch(() => {});
			} catch (e) {
				console.error('[BurnSubtitles] Cleanup also failed:', e);
			}

			throw new Error(`Video export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	},
};

// Helper to convert File to Uint8Array
async function fetchFile(file: File): Promise<Uint8Array> {
	return new Uint8Array(await file.arrayBuffer());
}

expose(api);

export type FFmpegWorkerApi = typeof api;
