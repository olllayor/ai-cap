import { useState, useRef } from 'react';
import { Header } from './components/layout/Header';
import { Container } from './components/layout/Container';
import { useCompatibility } from './hooks/useCompatibility';
import { AlertTriangle, Loader2, Sparkles } from 'lucide-react';
import { UploadZone } from './components/upload/UploadZone';
import { LandingPage } from './components/landing/LandingPage';
import { useVideoStore } from './stores/video.store';
import { useFFmpeg } from './hooks/useFFmpeg';
import { useTranscriber } from './hooks/useTranscription';
import { useCaptionStore } from './stores/caption.store';
import { CaptionEditor } from './components/editor/CaptionEditor';
import { StylePanel } from './components/styling/StylePanel';
import { ExportPanel } from './components/export/ExportPanel';
import { VideoPreview } from './components/preview/VideoPreview';
import { TabNavigation } from './components/layout/TabNavigation';
import { ModelSelector } from './components/upload/ModelSelector';
import { LanguageSelector } from './components/upload/LanguageSelector';
import { trackEvent } from './lib/analytics';

type Tab = 'edit' | 'style' | 'export';

function App() {
	const { isCompatible, issues, checking } = useCompatibility();
	const { file, setFile, reset, currentTime, setIsPlaying } = useVideoStore();
	const { extractAudio, isLoading: ffmpegLoading } = useFFmpeg();
	const { transcribe, modelLoading } = useTranscriber();
	const { status, setStatus, selectedModel, selectedLanguage } = useCaptionStore();

	const [activeTab, setActiveTab] = useState<Tab>('edit');
	const [showLanding, setShowLanding] = useState(true);
	const uploadRef = useRef<HTMLDivElement>(null);

	const handleGenerateCaptions = async () => {
		if (!file) return;

		try {
			trackEvent('transcription_started', {
				model: selectedModel,
				language: selectedLanguage,
				video_size: file.size,
			});
			setStatus('extracting_audio');
			// 1. Extract Audio
			const audioBlob = await extractAudio(file);

			// 2. Transcribe
			await transcribe(audioBlob);

			trackEvent('transcription_success');
			// Auto-play video after transcript is done
			setIsPlaying(true);
		} catch (error) {
			console.error('Pipeline failed:', error);
			trackEvent('transcription_error', { error: error instanceof Error ? error.message : 'Unknown error' });
			setStatus('error');
		}
	};

	const isProcessing = status === 'extracting_audio' || status === 'transcribing' || status === 'loading_model';

	if (checking) {
		return (
			<div className="flex h-screen items-center justify-center bg-[var(--color-bg-primary)]">
				<Loader2 className="h-8 w-8 animate-spin text-[var(--color-accent-primary)]" />
			</div>
		);
	}

	// ... (compatibility check view stays same)
	if (!isCompatible) {
		return (
			<div className="flex h-screen flex-col items-center justify-center bg-[var(--color-bg-primary)] p-4 text-center">
				{/* ... existing code ... */}
				<div className="mb-4 rounded-full bg-red-500/10 p-4">
					<AlertTriangle className="h-12 w-12 text-red-500" />
				</div>
				<h1 className="mb-2 text-2xl font-bold text-white">Browser Not Supported</h1>
				<p className="mb-6 max-w-md text-[var(--color-text-secondary)]">
					This app relies on advanced browser features like WebAssembly and SharedArrayBuffer for client-side video
					processing.
				</p>
				<div className="w-full max-w-md rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-left">
					<h3 className="mb-2 font-semibold text-red-400">Missing Features:</h3>
					<ul className="list-inside list-disc space-y-1 text-sm text-[var(--color-text-secondary)]">
						{issues.map((issue, i) => (
							<li key={i}>{issue}</li>
						))}
					</ul>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] font-sans antialiased selection:bg-[var(--color-accent-primary)] selection:text-white">
			{!file ? (
				<>
					{showLanding ? (
						<LandingPage
							onGetStarted={() => {
								setShowLanding(false);
								setTimeout(() => {
									uploadRef.current?.scrollIntoView({ behavior: 'smooth' });
								}, 100);
							}}
						/>
					) : (
						<>
							<Header />
							<main className="py-8">
								<Container>
									<div ref={uploadRef} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-8 text-center sm:p-12 animate-fade-in">
										<button
											onClick={() => setShowLanding(true)}
											className="mb-6 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
										>
											← Back to Home
										</button>
										<h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
											Add <span className="gradient-text">Captions</span> to Your Videos
										</h2>
										<p className="mx-auto mb-8 max-w-2xl text-lg text-[var(--color-text-secondary)]">
											Transform your shorts with AI-powered subtitles. 100% client-side, privacy-focused, and free forever.
										</p>

										<UploadZone onFileSelect={setFile} />
									</div>
								</Container>
							</main>
						</>
					)}
				</>
			) : (
				<>
					<Header />
					<main className="py-8">
						<Container>
							<div className="animate-slide-up">
							{/* Top Bar */}
							<div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
								<div className="flex items-center gap-4">
									<h2 className="text-2xl font-bold">Studio</h2>
									<span className="text-xs font-mono text-[var(--color-text-muted)] px-2 py-1 rounded bg-[var(--color-bg-tertiary)] truncate max-w-[200px]">
										{file.name}
									</span>
								</div>

								<div className="flex items-center gap-3">
									<LanguageSelector />
									<ModelSelector />

									<button
										onClick={handleGenerateCaptions}
										disabled={isProcessing || status === 'completed'}
										className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all
                      ${
												isProcessing || status === 'completed'
													? 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)] opacity-50 cursor-not-allowed'
													: 'bg-[var(--color-accent-primary)] text-white hover:bg-[var(--color-accent-hover)]'
											}
                    `}
									>
										{isProcessing || ffmpegLoading || modelLoading ? (
											<Loader2 className="h-4 w-4 animate-spin" />
										) : (
											<Sparkles className="h-4 w-4" />
										)}
										{status === 'completed'
											? 'Regenerate'
											: ffmpegLoading
											? 'Loading FFmpeg...'
											: modelLoading
											? 'Loading AI Model...'
											: 'Generate Captions'}
									</button>

									<button
										onClick={reset}
										className="text-sm text-[var(--color-text-secondary)] hover:text-white px-3 py-2 rounded-lg hover:bg-[var(--color-bg-tertiary)] transition-colors"
									>
										New Project
									</button>
								</div>
							</div>

							{/* HYBRID LAYOUT SWITCHER */}
							{activeTab === 'edit' ? (
								/* Vertical Layout (Timeline Mode) */
								<div className="flex flex-col gap-6 h-[calc(100vh-180px)] min-h-[800px]">
									<div className="flex-1 min-h-0 flex justify-center">
										<VideoPreview />
									</div>

									<div className="h-[320px] shrink-0 flex flex-col gap-4">
										<TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
										<div className="flex-1 bg-[var(--color-bg-secondary)] rounded-2xl border border-[var(--color-border)] overflow-hidden shadow-lg relative">
											<CaptionEditor currentTime={currentTime} />
										</div>
									</div>
								</div>
							) : (
								/* Horizontal Grid Layout (Style & Export Mode) */
								<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-200px)] min-h-[600px]">
									<div className="lg:col-span-5 flex flex-col gap-4">
										<div className="flex-1 flex items-center justify-center">
											<VideoPreview className="w-full" />
										</div>
									</div>

									<div className="lg:col-span-7 flex flex-col gap-4">
										<TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
										<div className="flex-1 bg-[var(--color-bg-secondary)] rounded-2xl border border-[var(--color-border)] overflow-hidden shadow-lg">
											{activeTab === 'style' && <StylePanel />}
											{activeTab === 'export' && <ExportPanel />}
										</div>
									</div>
								</div>
							)}
						</div>
					</Container>
				</main>
			</>
		)}
	</div>
	);
}

export default App;
