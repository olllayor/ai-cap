import type { Word } from '../stores/caption.store';

export interface CaptionSegment {
  id: string;
  words: Word[];
  text: string;
  start: number;
  end: number;
}

/**
 * Groups words into natural subtitle segments based on time gaps and length.
 */
export function groupWordsIntoSegments(words: Word[], maxChars: number = 40, maxGap: number = 0.5): CaptionSegment[] {
  const segments: CaptionSegment[] = [];
  let currentWords: Word[] = [];
  let currentTextLength = 0;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const prevWord = i > 0 ? words[i - 1] : null;
    
    // Check for gap (silence/pause)
    const timeGap = prevWord ? word.start - prevWord.end : 0;
    
    // Determine if we should split
    const shouldSplit = 
      (currentWords.length > 0 && timeGap > maxGap) || // Significant pause
      (currentTextLength + word.word.length > maxChars) || // Too long for one line
      (word.word.match(/[.!?]$/)); // Sentence ending punctuation

    if (shouldSplit && currentWords.length > 0) {
      // Push current segment
      segments.push(createSegment(currentWords, segments.length));
      currentWords = [];
      currentTextLength = 0;
    }

    currentWords.push(word);
    currentTextLength += word.word.length + 1; // +1 for space
  }

  // Push lingering words
  if (currentWords.length > 0) {
    segments.push(createSegment(currentWords, segments.length));
  }

  return segments;
}

function createSegment(words: Word[], index: number): CaptionSegment {
  return {
    id: `${words[0].start}-${words[words.length-1].end}-${index}`,
    words: words,
    text: words.map(w => w.word).join(' '),
    start: words[0].start,
    end: words[words.length - 1].end
  };
}
