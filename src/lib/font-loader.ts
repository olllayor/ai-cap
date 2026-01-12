/**
 * Utility to extract font binary data from the browser's loaded stylesheets.
 * This avoids CORS/404 issues in workers by fetching fonts from the same origin 
 * as the main application.
 */

export interface FontFetchResult {
	data: Uint8Array | null;
	family: string;
}

type FontVariant = { minWeight: number; url: string };
type BundledFont = { family: string; variants: FontVariant[] };

const FALLBACK_FONT = {
	family: 'Noto Sans',
	// Served from /public/fonts/noto-sans.ttf
	get url() {
		return new URL('/fonts/noto-sans.ttf', window.location.origin).href;
	},
};

function assetUrl(pathname: string): string {
	return new URL(pathname, window.location.origin).href;
}

const BUNDLED_FONTS: Record<string, BundledFont> = {
	'inter': {
		family: 'Inter',
		variants: [{ minWeight: 0, url: assetUrl('/fonts/inter.ttf') }],
	},

	'montserrat': {
		family: 'Montserrat',
		variants: [{ minWeight: 0, url: assetUrl('/fonts/montserrat.ttf') }],
	},
	'noto sans': {
		family: FALLBACK_FONT.family,
		variants: [{ minWeight: 0, url: FALLBACK_FONT.url }],
	},
	'poppins': {
		family: 'Poppins',
		variants: [
			{ minWeight: 900, url: assetUrl('/fonts/poppins-black.ttf') },
			{ minWeight: 700, url: assetUrl('/fonts/poppins-bold.ttf') },
			{ minWeight: 0, url: assetUrl('/fonts/poppins-regular.ttf') },
		],
	},
	'instrument sans': {
		family: 'Instrument Sans',
		variants: [{ minWeight: 0, url: assetUrl('/fonts/instrument-sans.ttf') }],
	},
	'google sans flex': {
		family: 'Google Sans Flex',
		variants: [{ minWeight: 0, url: assetUrl('/fonts/google-sans-flex.ttf') }],
	},
	'geist sans': {
		family: 'Geist Sans',
		variants: [{ minWeight: 0, url: assetUrl('/fonts/geist-sans.ttf') }],
	},
	'sans-serif': {
		family: FALLBACK_FONT.family,
		variants: [{ minWeight: 0, url: FALLBACK_FONT.url }],
	},
};

function resolveBundledFont(family: string, weight?: number): { family: string; url: string } | null {
	const key = family.replace(/['"]/g, '').toLowerCase().trim();
	const bundled = BUNDLED_FONTS[key];
	if (!bundled) return null;

	const desiredWeight = weight ?? 400;
	const variant = [...bundled.variants].sort((a, b) => b.minWeight - a.minWeight).find((v) => desiredWeight >= v.minWeight);
	return { family: bundled.family, url: variant?.url ?? bundled.variants[bundled.variants.length - 1].url };
}

function isLikelyFontBinary(data: Uint8Array): boolean {
	// TTF: 0x00010000, 'true', 'typ1'
	// OTF: 'OTTO'
	// WOFF: 'wOFF' (unsupported by libass/ffmpeg.wasm build in this app)
	// WOFF2: 'wOF2'
	if (data.byteLength < 4) return false;
	const b0 = data[0];
	const b1 = data[1];
	const b2 = data[2];
	const b3 = data[3];

	// 0x00010000
	if (b0 === 0x00 && b1 === 0x01 && b2 === 0x00 && b3 === 0x00) return true;

	// 'OTTO'
	if (b0 === 0x4f && b1 === 0x54 && b2 === 0x54 && b3 === 0x4f) return true;

	// 'true' or 'typ1'
	if (b0 === 0x74 && b1 === 0x72 && b2 === 0x75 && b3 === 0x65) return true;
	if (b0 === 0x74 && b1 === 0x79 && b2 === 0x70 && b3 === 0x31) return true;

	// Explicitly reject WOFF/WOFF2
	if (b0 === 0x77 && b1 === 0x4f && b2 === 0x46 && b3 === 0x46) return false;
	if (b0 === 0x77 && b1 === 0x4f && b2 === 0x46 && b3 === 0x32) return false;

	return false;
}

export async function getFontData(family: string, weight?: number): Promise<FontFetchResult> {
	console.log(`[FontLoader] getFontData called for family: "${family}", weight: ${weight}`);
	try {
		const safeFamily = family.replace(/['"]/g, '').toLowerCase();
		let fontUrl: string | null = null;
		let fallbackUrl: string | null = null;
		let resolvedFamily = family;

		// 0. Prefer bundled TTFs for known families to match preview fonts reliably.
		const bundled = resolveBundledFont(family, weight);
		if (bundled) {
			fontUrl = bundled.url;
			resolvedFamily = bundled.family;
		}

		// 1. Search document styleSheets for @font-face rules
		for (const sheet of Array.from(document.styleSheets)) {
			try {
				const rules = Array.from(sheet.cssRules ?? []);
				for (const rule of rules) {
					if (rule instanceof CSSFontFaceRule) {
						const ruleFamily = rule.style.fontFamily.replace(/['"]/g, '').toLowerCase();
						if (ruleFamily === safeFamily || ruleFamily.includes(safeFamily)) {
							// Extract ALL URLs from src
							const src = rule.style.getPropertyValue('src') || rule.cssText;
							const matches = Array.from(src.matchAll(/url\(["']?([^"')]+)["']?\)/g));

							for (const match of matches) {
								const url = match[1];
								let resolvedUrl = url;
								if (!url.startsWith('http') && !url.startsWith('data:')) {
									const base = sheet.href ? new URL(sheet.href).href : window.location.origin;
									resolvedUrl = new URL(url, base).href;
								}

								const lower = resolvedUrl.toLowerCase();
								if (lower.endsWith('.ttf') || lower.endsWith('.otf')) {
									fontUrl = resolvedUrl;
									break;
								}
								if (!fallbackUrl) fallbackUrl = resolvedUrl;
							}
						}
					}
					if (fontUrl) break;
				}
			} catch {
				continue;
			}
			if (fontUrl) break;
		}

		// 2. Fallback: if only WOFF/WOFF2 was found, try guessing a TTF sibling
		if (!fontUrl && fallbackUrl) {
			const lower = fallbackUrl.toLowerCase();
			// libass in ffmpeg.wasm can't load WOFF/WOFF2. If the page only provides webfonts, we must fall back.
			if (lower.includes('.woff2') || lower.includes('.woff') || lower.includes('font/woff')) {
				console.warn(`[FontLoader] ${family} provides WOFF/WOFF2 only; using fallback ${FALLBACK_FONT.family} for export.`);
				fontUrl = FALLBACK_FONT.url;
				resolvedFamily = FALLBACK_FONT.family;
			} else {
				fontUrl = fallbackUrl;
			}
		}

		// 3. Last Resort: Use bundled TTF to guarantee a usable font for libass
		if (!fontUrl) {
			console.warn(`[FontLoader] No TTF/OTF source found for ${family}, using fallback ${FALLBACK_FONT.family}`);
			fontUrl = FALLBACK_FONT.url;
			resolvedFamily = FALLBACK_FONT.family;
		}

		const fetchFontBinary = async (url: string): Promise<Uint8Array> => {
			console.log(`[FontLoader] Fetching font data from: ${url}`);
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`Font fetch failed: ${response.status}`);
			}
			const buffer = await response.arrayBuffer();
			const data = new Uint8Array(buffer);
			
			// Guard against dev-server 404 HTML or other non-font responses (common with guessed .ttf URLs)
			// Also guard against WOFF/WOFF2 which libass cannot read
			if (!isLikelyFontBinary(data) || data.byteLength < 10_000) {
				throw new Error(`Invalid font binary (${data.byteLength} bytes) from ${url}`);
			}
			return data;
		};

		try {
			const data = await fetchFontBinary(fontUrl);
			// Double check if we accidentally got a WOFF/WOFF2 that slipped through generic checks (unlikely but safe)
			// isLikelyFontBinary already rejects generic WOFF signatures
			return { data, family: resolvedFamily };
		} catch (fetchError) {
			console.warn(`[FontLoader] Primary font failed (${fontUrl}):`, fetchError);
			
			// Force fallback to Noto Sans
			if (fontUrl !== FALLBACK_FONT.url) {
				console.log(`[FontLoader] Attempting fallback to ${FALLBACK_FONT.family}...`);
				try {
					const data = await fetchFontBinary(FALLBACK_FONT.url);
					return { data, family: FALLBACK_FONT.family };
				} catch (fallbackError) {
					console.error('[FontLoader] Fallback font fetch also failed:', fallbackError);
				}
			}
			return { data: null, family: resolvedFamily };
		}
	} catch (error) {
		console.error(`[FontLoader] Error extracting font data for ${family}:`, error);
		// Last ditch effort: try to return fallback details even if the main logic crashed
		return { data: null, family };
	}
}
