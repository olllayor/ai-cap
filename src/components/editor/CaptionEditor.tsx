import { useMemo, useCallback, useRef, useEffect } from 'react';
import { useCaptionStore } from '../../stores/caption.store';
import { CaptionItem } from './CaptionItem';
import { groupWordsIntoSegments } from '../../lib/caption-utils';
import { Clock, List } from 'lucide-react';

interface CaptionEditorProps {
	currentTime: number;
}

export function CaptionEditor({ currentTime }: CaptionEditorProps) {
	const { transcript, setTranscript } = useCaptionStore();
	const activeSegmentRef = useRef<HTMLDivElement>(null);
	const scrollContainerRef = useRef<HTMLDivElement>(null);

	const handleUpdateWord = useCallback(
		(index: number, newWord: any) => {
			const newTranscript = [...transcript];
			newTranscript[index] = newWord;
			setTranscript(newTranscript);
		},
		[transcript, setTranscript],
	);

	// Group words into segments for easier navigation
	const segments = useMemo(() => {
		return groupWordsIntoSegments(transcript);
	}, [transcript]);

	// Auto-scroll to active segment
	useEffect(() => {
		if (activeSegmentRef.current && scrollContainerRef.current) {
			const container = scrollContainerRef.current;
			const element = activeSegmentRef.current;
			const containerRect = container.getBoundingClientRect();
			const elementRect = element.getBoundingClientRect();

			// Check if element is out of view
			if (elementRect.top < containerRect.top || elementRect.bottom > containerRect.bottom) {
				element.scrollIntoView({ behavior: 'smooth', block: 'center' });
			}
		}
	}, [currentTime, segments]);

	return (
		<div className="flex flex-col h-full bg-[var(--color-bg-secondary)]">
			{/* Header */}
			<div className="flex items-center justify-between px-6 py-3 border-b border-[var(--color-border)] bg-[var(--color-bg-tertiary)]/30 backdrop-blur-sm">
				<div className="flex items-center gap-2">
					<List className="h-4 w-4 text-[var(--color-accent-primary)]" />
					<h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Caption Editor</h3>
				</div>
				<span className="text-xs text-[var(--color-text-muted)] font-mono px-2.5 py-1 rounded-md bg-[var(--color-bg-tertiary)]">
					{segments.length} segments
				</span>
			</div>

			{/* Vertical Timeline */}
			<div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
				{transcript.length === 0 ? (
					<div className="flex flex-col items-center justify-center h-full text-center">
						<div className="mb-3 rounded-full bg-[var(--color-bg-tertiary)] p-4">
							<Clock className="h-8 w-8 text-[var(--color-text-muted)]" />
						</div>
						<p className="text-[var(--color-text-secondary)] font-medium mb-1">No captions yet</p>
						<p className="text-sm text-[var(--color-text-muted)]">Generate captions to start editing</p>
					</div>
				) : (
					<div className="space-y-3">
						{segments.map((segment) => {
							const startIndex = transcript.indexOf(segment.words[0]);
							const isActive = currentTime >= segment.start && currentTime <= segment.end;

							return (
								<div
									key={segment.id}
									ref={isActive ? activeSegmentRef : null}
									className={`
                    relative rounded-xl border transition-all duration-200
                    ${
											isActive
												? 'bg-[var(--color-accent-primary)]/5 border-[var(--color-accent-primary)] shadow-md ring-2 ring-[var(--color-accent-primary)]/20'
												: 'bg-[var(--color-bg-tertiary)]/40 border-[var(--color-border)] hover:border-[var(--color-border-hover)] hover:bg-[var(--color-bg-tertiary)]/60'
										}
                  `}
								>
									{/* Segment Header */}
									<div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--color-border)] bg-black/5">
										<div className="flex items-center gap-2">
											<Clock className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
											<span className="text-xs font-mono text-[var(--color-text-secondary)]">
												{segment.start.toFixed(2)}s - {segment.end.toFixed(2)}s
											</span>
											<span className="text-xs text-[var(--color-text-muted)]">({segment.words.length} words)</span>
										</div>
										{isActive && (
											<div className="flex items-center gap-1.5">
												<span className="text-xs font-medium text-[var(--color-accent-primary)]">Playing</span>
												<div className="h-2 w-2 rounded-full bg-[var(--color-accent-primary)] animate-pulse" />
											</div>
										)}
									</div>

									{/* Segment Words */}
									<div className="p-4 space-y-2">
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
						})}
					</div>
				)}
			</div>
		</div>
	);
}
