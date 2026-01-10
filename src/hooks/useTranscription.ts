import { useEffect, useState, useRef, useCallback } from 'react';
import { wrap, type Remote, proxy } from 'comlink';
import type { WhisperWorkerApi } from '../workers/whisper.worker';
import { useCaptionStore } from '../stores/caption.store';

export function useTranscriber() {
  const workerRef = useRef<Remote<WhisperWorkerApi> | null>(null);
  const [modelLoading, setModelLoading] = useState(false);
  const { setStatus, setTranscript } = useCaptionStore();

  useEffect(() => {
    const worker = new Worker(new URL('../workers/whisper.worker.ts', import.meta.url), {
      type: 'module',
    });
    
    workerRef.current = wrap<WhisperWorkerApi>(worker);

    const init = async () => {
      setStatus('loading_model');
      setModelLoading(true);
      try {
        // Use whisper-tiny.en as requested by user
        await workerRef.current?.load('Xenova/whisper-tiny.en');
        setStatus('idle');
      } catch (err) {
        console.error('Failed to load Whisper:', err);
        setStatus('error');
      } finally {
        setModelLoading(false);
      }
    };

    init();

    return () => {
      worker.terminate();
    };
  }, [setStatus]);

  const transcribe = useCallback(async (audioData: Float32Array) => {
    if (!workerRef.current) return;

    setStatus('transcribing');
    try {
      const result = await workerRef.current.transcribe(audioData, proxy((data: unknown) => {
        // This is where partial results would come in
        console.log('Partial:', data);
      }));

      // Transformers.js "word" timestamps format:
      // result.chunks = [{ text: "...", timestamp: [start, end] }, ...]
      // But with return_timestamps: 'word', it might be nested differently depending on version.
      // Usually checking result.text is the full text.
      
      // Let's assume result follows the structure: 
      // { text: string, chunks: { text: string, timestamp: [number, number] }[] }
      
      // We need to map this to our Word interface
      // Note: transformers.js sometimes returns slightly different structures based on the task.
      // For ASR with word timestamps, look for 'chunks'.
      
      const words = (result as any).chunks?.map((chunk: any) => ({
        word: chunk.text.trim(),
        start: chunk.timestamp[0],
        end: chunk.timestamp[1]
      })) || [];

      setTranscript(words);
      setStatus('completed');
    } catch (err) {
      console.error('Transcription failed:', err);
      setStatus('error');
    }
  }, [setStatus, setTranscript]);

  return { transcribe, modelLoading };
}
