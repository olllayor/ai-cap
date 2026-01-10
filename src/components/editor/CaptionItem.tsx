import { memo } from 'react';
import { Clock } from 'lucide-react';
import type { Word } from '../../stores/caption.store';

interface CaptionItemProps {
	word: Word;
	onChange: (newWord: Word) => void;
	isActive?: boolean;
}

// Memoize to prevent unnecessary re-renders
export const CaptionItem = memo(
	function CaptionItem({ word, onChange, isActive }: CaptionItemProps) {
		return (
			<div
				className={`
      group flex items-start gap-3 p-3 rounded-lg border transition-all duration-200
      ${
				isActive
					? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10 shadow-sm ring-1 ring-[var(--color-accent-primary)]'
					: 'border-[var(--color-border)] bg-[var(--color-bg-tertiary)] hover:border-[var(--color-border-hover)]'
			}
    `}
			>
				<div className="flex-1 space-y-2">
					<input
						type="text"
						value={word.word}
						onChange={(e) => onChange({ ...word, word: e.target.value })}
						className="w-full bg-transparent text-lg font-medium text-[var(--color-text-primary)] focus:outline-none placeholder-white/20"
						placeholder="Caption text"
					/>

					<div className="flex items-center gap-4 text-xs font-mono text-[var(--color-text-muted)] group-focus-within:text-[var(--color-text-secondary)]">
						<div className="flex items-center gap-1.5 bg-black/20 px-2 py-0.5 rounded">
							<Clock className="h-3 w-3" />
							<input
								type="number"
								value={word.start.toFixed(2)}
								step="0.1"
								onChange={(e) => onChange({ ...word, start: parseFloat(e.target.value) })}
								className="w-12 bg-transparent focus:outline-none text-right"
							/>
							<span className="opacity-50">s</span>
						</div>
						<span className="opacity-30">→</span>
						<div className="flex items-center gap-1.5 bg-black/20 px-2 py-0.5 rounded">
							<input
								type="number"
								value={word.end.toFixed(2)}
								step="0.1"
								onChange={(e) => onChange({ ...word, end: parseFloat(e.target.value) })}
								className="w-12 bg-transparent focus:outline-none text-right"
							/>
							<span className="opacity-50">s</span>
						</div>
					</div>
				</div>
			</div>
		);
	},
	(prevProps, nextProps) => {
		// Custom comparison to prevent re-renders
		return (
			prevProps.word.word === nextProps.word.word &&
			prevProps.word.start === nextProps.word.start &&
			prevProps.word.end === nextProps.word.end &&
			prevProps.isActive === nextProps.isActive
		);
	},
);
