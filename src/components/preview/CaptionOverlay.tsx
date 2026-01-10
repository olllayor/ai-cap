import React, { useMemo } from 'react';
import { useCaptionStore } from '../../stores/caption.store';
import { useStyleStore } from '../../stores/style.store';

interface CaptionOverlayProps {
  currentTime: number;
}

export function CaptionOverlay({ currentTime }: CaptionOverlayProps) {
  const { transcript } = useCaptionStore();
  const { style } = useStyleStore();

  const activeWords = useMemo(() => {
    // Find the word that is currently active or very close to active
    // We can also find a window of words around it for context if we want "phrase" mode later
    return transcript.filter(word => 
      currentTime >= word.start && currentTime <= word.end
    );
  }, [transcript, currentTime]);

  if (activeWords.length === 0) return null;

  // Group active words (usually just one, but could be overlap)
  const text = activeWords.map(w => w.word).join(' ');

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

  const wordStyle: React.CSSProperties = {
    color: style.textColor,
    WebkitTextStroke: `${style.outlineWidth}px ${style.outlineColor}`,
    textShadow: `0px 2px ${style.shadowBlur}px ${style.shadowColor}`,
  };

  // Animation logic
  const getAnimationClass = () => {
    switch (style.animation) {
      case 'pop': return 'animate-pop';
      // highlight is handled via color change
      default: return '';
    }
  };

  const isHighlight = style.animation === 'highlight' || style.animation === 'karaoke';

  return (
    <div 
      className="absolute z-20 pointer-events-none text-center leading-tight transition-all duration-75 ease-out select-none"
      style={containerStyle}
    >
      <span 
        className={`${getAnimationClass()} inline-block transition-transform duration-100 origin-center`}
        style={{
          ...wordStyle,
          color: isHighlight ? style.highlightColor : style.textColor,
          // If pop animation, we might want to scale
          transform: style.animation === 'pop' ? 'scale(1.1)' : 'scale(1)',
        }}
      >
        {text}
      </span>
      
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
