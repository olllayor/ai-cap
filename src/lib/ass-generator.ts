import type { Word } from '../stores/caption.store';
import type { CaptionStyle } from '../stores/style.store';

// Helper to format time for ASS: H:MM:SS.cs
function formatASSTime(seconds: number): string {
	const date = new Date(0);
	date.setMilliseconds(seconds * 1000);
	const h = date.getUTCHours();
	const m = date.getUTCMinutes().toString().padStart(2, '0');
	const s = date.getUTCSeconds().toString().padStart(2, '0');
	const cs = Math.floor(date.getUTCMilliseconds() / 10)
		.toString()
		.padStart(2, '0');

	return `${h}:${m}:${s}.${cs}`;
}

// Convert hex or rgba to ASS color &HBBGGRR
function toASSColor(color: string): string {
	let hex = color;

	// Handle rgba/rgb format
	if (color.startsWith('rgba') || color.startsWith('rgb')) {
		const match = color.match(/\d+/g);
		if (match && match.length >= 3) {
			const r = parseInt(match[0]).toString(16).padStart(2, '0');
			const g = parseInt(match[1]).toString(16).padStart(2, '0');
			const b = parseInt(match[2]).toString(16).padStart(2, '0');
			hex = `#${r}${g}${b}`;
		}
	}

	// Remove #
	const clean = hex.replace('#', '');
	// Split RGB
	const r = clean.substring(0, 2);
	const g = clean.substring(2, 4);
	const b = clean.substring(4, 6);
	// Return reversed BGR
	return `&H00${b}${g}${r}`;
}


/**
 * Convert hex or rgba to ASS color &HBBGGRR
 */
export function generateASS(
	transcript: Word[],
	style: CaptionStyle,
	width: number,
	height: number,
	fontData?: Uint8Array,
): string {
	// 1. Header
	// 2. Styles
	// 3. Fonts (embedded)
	// 4. Events

	console.log('[ASS Generator] Input resolution:', { width, height });
	console.log('[ASS Generator] Input colors:', {
		textColor: style.textColor,
		outlineColor: style.outlineColor,
		shadowColor: style.shadowColor,
	});
	console.log('[ASS Generator] Font data available:', !!fontData, fontData ? `${fontData.byteLength} bytes` : 'null');

	const primaryColor = toASSColor(style.textColor);
	const outlineColor = toASSColor(style.outlineColor);
	const backColor = toASSColor(style.shadowColor);

	// Scale font size properly based on video height
	const baseHeight = 1080;
	const fontSize = Math.round(style.fontSize * 2.2 * (height / baseHeight));
	const marginV = Math.round((style.yOffset / 100) * height);

	// In the virtual FS approach, we'll map the actual font data to a generic name 
	// or ensure the name matches exactly. For robustness, we'll use the family name.
	const fontName = style.fontFamily;

	const header = [
		'[Script Info]',
		'ScriptType: v4.00+',
		`PlayResX: ${width}`,
		`PlayResY: ${height}`,
		'',
		'[V4+ Styles]',
		'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding',
		`Style: Default,${fontName},${fontSize},${primaryColor},&H000000FF,${outlineColor},${backColor},${
			style.fontWeight >= 700 ? -1 : 0
		},0,0,0,100,100,0,0,1,${style.outlineWidth},${style.shadowBlur},2,10,10,${Math.floor(marginV)},1`,
		'',
	].join('\r\n');

	// We no longer embed the font data directly in the ASS file.
	// This makes the script cleaner and rendering more robust via FFmpeg's virtual FS.
	const fontsSection = '';

	const eventsHeader = [
		'[Events]',
		'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text',
		'',
	].join('\r\n');

	const events = transcript
		.map((word) => {
			const start = formatASSTime(word.start);
			const end = formatASSTime(word.end);

			let text = word.word;

			if (style.animation === 'highlight' || style.animation === 'karaoke') {
				const hColor = toASSColor(style.highlightColor);
				text = `{\\c${hColor}}${text}`;
			}

			if (style.uppercase) {
				text = text.toUpperCase();
			}

			return `Dialogue: 0,${start},${end},Default,,0,0,0,,${text}`;
		})
		.join('\r\n');

	return header + fontsSection + eventsHeader + events;
}
