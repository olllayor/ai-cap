import { useMemo } from 'react';
import { useCaptionStore, type Word } from '../../stores/caption.store';
import { useStyleStore } from '../../stores/style.store';
import { groupWordsIntoSegments } from '../../lib/caption-utils';

interface CaptionOverlayProps {
	currentTime: number;
}

// Binary search for active segment (O(log n) vs O(n))
function findActiveSegment(segments: any[], time: number) {
	let left = 0;
	let right = segments.length - 1;

	while (left <= right) {
		const mid = Math.floor((left + right) / 2);
		const seg = segments[mid];

		if (time >= seg.start && time <= seg.end) {
			return seg;
		} else if (time < seg.start) {
			right = mid - 1;
		} else {
			left = mid + 1;
		}
	}
	return null;
}

export function CaptionOverlay({ currentTime }: CaptionOverlayProps) {
	const { transcript } = useCaptionStore();
	const { style } = useStyleStore();

	const segments = useMemo(() => {
		return groupWordsIntoSegments(transcript);
	}, [transcript]);

	const activeSegment = useMemo(() => {
		// Use binary search for better performance
		return findActiveSegment(segments, currentTime);
	}, [segments, currentTime]);

	// Memoize styles to prevent recreation on every render
	const containerStyle = useMemo<React.CSSProperties>(
		() => ({
			bottom: `${style.yOffset}%`,
			fontFamily: style.fontFamily,
			fontSize: `${style.fontSize}px`,
			fontWeight: style.fontWeight,
			textTransform: style.uppercase ? 'uppercase' : 'none',
			width: `${style.maxWidth}%`,
			left: `${(100 - style.maxWidth) / 2}%`,
		}),
		[style.yOffset, style.fontFamily, style.fontSize, style.fontWeight, style.uppercase, style.maxWidth],
	);

	const baseWordStyle = useMemo<React.CSSProperties>(
		() => ({
			color: style.textColor,
			WebkitTextStroke: `${style.outlineWidth}px ${style.outlineColor}`,
			textShadow: `0px 2px ${style.shadowBlur}px ${style.shadowColor}`,
		}),
		[style.textColor, style.outlineWidth, style.outlineColor, style.shadowBlur, style.shadowColor],
	);

	if (!activeSegment) return null;

	const getAnimationClass = () => {
		switch (style.animation) {
			case 'pop':
				return 'animate-pop';
			default:
				return '';
		}
	};

	const isHighlightMode = style.animation === 'highlight' || style.animation === 'karaoke';

	return (
		<div
			className="absolute z-20 pointer-events-none text-center leading-tight transition-all duration-75 ease-out select-none"
			style={containerStyle}
		>
			<div className="flex flex-wrap justify-center gap-x-[0.25em]">
				{activeSegment.words.map((word: Word, i: number) => {
					const isWordActive = currentTime >= word.start && currentTime <= word.end;
					const isHighlighted = isHighlightMode && isWordActive;

					// Pre-calculate dynamic styles
					const dynamicColor = isHighlighted ? style.highlightColor : style.textColor;
					const dynamicTransform = isWordActive && style.animation === 'pop' ? 'scale(1.1)' : 'scale(1)';
					const dynamicOpacity = style.animation === 'typewriter' && !isWordActive && currentTime < word.start ? 0 : 1;

					return (
						<span
							key={`${word.start}-${i}`}
							className={`${
								isWordActive ? getAnimationClass() : ''
							} inline-block transition-transform duration-100 origin-center`}
							style={{
								...baseWordStyle,
								color: dynamicColor,
								transform: dynamicTransform,
								opacity: dynamicOpacity,
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
