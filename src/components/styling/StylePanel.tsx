import React from 'react';
import { Type, Palette, Layout, Zap } from 'lucide-react';
import { useStyleStore, type AnimationType } from '../../stores/style.store';

export function StylePanel() {
  const { style, updateStyle } = useStyleStore();

  const fonts = ['DM Sans', 'Instrument Sans', 'Google Sans Flex', 'Geist Sans', 'Montserrat', 'Poppins', 'Inter', 'sans-serif'];
  const animations: { id: AnimationType; label: string }[] = [
    { id: 'none', label: 'Static' },
    { id: 'pop', label: 'Pop' },
    { id: 'highlight', label: 'Highlight' },
    { id: 'karaoke', label: 'Karaoke' },
    { id: 'typewriter', label: 'Typewriter' },
  ];

  return (
    <div className="flex flex-col h-full bg-[var(--color-bg-secondary)] rounded-xl border border-[var(--color-border)] overflow-hidden">
      <h3 className="font-semibold text-lg p-4 border-b border-[var(--color-border)]">
        Style Captions
      </h3>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        
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
                {fonts.map(f => <option key={f} value={f}>{f}</option>)}
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
             <label htmlFor="uppercase" className="text-sm">Uppercase</label>
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
                  ${style.animation === anim.id 
                    ? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10 text-white' 
                    : 'border-[var(--color-border)] bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)] hover:border-[var(--color-text-muted)]'}
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

      </div>
    </div>
  );
}
