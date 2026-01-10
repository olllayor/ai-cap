import React from 'react';
import { useCaptionStore } from '../../stores/caption.store';
import { CaptionItem } from './CaptionItem';

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

  return (
    <div className="flex flex-col h-full">
      <h3 className="font-semibold text-lg mb-4 sticky top-0 bg-[var(--color-bg-secondary)] z-10 pb-4 border-b border-[var(--color-border)]">
        Edit Captions
      </h3>
      
      <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
        {transcript.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-[var(--color-text-muted)] opacity-50 py-12">
            <p>No captions yet. Generate them first!</p>
          </div>
        ) : (
          transcript.map((word, i) => {
            const isActive = currentTime >= word.start && currentTime <= word.end;
            return (
              <CaptionItem
                key={i}
                word={word}
                isActive={isActive}
                onChange={(newWord) => handleUpdateWord(i, newWord)}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
