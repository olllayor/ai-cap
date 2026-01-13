import { Sparkles, Shield, Palette, Download, Lock, Zap, Play, ArrowRight, CheckCircle } from 'lucide-react';
import { useState } from 'react';

interface LandingPageProps {
	onGetStarted: () => void;
}

const features = [
	{
		icon: Shield,
		title: '100% Client-Side',
		description: 'All processing happens in your browser. Your videos never touch our servers.',
	},
	{
		icon: Sparkles,
		title: 'AI-Powered',
		description: 'Automatic transcription using Whisper, the state-of-the-art speech recognition model.',
	},
	{
		icon: Palette,
		title: 'Fully Customizable',
		description: 'Choose fonts, colors, sizes, and animations. Make your captions uniquely yours.',
	},
	{
		icon: Download,
		title: 'Multiple Exports',
		description: 'Download SRT files or export videos with captions burned directly in.',
	},
	{
		icon: Lock,
		title: 'Privacy First',
		description: 'Your content stays private. No uploads, no tracking, no compromises.',
	},
	{
		icon: Zap,
		title: 'Lightning Fast',
		description: 'Real-time processing powered by WebAssembly. Get results in seconds.',
	},
];

const steps = [
	{
		number: '01',
		title: 'Upload Your Video',
		description: 'Drag and drop or select any video file up to 100MB.',
	},
	{
		number: '02',
		title: 'Generate Captions',
		description: 'Our AI automatically transcribes your audio with high accuracy.',
	},
	{
		number: '03',
		title: 'Style & Export',
		description: 'Customize the look and download your captioned video.',
	},
];

export function LandingPage({ onGetStarted }: LandingPageProps) {
	const [isHovering, setIsHovering] = useState(false);

	return (
		<div className="min-h-screen bg-[var(--color-bg-primary)]">
			{/* Hero Section */}
			<section className="relative overflow-hidden">
				{/* Background gradient orbs */}
				<div className="absolute inset-0 overflow-hidden pointer-events-none">
					<div className="absolute -top-40 -right-40 w-96 h-96 bg-[var(--color-accent-primary)]/10 rounded-full blur-3xl animate-float" />
					<div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[var(--color-accent-secondary)]/10 rounded-full blur-3xl animate-float-delayed" />
				</div>

				<div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
					{/* Badge */}
					<div className="flex justify-center mb-8">
						<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-secondary)]">
							<div className="w-2 h-2 rounded-full bg-[var(--color-accent-primary)] animate-pulse" />
							100% Free & Open Source
						</div>
					</div>

					{/* Headline */}
					<h1 className="text-center text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-fade-in">
						<span className="text-[var(--color-text-primary)]">Add Beautiful </span>
						<span className="gradient-text">Captions</span>
						<br />
						<span className="text-[var(--color-text-primary)]">To Your Videos</span>
					</h1>

					{/* Subheadline */}
					<p className="text-center text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-12 animate-slide-up">
						AI-powered video captioning that runs entirely in your browser. 
						Generate, style, and export—all without uploading a single frame.
					</p>

					{/* CTA Buttons */}
					<div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20 animate-slide-up">
						<button
							onClick={onGetStarted}
							onMouseEnter={() => setIsHovering(true)}
							onMouseLeave={() => setIsHovering(false)}
							className="group relative flex items-center gap-2 px-8 py-4 rounded-xl bg-[var(--color-accent-primary)] text-white font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-glow"
						>
							<Play className={`h-5 w-5 transition-transform duration-300 ${isHovering ? 'scale-110' : ''}`} />
							Get Started Free
							<ArrowRight className={`h-5 w-5 transition-transform duration-300 ${isHovering ? 'translate-x-1' : ''}`} />
						</button>
						<a
							href="https://github.com/olllayor/ai-cap"
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center gap-2 px-8 py-4 rounded-xl border border-[var(--color-border)] text-[var(--color-text-secondary)] font-medium text-lg transition-all hover:border-[var(--color-accent-primary)] hover:text-[var(--color-text-primary)]"
						>
							View on GitHub
						</a>
					</div>

					{/* Demo Preview */}
					<div className="relative max-w-4xl mx-auto">
						<div className="relative rounded-2xl overflow-hidden border border-[var(--color-border)] shadow-2xl bg-[var(--color-bg-secondary)]">
							<div className="aspect-video flex items-center justify-center bg-gradient-to-br from-[var(--color-bg-secondary)] to-[var(--color-bg-tertiary)]">
								<div className="text-center p-8">
									<div className="w-20 h-20 rounded-full bg-[var(--color-accent-primary)]/10 flex items-center justify-center mx-auto mb-4">
										<Sparkles className="h-10 w-10 text-[var(--color-accent-primary)]" />
									</div>
									<p className="text-[var(--color-text-secondary)] text-lg">
										Upload a video to see the magic happen
									</p>
								</div>
							</div>
						</div>
						{/* Glow effect */}
						<div className="absolute -inset-4 bg-gradient-to-r from-[var(--color-accent-primary)]/20 via-transparent to-[var(--color-accent-secondary)]/20 rounded-3xl blur-2xl -z-10" />
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="py-24 bg-[var(--color-bg-secondary)]">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-text-primary)] mb-4">
							Everything You Need
						</h2>
						<p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto">
							Professional-grade caption generation without the complexity or privacy concerns.
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{features.map((feature, index) => (
							<div
								key={feature.title}
								className="group p-6 rounded-2xl bg-[var(--color-bg-primary)] border border-[var(--color-border)] transition-all duration-300 hover:border-[var(--color-accent-primary)]/50 hover:shadow-lg hover:-translate-y-1"
								style={{ animationDelay: `${index * 100}ms` }}
							>
								<div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
									<feature.icon className="h-6 w-6 text-white" />
								</div>
								<h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
									{feature.title}
								</h3>
								<p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">
									{feature.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* How It Works Section */}
			<section className="py-24">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-text-primary)] mb-4">
							How It Works
						</h2>
						<p className="text-lg text-[var(--color-text-secondary)]">
							Three simple steps to captioned videos
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
						{steps.map((step, index) => (
							<div key={step.number} className="relative text-center">
								{/* Connector line */}
								{index < steps.length - 1 && (
									<div className="hidden md:block absolute top-8 left-1/2 w-full h-px bg-gradient-to-r from-[var(--color-border)] via-[var(--color-accent-primary)]/30 to-[var(--color-border)]" />
								)}
								
								<div className="relative z-10 w-16 h-16 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] flex items-center justify-center mx-auto mb-6">
									<span className="text-2xl font-bold gradient-text">{step.number}</span>
								</div>
								<h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-3">
									{step.title}
								</h3>
								<p className="text-[var(--color-text-secondary)]">
									{step.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Benefits Section */}
			<section className="py-24 bg-[var(--color-bg-secondary)]">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
						<div>
							<h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-text-primary)] mb-6">
								Why Choose AI-Cap?
							</h2>
							<div className="space-y-4">
								{[
									'No account required—just upload and go',
									'Supports MP4, MOV, and WebM formats',
									'Multiple Whisper models for accuracy vs speed',
									'Beautiful animated caption styles',
									'Export with burned-in captions or SRT files',
									'Works offline after initial load',
								].map((benefit) => (
									<div key={benefit} className="flex items-start gap-3">
										<CheckCircle className="h-5 w-5 text-[var(--color-accent-primary)] mt-0.5 shrink-0" />
										<span className="text-[var(--color-text-secondary)]">{benefit}</span>
									</div>
								))}
							</div>
						</div>
						<div className="relative">
							<div className="aspect-square rounded-3xl bg-gradient-to-br from-[var(--color-accent-primary)]/20 to-[var(--color-accent-secondary)]/20 flex items-center justify-center">
								<div className="text-center">
									<div className="text-6xl font-bold gradient-text mb-2">100%</div>
									<div className="text-xl text-[var(--color-text-secondary)]">Privacy Guaranteed</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Final CTA Section */}
			<section className="py-24">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-text-primary)] mb-6">
						Ready to Caption Your Videos?
					</h2>
					<p className="text-lg text-[var(--color-text-secondary)] mb-8">
						Start creating beautiful, accessible video content in seconds.
					</p>
					<button
						onClick={onGetStarted}
						className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[var(--color-accent-primary)] text-white font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-glow"
					>
						<Sparkles className="h-5 w-5" />
						Get Started — It's Free
					</button>
				</div>
			</section>

			{/* Footer */}
			<footer className="py-8 border-t border-[var(--color-border)]">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex flex-col sm:flex-row items-center justify-between gap-4">
						<div className="flex items-center gap-2">
							<div className="h-6 w-6 rounded-lg bg-gradient-to-br from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] flex items-center justify-center">
								<Sparkles className="h-3.5 w-3.5 text-white" />
							</div>
							<span className="font-semibold text-[var(--color-text-primary)]">AI-Cap</span>
						</div>
						<div className="text-sm text-[var(--color-text-muted)]">
							Open source • Privacy first • Made with ❤️
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
}
