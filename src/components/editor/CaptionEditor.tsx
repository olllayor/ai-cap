import React, { useMemo } from 'react';
import { useCaptionStore } from '../../stores/caption.store';
import { CaptionItem } from './CaptionItem';
import { groupWordsIntoSegments } from '../../lib/caption-utils';
import { Clock } from 'lucide-react';

interface CaptionEditorProps {
  currentTime: number;
}

export function CaptionEditor({ currentTime }: CaptionEditorProps) {
  const { transcript, setTranscript } = useCaptionStore();

  const handleUpdateWord = (index: number, newWord: any) => {
    const newTranscript = [...transcript];
    newTranscript[index] = newWord;
    setTranscript(newTranscript);
  };

  // Group words into segments for easier navigation
  const segments = useMemo(() => {
    return groupWordsIntoSegments(transcript);
  }, [transcript]);

  return (
    <div className="flex flex-col h-full bg-[var(--color-bg-secondary)]">
      {/* Timeline Header / Tools (Optional, maybe add zoom later) */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--color-border)] bg-[var(--color-bg-tertiary)]/50">
        <h3 className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">
           Timeline Track
        </h3>
        <span className="text-xs text-[var(--color-text-muted)] font-mono">
           {segments.length} Segments
        </span>
      </div>
      
      {/* Timeline Track Area */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar">
        <div className="flex items-center h-full px-4 gap-4 min-w-max">
          {transcript.length === 0 ? (
            <div className="flex items-center justify-center w-full text-[var(--color-text-muted)] opacity-50">
              <p>No captions yet. Generate them first!</p>
            </div>
          ) : (
            segments.map((segment) => {
               // Find indices of words in this segment
               const startIndex = transcript.indexOf(segment.words[0]);
               const isActive = currentTime >= segment.start && currentTime <= segment.end;
               
               return (
                 <div 
                   key={segment.id} 
                   id={`segment-${segment.id}`}
                   className={`
                     relative flex flex-col w-[300px] h-[200px] shrink-0
                     rounded-xl border transition-all duration-200
                     ${isActive 
                       ? 'bg-[var(--color-bg-tertiary)] border-[var(--color-accent-primary)] shadow-lg ring-1 ring-[var(--color-accent-primary)]' 
                       : 'bg-[var(--color-bg-tertiary)]/50 border-[var(--color-border)] hover:border-[var(--color-border-hover)]'}
                   `}
                 >
                   {/* Segment Header (Time) */}
                   <div className="flex items-center justify-between p-2 border-b border-black/10 bg-black/5 rounded-t-xl text-xs font-mono text-[var(--color-text-muted)]">
                     <div className="flex items-center gap-1.5 ">
                        <Clock className="h-3 w-3" />
                        <span>{(segment.start || 0).toFixed(1)}s - {(segment.end || 0).toFixed(1)}s</span>
                     </div>
                     {isActive && <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />}
                   </div>

                   {/* Segment Words - Scrollable if too many */}
                   <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                     {segment.words.map((word, relIndex) => {
                       const originalIndex = startIndex + relIndex;
                       const isWordActive = currentTime >= word.start && currentTime <= word.end;

                       return (
                         <CaptionItem
                           key={originalIndex}
                           word={word}
                           isActive={isWordActive}
                           onChange={(newWord) => handleUpdateWord(originalIndex, newWord)}
                         />
                       );
                     })}
                   </div>
                 </div>
               );
            })
          )}
        </div>
      </div>
    </div>
  );
}
