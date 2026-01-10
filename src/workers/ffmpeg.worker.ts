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
      '-i', inputName,
      '-vn',           
      '-c:a', 'pcm_f32le', 
      '-ar', '16000',  
      '-ac', '1',      
      '-f', 'f32le',   
      outputName
    ]);

    const data = await ffmpeg.readFile(outputName);
    
    await ffmpeg.deleteFile(inputName);
    await ffmpeg.deleteFile(outputName);

    if (typeof data === 'string') {
        throw new Error('FFmpeg returned string data unexpectedly');
    }

    return new Float32Array(data.buffer);
  },

  async burnSubtitles(videoFile: File, assContent: string, fontData?: Uint8Array): Promise<Blob> {
    if (!ffmpeg) throw new Error('FFmpeg not loaded');
    
    const inputName = 'input.mp4';
    const subName = 'subs.ass';
    const outputName = 'output.mp4';
    
    // Parse font family to decide what to download (only used if fontData is missing)
    const fontMatch = assContent.match(/Style: Default,([^,]+),/);
    const requestedFont = fontMatch ? fontMatch[1].trim() : 'Roboto';

    const safeFontName = 'CustomFont';
    const fontFileName = 'CustomFont.ttf';

    const fontMap: Record<string, string> = {
        'Montserrat': 'https://raw.githubusercontent.com/google/fonts/main/ofl/montserrat/Montserrat-Bold.ttf',
        'Poppins': 'https://raw.githubusercontent.com/google/fonts/main/ofl/poppins/Poppins-Bold.ttf',
        'DM Sans': 'https://raw.githubusercontent.com/google/fonts/main/ofl/dmsans/DMSans-Bold.ttf', 
        'Inter': 'https://raw.githubusercontent.com/google/fonts/main/ofl/inter/Inter-Bold.ttf',
        'Instrument Sans': 'https://raw.githubusercontent.com/Instrument/instrument-sans/main/fonts/ttf/InstrumentSans-Bold.ttf',
        'Google Sans Flex': 'https://raw.githubusercontent.com/Instrument/instrument-sans/main/fonts/ttf/InstrumentSans-Bold.ttf',
        'Roboto': 'https://raw.githubusercontent.com/google/fonts/main/ofl/roboto/Roboto-Bold.ttf',
    };

    // Helper to load font from network (fallback)
    const loadFontFromNetwork = async () => {
        const fontUrl = fontMap[requestedFont] || fontMap['Roboto'];
        console.log(`[FFmpeg] Loading font via network (fallback): ${fontUrl}`);
        try {
            const response = await fetch(fontUrl, { mode: 'cors', credentials: 'omit' });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.arrayBuffer();
            await ffmpeg!.writeFile(`/${fontFileName}`, new Uint8Array(data));
            return true;
        } catch (e) {
            console.warn(`[FFmpeg] Network font load failed:`, e);
            return false;
        }
    };

    let fontLoaded = false;
    if (fontData && fontData.length > 0) {
        console.log(`[FFmpeg] Using provided font data (${fontData.length} bytes)`);
        await ffmpeg.writeFile(`/${fontFileName}`, fontData);
        fontLoaded = true;
    } else {
        fontLoaded = await loadFontFromNetwork();
    }
    
    await ffmpeg.writeFile(inputName, await fetchFile(videoFile));
    
    // REWRITE ASS: Always use "CustomFont"
    let finalAss = assContent.replace(/Style: Default,[^,]+,/g, `Style: Default,${safeFontName},`);
    
    if (!fontLoaded) {
         console.warn('[FFmpeg] No font file could be loaded. Rendering may fall back to generic sans-serif.');
    }

    await ffmpeg.writeFile(subName, finalAss);

    const fontConfig = `<?xml version=\"1.0\"?>
<!DOCTYPE fontconfig SYSTEM \"fonts.dtd\">
<fontconfig>
  <dir>/</dir>
  <match target=\"pattern\">
    <test qual=\"any\" name=\"family\"><string>${safeFontName}</string></test>
    <edit name=\"family\" mode=\"assign\" binding=\"same\"><string>${safeFontName}</string></edit>
  </match>
</fontconfig>
`;
    await ffmpeg.writeFile('/fonts.conf', fontConfig);
    
    console.log('FS State:', await ffmpeg.listDir('/'));

    try {
        await ffmpeg.exec([
          '-i', inputName,
          '-vf', `subtitles=${subName}:fontsdir=/`, 
          '-c:v', 'libx264',   
          '-preset', 'ultrafast', 
          '-crf', '23',       
          '-c:a', 'copy',   
          outputName
        ], undefined, { 
            FONTCONFIG_FILE: '/fonts.conf'
        } as any);
    } catch (execError) {
        console.error('[FFmpeg] Execution error:', execError);
    }
    
    const data = await ffmpeg.readFile(outputName); 
    
    // Cleanup FS
    try {
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(subName);
      await ffmpeg.deleteFile(outputName);
      if (fontLoaded) await ffmpeg.deleteFile(`/${fontFileName}`);
      await ffmpeg.deleteFile('/fonts.conf');
    } catch (e) { /* ignore cleanup errors */ }

    return new Blob([data as any], { type: 'video/mp4' });
  }
};

// Helper to convert File to Uint8Array
async function fetchFile(file: File): Promise<Uint8Array> {
  return new Uint8Array(await file.arrayBuffer());
}

expose(api);

export type FFmpegWorkerApi = typeof api;
