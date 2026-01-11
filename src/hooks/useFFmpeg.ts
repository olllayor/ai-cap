import { useState, useRef, useCallback } from 'react';
import { wrap, type Remote } from 'comlink';
import type { FFmpegWorkerApi } from '../workers/ffmpeg.worker';

import FFmpegWorker from '../workers/ffmpeg.worker?worker';

export function useFFmpeg() {
	const [isLoaded, setIsLoaded] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [loadError, setLoadError] = useState<string | null>(null);
	const workerRef = useRef<Remote<FFmpegWorkerApi> | null>(null);
	const workerInstanceRef = useRef<Worker | null>(null);

	// Lazy load FFmpeg only when first needed
	const ensureLoaded = useCallback(async () => {
		if (isLoaded) return;
		if (isLoading) {
			// Wait for existing load
			return new Promise<void>((resolve, reject) => {
				const checkInterval = setInterval(() => {
					if (isLoaded) {
						clearInterval(checkInterval);
						resolve();
					} else if (loadError) {
						clearInterval(checkInterval);
						reject(new Error(loadError));
					}
				}, 100);
			});
		}

		setIsLoading(true);
		setLoadError(null);

		try {
			// Initialize worker with Vite's explicit worker support
			const worker = new FFmpegWorker();
			
			workerInstanceRef.current = worker;
			workerRef.current = wrap<FFmpegWorkerApi>(worker);

			// Load FFmpeg core
			await workerRef.current.load();
			setIsLoaded(true);
		} catch (err) {
			console.error('Failed to load FFmpeg:', err);
			const errorMsg = err instanceof Error ? err.message : 'Unknown error';
			setLoadError(errorMsg);
			throw new Error(errorMsg);
		} finally {
			setIsLoading(false);
		}
	}, [isLoaded, isLoading, loadError]);

	const extractAudio = async (file: File): Promise<Float32Array> => {
		await ensureLoaded();
		if (!workerRef.current) {
			throw new Error('FFmpeg not loaded');
		}
		return await workerRef.current.extractAudio(file);
	};

	const burnSubtitles = async (
		file: File,
		assContent: string,
		fontData?: Uint8Array,
		fontFamily?: string,
		onProgress?: (progress: number) => void,
	): Promise<Blob> => {
		await ensureLoaded();
		if (!workerRef.current) {
			throw new Error('FFmpeg not loaded');
		}
		return await workerRef.current.burnSubtitles(file, assContent, fontData, fontFamily, onProgress);
	};

	return { isLoaded, isLoading, loadError, extractAudio, burnSubtitles };
}
