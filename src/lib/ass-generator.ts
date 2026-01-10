import type { Word } from '../stores/caption.store';
import type { CaptionStyle } from '../stores/style.store';

// Helper to format time for ASS: H:MM:SS.cs
function formatASSTime(seconds: number): string {
  const date = new Date(0);
  date.setMilliseconds(seconds * 1000);
  const h = date.getUTCHours();
  const m = date.getUTCMinutes().toString().padStart(2, '0');
  const s = date.getUTCSeconds().toString().padStart(2, '0');
  const cs = Math.floor(date.getUTCMilliseconds() / 10).toString().padStart(2, '0');
  
  return `${h}:${m}:${s}.${cs}`;
}

// Convert hex to ASS color &HBBGGRR
function toASSColor(hex: string): string {
  // Remove #
  const clean = hex.replace('#', '');
  // Split RGB
  const r = clean.substring(0, 2);
  const g = clean.substring(2, 4);
  const b = clean.substring(4, 6);
  // Return reversed BGR
  return `&H00${b}${g}${r}`;
}

export function generateASS(transcript: Word[], style: CaptionStyle): string {
  // 1. Header
  // 2. Styles
  // 3. Events

  const primaryColor = toASSColor(style.textColor);
  const outlineColor = toASSColor(style.outlineColor);
  const backColor = toASSColor(style.shadowColor);
  
  // Calculate vertical margin from bottom %
  // ASS uses alignment 2 (bottom center), so MarginV puts it up from bottom
  // Assuming 1080p video as reference for font size scaling if needed, 
  // but usually font size is absolute. Let's assume generic playres.
  // We'll set PlayResY=1080 to make pixel sizes predictable.
  const playResY = 1080;
  // Map font size roughly
  const fontSize = style.fontSize * (playResY / 400); // 400 is arbitrary viewport reference
  const marginV = (style.yOffset / 100) * playResY;

  const header = `[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: ${playResY}

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,${style.fontFamily},${fontSize},${primaryColor},&H000000FF,${outlineColor},${backColor},${style.fontWeight >= 700 ? -1 : 0},0,0,0,100,100,0,0,1,${style.outlineWidth},${style.shadowBlur},2,10,10,${Math.floor(marginV)},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  const events = transcript.map(word => {
    const start = formatASSTime(word.start);
    const end = formatASSTime(word.end);
    
    // Animation Logic
    let text = word.word;
    
    // Simple Pop/Highlight via distinct events per word is natural here since 
    // we iterate word by word.
    
    // If Highlight animation, we can use a different style for specific words 
    // or overriding tags. For MVP, we apply the "Highlight Color" to ALL words
    // because "active words" is what we are rendering.
    // Wait, usually highlight means "karaoke active word is color X, rest is color Y".
    // Since we only show ONE word at a time (or short segment),
    // they are by definition "active".
    
    // So if style.animation === 'highlight', we can just use the highlight color 
    // as primary color or apply a tag.
    
    if (style.animation === 'highlight' || style.animation === 'karaoke') {
      const hColor = toASSColor(style.highlightColor);
      // Override primary color with highlight color
      text = `{\\c${hColor}}${text}`;
    }
    
    if (style.uppercase) {
      text = text.toUpperCase();
    }
    
    if (style.animation === 'pop') {
       // Simple scaling not easily done in vanilla ASS without complex transforms
       // but we can fake it or just ignore for MVP burn-in simplicity.
       // Transforms: {\t(0,150,\fscx115\fscy115)\t(150,300,\fscx100\fscy100)}
       // This is complex to get right per word duration.
    }

    return `Dialogue: 0,${start},${end},Default,,0,0,0,,${text}`;
  }).join('\n');

  return header + events;
}
