import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// Remove Umami script from HTML (will be loaded dynamically to avoid COEP/COOP conflicts)
function umamiPlugin() {
	return {
		name: 'umami-remove',
		transformIndexHtml(html: string) {
			// Try to load environment variables manually since Vite's auto-loading isn't working
			let umamiId = process.env.VITE_UMAMI_WEBSITE_ID;

			// If not found, try to read from .env files directly
			if (!umamiId) {
				const envPaths = ['.env', '.env.local', '.env.production'];
				for (const envPath of envPaths) {
					const fullPath = resolve(process.cwd(), envPath);
					if (existsSync(fullPath)) {
						try {
							const envContent = readFileSync(fullPath, 'utf-8');
							const match = envContent.match(/VITE_UMAMI_WEBSITE_ID=(.+)/);
							if (match) {
								umamiId = match[1].trim();
								break;
							}
						} catch (error) {
							console.warn(`Failed to read ${envPath}:`, error);
						}
					}
				}
			}

			if (umamiId) {
				console.log('✅ [Umami] VITE_UMAMI_WEBSITE_ID is set. Script will be loaded dynamically.');
				// Remove the script tag since we'll load it dynamically
				return html.replace(/<!-- Umami Analytics[^>]*-->\s*<script defer src="https:\/\/cloud\.umami\.is\/script\.js"[^>]*><\/script>\n\s+/, '');
			}
			// If no ID provided, remove the script tag entirely
			console.warn('⚠️  [Umami] VITE_UMAMI_WEBSITE_ID is not set. Analytics script will be removed.');
			return html.replace(/<!-- Umami Analytics[^>]*-->\s*<script defer src="https:\/\/cloud\.umami\.is\/script\.js"[^>]*><\/script>\n\s+/, '');
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
