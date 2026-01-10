import { expose } from 'comlink';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;

const api = {
  async load() {
    if (ffmpeg) return;

    ffmpeg = new FFmpeg();

    ffmpeg.on('log', ({ message }) => {
      console.log('[FFmpeg Log]', message);
    });

    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
    
    // We load the core and wasm from a CDN to avoid bundling issues for now
    // In production, you might want to serve these locally
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
  },

  async extractAudio(file: File): Promise<Float32Array> {
    if (!ffmpeg) throw new Error('FFmpeg not loaded');

    const inputName = 'input.mp4';
    const outputName = 'output.raw';

    // Write file to FFmpeg FS
    await ffmpeg.writeFile(inputName, await fetchFile(file));

    // Run extraction: 16kHz, Mono, Raw Float32 (f32le)
    await ffmpeg.exec([
      '-i', inputName,
      '-vn',           // No video
      '-c:a', 'pcm_f32le', // Float32 Little Endian (raw)
      '-ar', '16000',  // 16000 Hz sample rate (required for Whisper)
      '-ac', '1',      // Mono channel
      '-f', 'f32le',   // Force raw format
      outputName
    ]);

    // Read result
    const data = await ffmpeg.readFile(outputName);
    
    // Cleanup
    await ffmpeg.deleteFile(inputName);
    await ffmpeg.deleteFile(outputName);

    // The data is a Uint8Array of bytes representing Float32s. 
    // We need to view it as Float32Array.
    // Ensure we create a copy to avoid detached buffer issues if transferred
    // data is type of string | Uint8Array. in ffmpeg 0.12 it is Uint8Array.
    if (typeof data === 'string') {
        throw new Error('FFmpeg returned string data unexpectedly');
    }

    return new Float32Array(data.buffer);
  },

  async burnSubtitles(videoFile: File, assContent: string): Promise<Blob> {
    if (!ffmpeg) throw new Error('FFmpeg not loaded');
    
    const inputName = 'input.mp4';
    const subName = 'subs.ass';
    const outputName = 'output.mp4';
    
    // Write inputs
    await ffmpeg.writeFile(inputName, await fetchFile(videoFile));
    await ffmpeg.writeFile(subName, assContent);
    
    // Load font (Montserrat Regular as fallback/default)
    // For proper font support in WASM, we'd need to mount fonts to FS.
    // This is complex. For MVP, we use default font or try to load one.
    // To keep MVP simple, we might rely on default sans capability or map a font if available.
    // ffmpeg.wasm typically includes a basic font.
    // If we want custom fonts, we have to fetch them and write them to /fonts/
    // and configure fontconfig. That's Phase 5 polish.
    
    await ffmpeg.exec([
      '-i', inputName,
      '-vf', `ass=${subName}`,
      '-c:a', 'copy', // Copy audio without re-encoding
      outputName
    ]);
    
    const data = await ffmpeg.readFile(outputName);
    
    await ffmpeg.deleteFile(inputName);
    await ffmpeg.deleteFile(subName);
    await ffmpeg.deleteFile(outputName);
    
    return new Blob([data as any], { type: 'video/mp4' });
  }
};

// Helper to convert File to Uint8Array
async function fetchFile(file: File): Promise<Uint8Array> {
  return new Uint8Array(await file.arrayBuffer());
}

expose(api);

export type FFmpegWorkerApi = typeof api;
