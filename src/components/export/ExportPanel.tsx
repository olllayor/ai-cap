import { useState } from 'react';
import { Download, Film, FileText, Loader2, CheckCircle } from 'lucide-react';
import { useFFmpeg } from '../../hooks/useFFmpeg';
import { useCaptionStore } from '../../stores/caption.store';
import { useStyleStore } from '../../stores/style.store';
import { useVideoStore } from '../../stores/video.store';
import { downloadSRT } from '../../lib/srt-generator';
import { generateASS } from '../../lib/ass-generator';

import { getFontData } from '../../lib/font-loader';

export function ExportPanel() {
  const { transcript } = useCaptionStore();
  const { style } = useStyleStore();
  const { file } = useVideoStore();
  const { burnSubtitles } = useFFmpeg();
  
  const [isBurning, setIsBurning] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleSRTDownload = () => {
    downloadSRT(transcript, `captions-${Date.now()}.srt`);
  };

  const handleVideoExport = async () => {
    if (!file) return;
    
    setIsBurning(true);
    setDownloadUrl(null);
    
    try {
      // 1. Get Font Data from Main Thread (Reliable)
      console.log(`[Export] Fetching font data for ${style.fontFamily}...`);
      const fontData = await getFontData(style.fontFamily);
      
      // 2. Generate ASS
      const assContent = generateASS(transcript, style);
      
      // 3. Burn
      const videoBlob = await burnSubtitles(file, assContent, fontData || undefined);
      
      const url = URL.createObjectURL(videoBlob);
      setDownloadUrl(url);
    } catch (err) {
      console.error('Burn failed:', err);
      alert('Failed to generate video. Check console for details.');
    } finally {
      setIsBurning(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--color-bg-secondary)] rounded-xl border border-[var(--color-border)] overflow-hidden">
      <h3 className="font-semibold text-lg p-4 border-b border-[var(--color-border)]">
        Export
      </h3>
      
      <div className="p-6 space-y-6">
        {/* SRT Export */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[var(--color-text-secondary)] font-medium text-sm">
            <FileText className="h-4 w-4" /> Subtitles File
          </div>
          <button
            onClick={handleSRTDownload}
            className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-elevated)] transition-colors text-left"
          >
            <div className="bg-[var(--color-accent-primary)]/10 p-2 rounded-lg">
              <Download className="h-5 w-5 text-[var(--color-accent-primary)]" />
            </div>
            <div className="flex-1">
              <div className="font-semibold">Download .SRT</div>
              <div className="text-xs text-[var(--color-text-muted)]">Standard subtitle file</div>
            </div>
          </button>
        </div>

        {/* Video Export */}
        <div className="space-y-3 pt-6 border-t border-[var(--color-border)]">
          <div className="flex items-center gap-2 text-[var(--color-text-secondary)] font-medium text-sm">
            <Film className="h-4 w-4" /> Burned-in Video
          </div>
          
          {!downloadUrl ? (
            <button
              onClick={handleVideoExport}
              disabled={isBurning}
              className={`
                w-full flex items-center justify-center gap-2 p-4 rounded-xl border transition-all text-left group
                ${isBurning 
                  ? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/5 cursor-wait' 
                  : 'border-[var(--color-border)] bg-[var(--color-bg-tertiary)] hover:border-[var(--color-accent-primary)] hover:bg-[var(--color-bg-elevated)]'}
              `}
            >
              <div className={`p-2 rounded-lg transition-colors ${isBurning ? 'bg-transparent' : 'bg-[var(--color-accent-secondary)]/10 group-hover:bg-[var(--color-accent-secondary)]/20'}`}>
                {isBurning ? <Loader2 className="h-5 w-5 animate-spin text-[var(--color-accent-primary)]" /> : <Film className="h-5 w-5 text-[var(--color-accent-secondary)]" />}
              </div>
              <div className="flex-1">
                <div className="font-semibold flex items-center gap-2">
                  {isBurning ? 'Rendering Video...' : 'Export MP4'}
                </div>
                <div className="text-xs text-[var(--color-text-muted)]">
                  {isBurning ? 'This may take a minute...' : 'Burn captions into video (Slow)'}
                </div>
              </div>
            </button>
          ) : (
             <a
              href={downloadUrl}
              download={`captioned-video-${Date.now()}.mp4`}
              className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border border-green-500/30 bg-green-500/10 hover:bg-green-500/20 transition-all text-left"
            >
              <div className="bg-green-500/20 p-2 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-green-400">Download Ready</div>
                <div className="text-xs text-green-500/60">Click to save MP4</div>
              </div>
              <Download className="h-4 w-4 text-green-500 opacity-50" />
            </a>
          )}
          
          {isBurning && (
            <div className="text-xs text-center text-[var(--color-text-muted)] animate-pulse">
              Heavy processing active. Do not close tab.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
