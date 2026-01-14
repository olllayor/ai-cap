import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Inject Umami ID into HTML if provided
function umamiPlugin() {
	return {
		name: 'umami-inject',
		transformIndexHtml(html: string) {
			const umamiId = process.env.VITE_UMAMI_WEBSITE_ID;
			if (umamiId) {
				return html.replace('data-website-id="__UMAMI_ID__"', `data-website-id="${umamiId}"`);
			}
			// If no ID provided, remove the script tag entirely
			console.warn('⚠️  [Umami] VITE_UMAMI_WEBSITE_ID is not set. Analytics script will be removed.');
			return html.replace(/<script defer src="https:\/\/cloud\.umami\.is\/script\.js"[^>]*><\/script>\n\s+/, '');
		},
	};
}

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss(), umamiPlugin()],

	// Required for ffmpeg.wasm (SharedArrayBuffer)
	server: {
		headers: {
			'Cross-Origin-Opener-Policy': 'same-origin',
			'Cross-Origin-Embedder-Policy': 'require-corp',
		},
		allowedHosts: ['caption.jprq.live'],
	},

	// Optimize chunking for large dependencies
	build: {
		rollupOptions: {
			output: {
				manualChunks: {
					ffmpeg: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],
					transformers: ['@huggingface/transformers'],
				},
			},
		},
	},

	// Enable Web Worker support
	worker: {
		format: 'es',
	},

	optimizeDeps: {
		exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],
	},
});
