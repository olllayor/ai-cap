import React, { useCallback, useState } from 'react';
import { Upload, AlertCircle } from 'lucide-react';

interface UploadZoneProps {
	onFileSelect: (file: File) => void;
	maxSizeMB?: number; // default 100MB
}

export function UploadZone({ onFileSelect, maxSizeMB = 100 }: UploadZoneProps) {
	const [isDragOver, setIsDragOver] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const validateFile = (file: File): boolean => {
		// Check type
		if (!file.type.startsWith('video/')) {
			setError('Please upload a video file (MP4, WEBM, MOV).');
			return false;
		}

		// Check size
		const maxSizeBytes = maxSizeMB * 1024 * 1024;
		if (file.size > maxSizeBytes) {
			setError(`File is too large. Maximum size is ${maxSizeMB}MB.`);
			return false;
		}

		setError(null);
		return true;
	};

	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setIsDragOver(true);
	}, []);

	const handleDragLeave = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setIsDragOver(false);
	}, []);

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			setIsDragOver(false);

			const file = e.dataTransfer.files[0];
			if (file && validateFile(file)) {
				onFileSelect(file);
			}
		},
		[onFileSelect],
	);

	const handleFileInput = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (file && validateFile(file)) {
				onFileSelect(file);
			}
		},
		[onFileSelect],
	);

	return (
		<div
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
			className={`
        relative group cursor-pointer flex flex-col items-center justify-center 
        w-full max-w-2xl mx-auto h-80 rounded-2xl border-2 border-dashed transition-all duration-300
        ${
					isDragOver
						? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/5 shadow-glow'
						: 'border-[var(--color-border)] bg-[var(--color-bg-tertiary)]/30 hover:border-[var(--color-text-muted)] hover:bg-[var(--color-bg-tertiary)]/50'
				}
        ${error ? 'border-red-500/50 bg-red-500/5' : ''}
      `}
		>
			<input
				type="file"
				accept="video/*"
				onChange={handleFileInput}
				className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
			/>

			<div className="flex flex-col items-center gap-4 p-6 text-center transition-transform duration-300 group-hover:scale-105">
				<div
					className={`
          flex h-20 w-20 items-center justify-center rounded-2xl 
          bg-gradient-to-br from-[var(--color-bg-elevated)] to-[var(--color-bg-secondary)] 
          shadow-lg ring-1 ring-white/10
          ${isDragOver ? 'scale-110' : ''}
        `}
				>
					{error ? (
						<AlertCircle className="h-10 w-10 text-red-500" />
					) : (
						<Upload
							className={`h-10 w-10 text-[var(--color-text-secondary)] transition-colors ${
								isDragOver ? 'text-[var(--color-accent-primary)]' : 'group-hover:text-[var(--color-text-primary)]'
							}`}
						/>
					)}
				</div>

				<div className="space-y-2">
					<h3 className="text-xl font-semibold text-[var(--color-text-primary)]">
						{error ? 'Invalid File' : isDragOver ? 'Drop it here!' : 'Upload a Video'}
					</h3>
					<p className="max-w-xs text-sm text-[var(--color-text-secondary)]">
						{error ? (
							<span className="text-red-400">{error}</span>
						) : (
							'Drag & drop or click to browse. Supports MP4, MOV, WEBM up to 100MB.'
						)}
					</p>
				</div>
			</div>

			{/* Visual flair: Corner accents */}
			<div className="absolute left-0 top-0 -z-10 h-20 w-20 rounded-tl-2xl bg-gradient-to-br from-[var(--color-accent-primary)]/20 to-transparent blur-2xl transition-opacity opacity-0 group-hover:opacity-100" />
			<div className="absolute right-0 bottom-0 -z-10 h-20 w-20 rounded-br-2xl bg-gradient-to-tl from-[var(--color-accent-secondary)]/20 to-transparent blur-2xl transition-opacity opacity-0 group-hover:opacity-100" />
		</div>
	);
}
