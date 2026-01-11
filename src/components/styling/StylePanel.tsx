import { useEffect, useState } from 'react';
import { Type, Palette, Zap, Sparkles } from 'lucide-react';
import { useStyleStore, type AnimationType, type CaptionStyle } from '../../stores/style.store';

// Style presets for quick application
const stylePresets: { name: string; icon: typeof Sparkles; style: Partial<CaptionStyle> }[] = [
	{
		name: 'Minimalist',
		icon: Type,
		style: {
			fontFamily: 'DM Sans',
			fontSize: 32,
			fontWeight: 400,
			textColor: '#FFFFFF',
			highlightColor: '#F5F5F5',
			outlineColor: '#000000',
			outlineWidth: 0,
			shadowBlur: 2,
			animation: 'none',
			uppercase: false,
		},
	},
	{
		name: 'Bold Impact',
		icon: Zap,
		style: {
			fontFamily: 'Montserrat',
			fontSize: 48,
			fontWeight: 900,
			textColor: '#FFFFFF',
			highlightColor: '#FFD700',
			outlineColor: '#000000',
			outlineWidth: 3,
			shadowBlur: 6,
			animation: 'pop',
			uppercase: true,
		},
	},
	{
		name: 'Cinematic',
		icon: Palette,
		style: {
			fontFamily: 'Inter',
			fontSize: 36,
			fontWeight: 700,
			textColor: '#E8E8E8',
			highlightColor: '#FF6B6B',
			outlineColor: '#1A1A1A',
			outlineWidth: 2,
			shadowBlur: 8,
			animation: 'highlight',
			uppercase: false,
		},
	},
	{
		name: 'Modern Pop',
		icon: Sparkles,
		style: {
			fontFamily: 'Poppins',
			fontSize: 40,
			fontWeight: 700,
			textColor: '#FFFFFF',
			highlightColor: '#00D9FF',
			outlineColor: '#000000',
			outlineWidth: 2,
			shadowBlur: 4,
			animation: 'pop',
			uppercase: false,
		},
	},
];

const SUPPORTED_FONTS = ['Inter', 'Montserrat', 'Poppins', 'DM Sans', 'Noto Sans'] as const;
type SupportedFont = (typeof SUPPORTED_FONTS)[number];

export function StylePanel() {
	const { style, updateStyle, setStyle } = useStyleStore();
	const [activeSection, setActiveSection] = useState<'presets' | 'custom'>('presets');

	const fonts = [...SUPPORTED_FONTS];
	const animations: { id: AnimationType; label: string }[] = [
		{ id: 'none', label: 'Static' },
		{ id: 'pop', label: 'Pop' },
		{ id: 'highlight', label: 'Highlight' },
		{ id: 'karaoke', label: 'Karaoke' },
		{ id: 'typewriter', label: 'Typewriter' },
	];

	const applyPreset = (preset: (typeof stylePresets)[0]) => {
		setStyle({ ...style, ...preset.style });
	};

	// If a user has an old saved style using a removed font family, normalize it.
	useEffect(() => {
		if (!SUPPORTED_FONTS.includes(style.fontFamily as SupportedFont)) {
			updateStyle({ fontFamily: 'Inter' });
		}
	}, [style.fontFamily, updateStyle]);

	return (
		<div className="flex flex-col h-full bg-[var(--color-bg-secondary)] rounded-xl border border-[var(--color-border)] overflow-hidden">
			{/* Header with Tabs */}
			<div className="border-b border-[var(--color-border)]">
				<div className="p-4 pb-0">
					<h3 className="font-semibold text-lg mb-3">Style Captions</h3>
				</div>
				<div className="flex gap-1 px-4">
					<button
						onClick={() => setActiveSection('presets')}
						className={`flex-1 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
							activeSection === 'presets'
								? 'bg-[var(--color-bg-tertiary)] text-white border-b-2 border-[var(--color-accent-primary)]'
								: 'text-[var(--color-text-muted)] hover:text-white'
						}`}
					>
						Presets
					</button>
					<button
						onClick={() => setActiveSection('custom')}
						className={`flex-1 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
							activeSection === 'custom'
								? 'bg-[var(--color-bg-tertiary)] text-white border-b-2 border-[var(--color-accent-primary)]'
								: 'text-[var(--color-text-muted)] hover:text-white'
						}`}
					>
						Customize
					</button>
				</div>
			</div>

			<div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
				{/* Presets Section */}
				{activeSection === 'presets' && (
					<div className="space-y-3">
						<p className="text-sm text-[var(--color-text-secondary)] mb-4">
							Choose a preset style to instantly transform your captions
						</p>
						<div className="grid grid-cols-1 gap-3">
							{stylePresets.map((preset) => {
								const Icon = preset.icon;
								return (
									<button
										key={preset.name}
										onClick={() => applyPreset(preset)}
										className="group relative flex items-center gap-3 p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-tertiary)] hover:border-[var(--color-accent-primary)] hover:bg-[var(--color-bg-elevated)] transition-all text-left"
									>
										<div className="p-2 rounded-lg bg-[var(--color-accent-primary)]/10 group-hover:bg-[var(--color-accent-primary)]/20 transition-colors">
											<Icon className="h-5 w-5 text-[var(--color-accent-primary)]" />
										</div>
										<div className="flex-1">
											<div className="font-semibold text-white mb-0.5">{preset.name}</div>
											<div className="text-xs text-[var(--color-text-muted)]">
												{preset.style.fontFamily} • {preset.style.fontSize}px • {preset.style.animation}
											</div>
										</div>
										<div className="opacity-0 group-hover:opacity-100 transition-opacity">
											<Sparkles className="h-4 w-4 text-[var(--color-accent-primary)]" />
										</div>
									</button>
								);
							})}
						</div>
					</div>
				)}

				{/* Custom Section */}
				{activeSection === 'custom' && (
					<>
						{/* Typography Section */}
						<div className="space-y-3">
							<div className="flex items-center gap-2 text-[var(--color-text-secondary)] font-medium text-sm">
								<Type className="h-4 w-4" /> Typography
							</div>

							<div className="grid grid-cols-2 gap-3">
								<div className="col-span-2">
									<label className="text-xs text-[var(--color-text-muted)] mb-1 block">Font Family</label>
									<select
										value={style.fontFamily}
										onChange={(e) => updateStyle({ fontFamily: e.target.value })}
										className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm focus:border-[var(--color-accent-primary)] outline-none"
									>
										{fonts.map((f) => (
											<option key={f} value={f}>
												{f}
											</option>
										))}
									</select>
								</div>

								<div>
									<label className="text-xs text-[var(--color-text-muted)] mb-1 block">Size ({style.fontSize}px)</label>
									<input
										type="range"
										min="12"
										max="120"
										value={style.fontSize}
										onChange={(e) => updateStyle({ fontSize: Number(e.target.value) })}
										className="w-full h-2 bg-[var(--color-bg-tertiary)] rounded-lg appearance-none cursor-pointer accent-[var(--color-accent-primary)]"
									/>
								</div>

								<div>
									<label className="text-xs text-[var(--color-text-muted)] mb-1 block">Weight</label>
									<select
										value={style.fontWeight}
										onChange={(e) => updateStyle({ fontWeight: Number(e.target.value) })}
										className="w-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm focus:border-[var(--color-accent-primary)] outline-none"
									>
										<option value="400">Regular</option>
										<option value="700">Bold</option>
										<option value="800">Extra Bold</option>
										<option value="900">Black</option>
									</select>
								</div>
							</div>

							<div className="flex items-center gap-2">
								<input
									type="checkbox"
									id="uppercase"
									checked={style.uppercase}
									onChange={(e) => updateStyle({ uppercase: e.target.checked })}
									className="rounded border-[var(--color-border)] bg-[var(--color-bg-tertiary)] text-[var(--color-accent-primary)] focus:ring-[var(--color-accent-primary)]"
								/>
								<label htmlFor="uppercase" className="text-sm">
									Uppercase
								</label>
							</div>
						</div>

						{/* Colors Section */}
						<div className="space-y-3 pt-4 border-t border-[var(--color-border)]">
							<div className="flex items-center gap-2 text-[var(--color-text-secondary)] font-medium text-sm">
								<Palette className="h-4 w-4" /> Colors
							</div>

							<div className="grid grid-cols-2 gap-3">
								<div>
									<label className="text-xs text-[var(--color-text-muted)] mb-1 block">Text Color</label>
									<div className="flex items-center gap-2">
										<input
											type="color"
											value={style.textColor}
											onChange={(e) => updateStyle({ textColor: e.target.value })}
											className="h-8 w-8 rounded overflow-hidden border-0 cursor-pointer"
										/>
										<span className="text-xs font-mono">{style.textColor}</span>
									</div>
								</div>

								<div>
									<label className="text-xs text-[var(--color-text-muted)] mb-1 block">Highlight</label>
									<div className="flex items-center gap-2">
										<input
											type="color"
											value={style.highlightColor}
											onChange={(e) => updateStyle({ highlightColor: e.target.value })}
											className="h-8 w-8 rounded overflow-hidden border-0 cursor-pointer"
										/>
										<span className="text-xs font-mono">{style.highlightColor}</span>
									</div>
								</div>

								<div>
									<label className="text-xs text-[var(--color-text-muted)] mb-1 block">Outline</label>
									<div className="flex items-center gap-2">
										<input
											type="color"
											value={style.outlineColor}
											onChange={(e) => updateStyle({ outlineColor: e.target.value })}
											className="h-8 w-8 rounded overflow-hidden border-0 cursor-pointer"
										/>
										<input
											type="number"
											min="0"
											max="10"
											value={style.outlineWidth}
											onChange={(e) => updateStyle({ outlineWidth: Number(e.target.value) })}
											className="w-12 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded px-1 py-1 text-sm text-right"
										/>
									</div>
								</div>
							</div>
						</div>

						{/* Animation & Layout */}
						<div className="space-y-3 pt-4 border-t border-[var(--color-border)]">
							<div className="flex items-center gap-2 text-[var(--color-text-secondary)] font-medium text-sm">
								<Zap className="h-4 w-4" /> Animation
							</div>

							<div className="grid grid-cols-2 gap-2">
								{animations.map((anim) => (
									<button
										key={anim.id}
										onClick={() => updateStyle({ animation: anim.id })}
										className={`
                  text-sm px-3 py-2 rounded-lg border transition-all
                  ${
										style.animation === anim.id
											? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10 text-white'
											: 'border-[var(--color-border)] bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)] hover:border-[var(--color-text-muted)]'
									}
                `}
									>
										{anim.label}
									</button>
								))}
							</div>

							<div className="pt-2">
								<div className="flex items-center justify-between mb-1">
									<label className="text-xs text-[var(--color-text-muted)]">Vertical Position</label>
									<span className="text-xs text-[var(--color-text-muted)]">{style.yOffset}%</span>
								</div>
								<input
									type="range"
									min="0"
									max="90"
									value={style.yOffset}
									onChange={(e) => updateStyle({ yOffset: Number(e.target.value) })}
									className="w-full h-2 bg-[var(--color-bg-tertiary)] rounded-lg appearance-none cursor-pointer accent-[var(--color-accent-primary)]"
								/>
								<p className="text-[10px] text-[var(--color-text-muted)] mt-1 text-right">from bottom</p>
							</div>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
