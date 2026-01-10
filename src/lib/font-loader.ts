/**
 * Utility to extract font binary data from the browser's loaded stylesheets.
 * This avoids CORS/404 issues in workers by fetching fonts from the same origin 
 * as the main application.
 */

export async function getFontData(family: string): Promise<Uint8Array | null> {
  try {
    const safeFamily = family.replace(/['"]/g, '').toLowerCase();
    let fontUrl: string | any;

    // 1. Search document styleSheets for the @font-face rule
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        const rules = Array.from(sheet.cssRules || (sheet as any).rules);
        for (const rule of rules) {
          if (rule instanceof CSSFontFaceRule) {
            const ruleFamily = rule.style.fontFamily.replace(/['"]/g, '').toLowerCase();
            if (ruleFamily === safeFamily || ruleFamily.includes(safeFamily)) {
              // Extract URL from src string, e.g., url("...") format(...)
              // We cast to any because TS might not recognize 'src' on all versions of CSSStyleDeclaration
              const src = (rule.style as any).src || rule.cssText;
              const match = src.match(/url\(["']?([^"']+)["']?\)/);
              if (match && match[1]) {
                fontUrl = match[1];
                // If it's a relative URL, resolve it
                if (!fontUrl.startsWith('http') && !fontUrl.startsWith('data:')) {
                  const base = sheet.href ? new URL(sheet.href).href : window.location.origin;
                  fontUrl = new URL(fontUrl, base).href;
                }
                break;
              }
            }
          }
        }
      } catch (e) {
        // Cross-origin stylesheet access might be blocked
        continue;
      }
      if (fontUrl) break;
    }

    if (!fontUrl) {
      console.warn(`[FontLoader] Could not find @font-face rule for family: ${family}`);
      return null;
    }

    console.log(`[FontLoader] Fetching font data from: ${fontUrl}`);
    const response = await fetch(fontUrl);
    if (!response.ok) throw new Error(`Font fetch failed: ${response.status}`);
    
    const buffer = await response.arrayBuffer();
    return new Uint8Array(buffer);
  } catch (error) {
    console.error(`[FontLoader] Error extracting font data for ${family}:`, error);
    return null;
  }
}
