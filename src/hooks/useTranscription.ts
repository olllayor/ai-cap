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
	// Track which model is currently loaded
	const [loadedModel, setLoadedModel] = useState<string | null>(null);
	
	const { setStatus, setTranscript, selectedModel, selectedLanguage } = useCaptionStore();

	// Lazy load Whisper model only when first needed
	const ensureLoaded = useCallback(async () => {
		// If the correct model is already loaded, we are good
		if (modelLoaded && loadedModel === selectedModel) return;

		// If we are loading, wait... (basic locking, could be improved)
		if (modelLoading) {
			return new Promise<void>((resolve, reject) => {
				const checkInterval = setInterval(() => {
					if (modelLoaded && loadedModel === selectedModel) {
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
			// If a different model was loaded (or worker exists), terminate it to free memory
			if (workerInstanceRef.current) {
				console.log('Terminating previous worker...');
				workerInstanceRef.current.terminate();
				workerInstanceRef.current = null;
				workerRef.current = null;
				setModelLoaded(false);
			}

			// Initialize worker
			const worker = new Worker(new URL('../workers/whisper.worker.ts', import.meta.url), {
				type: 'module',
			});
			workerInstanceRef.current = worker;
			workerRef.current = wrap<WhisperWorkerApi>(worker);

			// Load Whisper model
			console.log(`Loading model: ${selectedModel}`);
			await workerRef.current.load(selectedModel);
			
			setLoadedModel(selectedModel);
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
	}, [modelLoaded, loadedModel, selectedModel, modelLoading, modelError, setStatus]);

	const transcribe = useCallback(
		async (audioData: Float32Array) => {
			await ensureLoaded();
			if (!workerRef.current) return;

			setStatus('transcribing');
			try {
				const result = await workerRef.current.transcribe(
					audioData,
					selectedLanguage || 'auto',
					proxy((data: unknown) => {
						// This is where partial results would come in
						console.log('Partial:', data);
					}),
				);

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
		[ensureLoaded, setStatus, setTranscript, selectedLanguage],
	);

	return { transcribe, modelLoading, modelLoaded };
}
