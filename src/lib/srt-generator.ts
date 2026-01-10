import type { Word } from '../stores/caption.store';

function formatTime(seconds: number): string {
  const date = new Date(0);
  date.setMilliseconds(seconds * 1000);
  const hh = date.getUTCHours().toString().padStart(2, '0');
  const mm = date.getUTCMinutes().toString().padStart(2, '0');
  const ss = date.getUTCSeconds().toString().padStart(2, '0');
  const ms = date.getUTCMilliseconds().toString().padStart(3, '0');
  
  return `${hh}:${mm}:${ss},${ms}`;
}

export function generateSRT(transcript: Word[]): string {
  return transcript.map((word, index) => {
    return `${index + 1}
${formatTime(word.start)} --> ${formatTime(word.end)}
${word.word}

`;
  }).join('').trim();
}

export function downloadSRT(transcript: Word[], filename: string = 'captions.srt') {
  const content = generateSRT(transcript);
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
