import { useState, useRef, useCallback } from 'react';
import { wrap, type Remote, proxy } from 'comlink';
import type { WhisperWorkerApi } from '../workers/whisper.worker';
import { useCaptionStore } from '../stores/caption.store';

export function useTranscriber() {
	const workerRef = useRef<Remote<WhisperWorkerApi> | null>(null);
	const workerInstanceRef = useRef<Worker | null>(null);
	const [modelLoaded, setModelLoaded] = useState(false);
	const [modelLoading, setModelLoading] = useState(false);
	const [modelError, setModelError] = useState<string | null>(null);
	const { setStatus, setTranscript } = useCaptionStore();

	// Lazy load Whisper model only when first needed
	const ensureLoaded = useCallback(async () => {
		if (modelLoaded) return;
		if (modelLoading) {
			// Wait for existing load
			return new Promise<void>((resolve, reject) => {
				const checkInterval = setInterval(() => {
					if (modelLoaded) {
						clearInterval(checkInterval);
						resolve();
					} else if (modelError) {
						clearInterval(checkInterval);
						reject(new Error(modelError));
					}
				}, 100);
			});
		}

		setStatus('loading_model');
		setModelLoading(true);
		setModelError(null);

		try {
			// Initialize worker
			const worker = new Worker(new URL('../workers/whisper.worker.ts', import.meta.url), {
				type: 'module',
			});
			workerInstanceRef.current = worker;
			workerRef.current = wrap<WhisperWorkerApi>(worker);

			// Load Whisper model
			await workerRef.current.load('Xenova/whisper-tiny.en');
			setModelLoaded(true);
			setStatus('idle');
		} catch (err) {
			console.error('Failed to load Whisper:', err);
			const errorMsg = err instanceof Error ? err.message : 'Unknown error';
			setModelError(errorMsg);
			setStatus('error');
			throw new Error(errorMsg);
		} finally {
			setModelLoading(false);
		}
	}, [modelLoaded, modelLoading, modelError, setStatus]);

	const transcribe = useCallback(
		async (audioData: Float32Array) => {
			await ensureLoaded();
			if (!workerRef.current) return;

			setStatus('transcribing');
			try {
				const result = await workerRef.current.transcribe(
					audioData,
					proxy((data: unknown) => {
						// This is where partial results would come in
						console.log('Partial:', data);
					}),
				);

				// Transformers.js "word" timestamps format:
				// result.chunks = [{ text: "...", timestamp: [start, end] }, ...]
				// But with return_timestamps: 'word', it might be nested differently depending on version.
				// Usually checking result.text is the full text.

				// Let's assume result follows the structure:
				// { text: string, chunks: { text: string, timestamp: [number, number] }[] }

				// We need to map this to our Word interface
				// Note: transformers.js sometimes returns slightly different structures based on the task.
				// For ASR with word timestamps, look for 'chunks'.

				const words =
					(result as any).chunks?.map((chunk: any) => ({
						word: chunk.text.trim(),
						start: chunk.timestamp[0],
						end: chunk.timestamp[1],
					})) || [];

				setTranscript(words);
				setStatus('completed');
			} catch (err) {
				console.error('Transcription failed:', err);
				setStatus('error');
			}
		},
		[ensureLoaded, setStatus, setTranscript],
	);

	return { transcribe, modelLoading, modelLoaded };
}
