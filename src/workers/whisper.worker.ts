import { expose } from 'comlink';
import { pipeline, env, Pipeline } from '@huggingface/transformers';

// Skip local check for now
env.allowLocalModels = false;

// Singleton pipeline instance
let transcriber: Pipeline | null = null;

const api = {
	async load(modelName: string = 'Xenova/whisper-tiny.en') {
		if (transcriber) return;

		// Callback for download progress handled via a separate channel if needed,
		// or we can pass a callback proxy (comlink supports it).
		// For MVP we just await loading.

		console.log('Loading Whisper model:', modelName);

		// Load pipeline with simple call to avoid complex type inference
		// @ts-expect-error - quantized option is valid but types are complex
		transcriber = await pipeline('automatic-speech-recognition', modelName);

		console.log('Whisper model loaded');
	},

	async transcribe(audio: Float32Array, language: string, onProgress?: (data: any) => void) {
		if (!transcriber) throw new Error('Transcriber not loaded');

        console.log(`[Worker] Transcribing with language: ${language}`);

		// Audio is already raw Float32Array, 16kHz mono.
		// We can pass it directly to the pipeline.

        const options: any = {
			return_timestamps: 'word',
			chunk_length_s: 30,
			stride_length_s: 5,
			callback_function: (item: any) => {
				if (onProgress) onProgress(item);
			},
		};

        if (language && language !== 'auto') {
            options.language = language;
            options.task = 'transcribe'; // Force transcribe task when language is set
        }

		const output = await transcriber(audio, options);

		return output;
	},
};

expose(api);

export type WhisperWorkerApi = typeof api;
