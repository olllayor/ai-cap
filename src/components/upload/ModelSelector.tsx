import { useCaptionStore } from '../../stores/caption.store';
import { AlertTriangle, HardDrive, Cpu, Check } from 'lucide-react';
import { useState } from 'react';

const MODELS = [
  {
    id: 'Xenova/whisper-tiny.en',
    name: 'Tiny (English)',
    description: 'Fastest, Low Memory',
    badge: 'Standard',
    warning: null
  },
  {
    id: 'Xenova/whisper-tiny',
    name: 'Tiny (Multilingual)',
    description: 'Supports 100+ languages',
    badge: 'Versatile',
    warning: null
  },
  {
    id: 'Xenova/whisper-small',
    name: 'Small (High Quality)',
    description: 'Better accuracy, slower',
    badge: 'Heavy',
    warning: 'Requires ~2GB RAM. May be slow on older devices.'
  }
];

export function ModelSelector() {
  const { selectedModel, setModel, status } = useCaptionStore();
  const [isOpen, setIsOpen] = useState(false);

  // Don't allow changing model during processing
  const isLocked = status === 'transcribing' || status === 'loading_model' || status === 'extracting_audio';

  const currentModel = MODELS.find(m => m.id === selectedModel) || MODELS[0];

  return (
    <div className="relative group">
      <button
        type="button"
        disabled={isLocked}
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
          border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)]
          ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <Cpu className="h-4 w-4 text-[var(--color-accent-primary)]" />
        <span className="hidden sm:inline text-[var(--color-text-secondary)]">Model:</span>
        <span className="text-[var(--color-text-primary)]">{currentModel.name}</span>
      </button>

      {/* Model Info Tooltip/Warning for Current Selection */}
      {currentModel.warning && !isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 p-2 text-xs bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-lg hidden group-hover:block z-50">
          <div className="flex items-start gap-1">
            <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
            <span>{currentModel.warning}</span>
          </div>
        </div>
      )}

      {/* Dropdown Menu */}
      {isOpen && !isLocked && (
        <div className="absolute top-full right-0 sm:left-0 sm:right-auto mt-2 w-72 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="p-2 space-y-1">
            {MODELS.map((model) => (
              <button
                key={model.id}
                onClick={() => {
                  setModel(model.id);
                  setIsOpen(false);
                }}
                className={`
                  w-full text-left p-2 rounded-lg transition-colors flex items-start gap-3
                  ${selectedModel === model.id 
                    ? 'bg-[var(--color-accent-primary)]/10 border border-[var(--color-accent-primary)]/20' 
                    : 'hover:bg-[var(--color-bg-tertiary)] border border-transparent'}
                `}
              >
                <div className={`mt-1 p-1 rounded-md ${selectedModel === model.id ? 'bg-[var(--color-accent-primary)] text-white' : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]'}`}>
                  {selectedModel === model.id ? <Check className="h-3 w-3" /> : <HardDrive className="h-3 w-3" />}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${selectedModel === model.id ? 'text-[var(--color-accent-primary)]' : 'text-[var(--color-text-primary)]'}`}>
                      {model.name}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                    {model.description}
                  </p>
                  
                  {model.warning && (
                    <div className="flex items-center gap-1 mt-1.5 text-[10px] font-medium text-yellow-500">
                      <AlertTriangle className="h-3 w-3" />
                      {model.warning}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
