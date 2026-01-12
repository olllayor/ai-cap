import { useRef, useEffect } from 'react';
import { CaptionOverlay } from './CaptionOverlay';
import { useVideoStore } from '../../stores/video.store';

interface VideoPreviewProps {
	className?: string;
}

export function VideoPreview({ className = '' }: VideoPreviewProps) {
	const videoRef = useRef<HTMLVideoElement>(null);
	const { videoUrl, setIsPlaying, setDuration, setCurrentTime, currentTime, setDimensions } = useVideoStore();

	useEffect(() => {
		if (videoRef.current && Math.abs(videoRef.current.currentTime - currentTime) > 0.5) {
			videoRef.current.currentTime = currentTime;
		}
	}, [currentTime]);

	// Keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Don't trigger shortcuts if user is typing in an input
			if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
				return;
			}

			const video = videoRef.current;
			if (!video) return;

			switch (e.key.toLowerCase()) {
				case ' ':
				case 'k':
					e.preventDefault();
					if (video.paused) {
						video.play();
					} else {
						video.pause();
					}
					break;

				case 'arrowleft':
				case 'j':
					e.preventDefault();
					video.currentTime = Math.max(0, video.currentTime - (e.shiftKey ? 5 : 1));
					break;

				case 'arrowright':
				case 'l':
					e.preventDefault();
					video.currentTime = Math.min(video.duration, video.currentTime + (e.shiftKey ? 5 : 1));
					break;

				case 'arrowup':
					e.preventDefault();
					video.volume = Math.min(1, video.volume + 0.1);
					break;

				case 'arrowdown':
					e.preventDefault();
					video.volume = Math.max(0, video.volume - 0.1);
					break;

				case 'm':
					e.preventDefault();
					video.muted = !video.muted;
					break;

				case 'f':
					e.preventDefault();
					if (!document.fullscreenElement) {
						video.requestFullscreen?.();
					} else {
						document.exitFullscreen?.();
					}
					break;

				case '0':
				case 'home':
					e.preventDefault();
					video.currentTime = 0;
					break;
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, []);

	return (
		<div
			className={`relative h-full aspect-[9/16] max-h-full rounded-2xl bg-black shadow-2xl border border-[var(--color-border)] overflow-hidden ${className}`}
		>
			<video
				ref={videoRef}
				src={videoUrl!}
				controls
				playsInline
				className="w-full h-full object-contain"
				onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
				onLoadedMetadata={(e) => {
					setDuration(e.currentTarget.duration);
					setDimensions(e.currentTarget.videoWidth, e.currentTarget.videoHeight);
				}}
				onPlay={() => setIsPlaying(true)}
				onPause={() => setIsPlaying(false)}
			/>
			<CaptionOverlay currentTime={currentTime} />

			{/* Keyboard shortcuts hint */}
			<div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-white/70 font-mono opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
				<div className="space-y-1">
					<div>
						<kbd className="text-white/90">Space</kbd> or <kbd className="text-white/90">K</kbd> = Play/Pause
					</div>
					<div>
						<kbd className="text-white/90">J</kbd>/<kbd className="text-white/90">L</kbd> = Seek ±1s
					</div>
					<div>
						<kbd className="text-white/90">↑</kbd>/<kbd className="text-white/90">↓</kbd> = Volume
					</div>
				</div>
			</div>
		</div>
	);
}
