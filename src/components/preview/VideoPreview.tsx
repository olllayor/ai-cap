import { useRef, useEffect } from 'react';
import { CaptionOverlay } from './CaptionOverlay';
import { useVideoStore } from '../../stores/video.store';

interface VideoPreviewProps {
  className?: string;
}

export function VideoPreview({ className = '' }: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { videoUrl, setIsPlaying, setDuration, setCurrentTime, currentTime } = useVideoStore();

  useEffect(() => {
    if (videoRef.current && Math.abs(videoRef.current.currentTime - currentTime) > 0.5) {
      videoRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  return (
    <div className={`relative h-full aspect-[9/16] max-h-full rounded-2xl bg-black shadow-2xl border border-[var(--color-border)] overflow-hidden ${className}`}>
      <video 
        ref={videoRef}
        src={videoUrl!} 
        controls 
        playsInline
        className="w-full h-full object-contain"
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      <CaptionOverlay currentTime={currentTime} />
    </div>
  );
}
