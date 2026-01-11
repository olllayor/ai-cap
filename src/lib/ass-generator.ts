import type { Word } from '../stores/caption.store';
import type { CaptionStyle } from '../stores/style.store';
import { groupWordsIntoSegments } from './caption-utils';

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

function clampByte(value: number): number {
	return Math.min(255, Math.max(0, Math.round(value)));
}

// Convert hex or rgba to ASS color &HAABBGGRR (AA = alpha, 00 opaque, FF transparent)
function toASSColor(color: string): string {
	let hex = color;
	let alpha = 1;

	// Handle rgba/rgb format
	if (color.startsWith('rgba') || color.startsWith('rgb')) {
		const numbers = color.match(/[\d.]+/g);
		if (numbers && numbers.length >= 3) {
			const r = clampByte(Number(numbers[0]));
			const g = clampByte(Number(numbers[1]));
			const b = clampByte(Number(numbers[2]));
			alpha = numbers.length >= 4 ? Math.min(1, Math.max(0, Number(numbers[3]))) : 1;
			hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b
				.toString(16)
				.padStart(2, '0')}`;
		}
	}

	// Remove #
	const clean = hex.replace('#', '');
	// Split RGB
	const r = clean.substring(0, 2);
	const g = clean.substring(2, 4);
	const b = clean.substring(4, 6);
	// ASS alpha is inverted (00 opaque, FF transparent)
	const aa = clampByte((1 - alpha) * 255).toString(16).padStart(2, '0').toUpperCase();
	// Return reversed BGR
	return `&H${aa}${b}${g}${r}`.toUpperCase();
}

function escapeASSText(text: string): string {
	// ASS override blocks use {...}; escape braces and backslashes in content.
	return text.replaceAll('\\', '\\\\').replaceAll('{', '\\{').replaceAll('}', '\\}');
}

function buildSegmentText(
	words: Word[],
	style: CaptionStyle,
	options: { activeWordIndex?: number; hideFromIndex?: number; popActive?: boolean },
): string {
	const primaryColor = toASSColor(style.textColor);
	const highlightColor = toASSColor(style.highlightColor);
	const activeWordIndex = options.activeWordIndex ?? -1;
	const hideFromIndex = options.hideFromIndex ?? -1;

	const chunks: string[] = [];
	for (let i = 0; i < words.length; i++) {
		const rawWord = style.uppercase ? words[i].word.toUpperCase() : words[i].word;
		const word = escapeASSText(rawWord);

		if (i > 0) chunks.push(' ');

		if (hideFromIndex !== -1 && i >= hideFromIndex) {
			chunks.push(`{\\alpha&HFF&}${word}`);
			continue;
		}

		if (i === activeWordIndex) {
			const parts: string[] = [];
			if (style.animation === 'highlight' || style.animation === 'karaoke') {
				parts.push(`{\\1c${highlightColor}&}`);
			}
			if (options.popActive && style.animation === 'pop') {
				parts.push('{\\fscx115\\fscy115}');
			}
			parts.push(word);
			// Reset to base style (restores primary color, outline, etc.)
			parts.push('{\\r}');
			chunks.push(parts.join(''));
		} else {
			// Ensure non-active words stay at the base primary color if a previous word changed it.
			chunks.push(`{\\1c${primaryColor}&}${word}{\\r}`);
		}
	}

	return chunks.join('');
}

/**
 * Convert hex or rgba to ASS color &HBBGGRR
 */
export function generateASS(
	transcript: Word[],
	style: CaptionStyle,
	width: number,
	height: number,
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


	const primaryColor = toASSColor(style.textColor);
	const outlineColor = toASSColor(style.outlineColor);
	const backColor = toASSColor(style.shadowColor);

	const baseline = 1080;
	const scale = Math.min(width, height) / baseline;
	const fontSize = Math.max(1, Math.round(style.fontSize * scale));
	const marginV = Math.round((style.yOffset / 100) * height);
	const marginX = Math.max(0, Math.round(((100 - style.maxWidth) / 100) * width * 0.5));

	// When font data is provided, use a generic font name that matches the file we write to FFmpeg's virtual FS.
	// This ensures libass can find the font via the fontsdir parameter without needing fontconfig.
	// When no font data is available, fall back to a system font like Arial.
	const fontName = fontData ? 'CustomFont' : 'Arial';

	const header = [
		'[Script Info]',
		'ScriptType: v4.00+',
		'WrapStyle: 0',
		'ScaledBorderAndShadow: yes',
		`PlayResX: ${width}`,
		`PlayResY: ${height}`,
		'',
		'[V4+ Styles]',
		'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding',
		`Style: Default,${fontName},${fontSize},${primaryColor},&H000000FF,${outlineColor},${backColor},${
			style.fontWeight >= 700 ? -1 : 0
		},0,0,0,100,100,0,0,1,${style.outlineWidth},${Math.round(style.shadowBlur / 2)},2,${marginX},${marginX},${Math.floor(marginV)},1`,
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

	const segments = groupWordsIntoSegments(transcript);

	const events: string[] = [];
	for (const segment of segments) {
		const words = segment.words;
		if (words.length === 0) continue;

		if (style.animation === 'none') {
			const start = formatASSTime(segment.start);
			const end = formatASSTime(segment.end);
			const text = buildSegmentText(words, style, {});
			events.push(`Dialogue: 0,${start},${end},Default,,0,0,0,,${text}`);
			continue;
		}

		if (style.animation === 'typewriter') {
			for (let i = 0; i < words.length; i++) {
				const start = formatASSTime(words[i].start);
				const nextStart = i < words.length - 1 ? words[i + 1].start : segment.end;
				const end = formatASSTime(nextStart);
				const text = buildSegmentText(words, style, { hideFromIndex: i + 1 });
				events.push(`Dialogue: 0,${start},${end},Default,,0,0,0,,${text}`);
			}
			continue;
		}

		// highlight / karaoke / pop: render whole segment, update active word styling as playback moves
		for (let i = 0; i < words.length; i++) {
			const word = words[i];
			const start = formatASSTime(word.start);
			const end = formatASSTime(word.end);
			const activeText = buildSegmentText(words, style, { activeWordIndex: i, popActive: true });
			events.push(`Dialogue: 0,${start},${end},Default,,0,0,0,,${activeText}`);

			// If there is a gap before the next word, show the segment with no active word.
			const next = i < words.length - 1 ? words[i + 1] : null;
			if (next && word.end < next.start) {
				const gapStart = formatASSTime(word.end);
				const gapEnd = formatASSTime(next.start);
				const normalText = buildSegmentText(words, style, {});
				events.push(`Dialogue: 0,${gapStart},${gapEnd},Default,,0,0,0,,${normalText}`);
			}
		}
	}

	return header + fontsSection + eventsHeader + events.join('\r\n');
}
