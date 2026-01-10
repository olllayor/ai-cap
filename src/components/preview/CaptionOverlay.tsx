import React, { useMemo } from 'react';
import { useCaptionStore } from '../../stores/caption.store';
import { useStyleStore } from '../../stores/style.store';
import { groupWordsIntoSegments } from '../../lib/caption-utils';

interface CaptionOverlayProps {
  currentTime: number;
}

export function CaptionOverlay({ currentTime }: CaptionOverlayProps) {
  const { transcript } = useCaptionStore();
  const { style } = useStyleStore();

  const segments = useMemo(() => {
    return groupWordsIntoSegments(transcript);
  }, [transcript]);

  const activeSegment = useMemo(() => {
    return segments.find(seg => currentTime >= seg.start && currentTime <= seg.end);
  }, [segments, currentTime]);

  if (!activeSegment) return null;

  // Dynamic Styles
  const containerStyle: React.CSSProperties = {
    bottom: `${style.yOffset}%`,
    fontFamily: style.fontFamily,
    fontSize: `${style.fontSize}px`,
    fontWeight: style.fontWeight,
    textTransform: style.uppercase ? 'uppercase' : 'none',
    width: `${style.maxWidth}%`,
    left: `${(100 - style.maxWidth) / 2}%`, // Center horizontally
  };

  const baseWordStyle: React.CSSProperties = {
    color: style.textColor,
    WebkitTextStroke: `${style.outlineWidth}px ${style.outlineColor}`,
    textShadow: `0px 2px ${style.shadowBlur}px ${style.shadowColor}`,
  };

  const getAnimationClass = () => {
    switch (style.animation) {
      case 'pop': return 'animate-pop';
      default: return '';
    }
  };

  const isHighlightMode = style.animation === 'highlight' || style.animation === 'karaoke';

  return (
    <div 
      className="absolute z-20 pointer-events-none text-center leading-tight transition-all duration-75 ease-out select-none"
      style={containerStyle}
    >
      <div className="flex flex-wrap justify-center gap-x-[0.25em]">
        {activeSegment.words.map((word, i) => {
          const isWordActive = currentTime >= word.start && currentTime <= word.end;
          // For karaoke, we might want past words to stay highlighted? 
          // For now, simple highlight means "current word is red, others white"
          
          const isHighlighted = isHighlightMode && isWordActive;
          
          return (
            <span 
              key={`${word.start}-${i}`}
              className={`${isWordActive ? getAnimationClass() : ''} inline-block transition-transform duration-100 origin-center`}
              style={{
                ...baseWordStyle,
                color: isHighlighted ? style.highlightColor : style.textColor,
                transform: (isWordActive && style.animation === 'pop') ? 'scale(1.1)' : 'scale(1)',
                opacity: (style.animation === 'typewriter' && !isWordActive && currentTime < word.start) ? 0 : 1
              }}
            >
              {word.word}
            </span>
          );
        })}
      </div>
      
      <style>{`
        @keyframes pop {
          0% { transform: scale(1); }
          50% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        .animate-pop {
          animation: pop 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
      `}</style>
    </div>
  );
}
