/**
 * Utility to extract font binary data from the browser's loaded stylesheets.
 * This avoids CORS/404 issues in workers by fetching fonts from the same origin 
 * as the main application.
 */

export async function getFontData(family: string): Promise<Uint8Array | null> {
  try {
    const safeFamily = family.replace(/['"]/g, '').toLowerCase();
    let fontUrl: string | null = null;
    let fallbackUrl: string | null = null;

    // 1. Search document styleSheets for @font-face rules
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        const rules = Array.from(sheet.cssRules || (sheet as any).rules);
        for (const rule of rules) {
          if (rule instanceof CSSFontFaceRule) {
            const ruleFamily = rule.style.fontFamily.replace(/['"]/g, '').toLowerCase();
            if (ruleFamily === safeFamily || ruleFamily.includes(safeFamily)) {
              // Extract ALL URLs from src
              const src = (rule.style as any).src || rule.cssText;
              const matches = Array.from(src.matchAll(/url\(["']?([^"']+)["']?\)/g));
              
              for (const match of matches as any[]) {
                const url = match[1];
                let resolvedUrl = url;
                if (!url.startsWith('http') && !url.startsWith('data:')) {
                  const base = sheet.href ? new URL(sheet.href).href : window.location.origin;
                  resolvedUrl = new URL(url, base).href;
                }

                // Prioritize TTF or OTF
                if (resolvedUrl.toLowerCase().endsWith('.ttf') || resolvedUrl.toLowerCase().endsWith('.otf')) {
                  fontUrl = resolvedUrl;
                  break;
                }
                // Store first available as fallback
                if (!fallbackUrl) fallbackUrl = resolvedUrl;
              }
            }
          }
          if (fontUrl) break;
        }
      } catch (e) {
        continue;
      }
      if (fontUrl) break;
    }

    // 2. Fallback: Guess @fontsource TTF path if we only found WOFF2
    if (!fontUrl && fallbackUrl) {
      if (fallbackUrl.includes('.woff2') || fallbackUrl.includes('.woff')) {
        // @fontsource usually has .ttf files in the same directory
        const guessedTtf = fallbackUrl.replace(/\.woff2?(\?.*)?$/, '.ttf');
        console.log(`[FontLoader] Guessing TTF fallback URL: ${guessedTtf}`);
        fontUrl = guessedTtf;
      } else {
        fontUrl = fallbackUrl;
      }
    }

    // 3. Last Resort: Default high-quality font from CDN
    if (!fontUrl) {
      console.warn(`[FontLoader] No source found for ${family}, using Inter fallback`);
      fontUrl = 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-normal.ttf';
    }

    console.log(`[FontLoader] Fetching font data from: ${fontUrl}`);
    try {
      const response = await fetch(fontUrl);
      if (!response.ok) {
        if (fontUrl !== fallbackUrl && fallbackUrl) {
          console.warn(`[FontLoader] TTF fetch failed, trying original fallback: ${fallbackUrl}`);
          const fbResponse = await fetch(fallbackUrl);
          if (fbResponse.ok) {
            const buffer = await fbResponse.arrayBuffer();
            return new Uint8Array(buffer);
          }
        }
        throw new Error(`Font fetch failed: ${response.status}`);
      }
      
      const buffer = await response.arrayBuffer();
      return new Uint8Array(buffer);
    } catch (fetchError) {
      console.error(`[FontLoader] Fetch error for ${fontUrl}:`, fetchError);
      // Try one more CDN if everything failed
      const emergencyFont = 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-normal.ttf';
      const emergencyRes = await fetch(emergencyFont);
      return emergencyRes.ok ? new Uint8Array(await emergencyRes.arrayBuffer()) : null;
    }
  } catch (error) {
    console.error(`[FontLoader] Error extracting font data for ${family}:`, error);
    return null;
  }
}
