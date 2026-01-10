import { useEffect, useState, useRef } from 'react';
import { wrap, type Remote } from 'comlink';
import type { FFmpegWorkerApi } from '../workers/ffmpeg.worker';

export function useFFmpeg() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const workerRef = useRef<Remote<FFmpegWorkerApi> | null>(null);

  useEffect(() => {
    // Initialize worker
    const worker = new Worker(new URL('../workers/ffmpeg.worker.ts', import.meta.url), {
      type: 'module',
    });
    
    workerRef.current = wrap<FFmpegWorkerApi>(worker);

    // Initial load
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        await workerRef.current?.load();
        setIsLoaded(true);
      } catch (err) {
        console.error('Failed to load FFmpeg:', err);
        setLoadError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    load();

    return () => {
      worker.terminate();
    };
  }, []);

  const extractAudio = async (file: File): Promise<Float32Array> => {
    if (!workerRef.current || !isLoaded) {
      throw new Error('FFmpeg not loaded');
    }
    return await workerRef.current.extractAudio(file);
  };

  const burnSubtitles = async (file: File, assContent: string, fontData?: Uint8Array): Promise<Blob> => {
    if (!workerRef.current || !isLoaded) {
      throw new Error('FFmpeg not loaded');
    }
    return await workerRef.current.burnSubtitles(file, assContent, fontData);
  };

  return { isLoaded, isLoading, loadError, extractAudio, burnSubtitles };
}
