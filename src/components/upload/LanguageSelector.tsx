import { useCaptionStore } from '../../stores/caption.store';
import { Globe, Check } from 'lucide-react';
import { useState, useEffect } from 'react';

// Common languages for quick access, plus full list support later if needed
const COMMON_LANGUAGES = [
  { code: 'auto', name: 'Auto Detect' },
  { code: 'en', name: 'English' },
  { code: 'ru', name: 'Russian' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ar', name: 'Arabic' },
  { code: 'tr', name: 'Turkish' },
];

export function LanguageSelector() {
  const { selectedLanguage, setLanguage, selectedModel, status } = useCaptionStore();
  const [isOpen, setIsOpen] = useState(false);

  // Lock if processing
  const isLocked = status === 'transcribing' || status === 'loading_model' || status === 'extracting_audio';

  // Lock to English if using English-only model
  useEffect(() => {
    if (selectedModel.endsWith('.en') && selectedLanguage !== 'en') {
        setLanguage('en');
    }
  }, [selectedModel, selectedLanguage, setLanguage]);

  const isEnglishOnly = selectedModel.endsWith('.en');
  const currentLang = COMMON_LANGUAGES.find(l => l.code === selectedLanguage) || { code: selectedLanguage, name: selectedLanguage };

  return (
    <div className="relative group">
      <button
        type="button"
        disabled={isLocked || isEnglishOnly}
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
          border border-[var(--color-border)] bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)]
          ${(isLocked || isEnglishOnly) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <Globe className="h-4 w-4 text-[var(--color-accent-primary)]" />
        <span className="hidden sm:inline text-[var(--color-text-secondary)]">Lang:</span>
        <span className="text-[var(--color-text-primary)]">{currentLang.name}</span>
      </button>

      {/* Tooltip for English-only model */}
      {isEnglishOnly && !isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 p-2 text-xs bg-black/80 text-white rounded-lg hidden group-hover:block z-50">
            Selected model supports English only.
        </div>
      )}

      {/* Dropdown Menu */}
      {isOpen && !isLocked && !isEnglishOnly && (
        <div className="absolute top-full right-0 sm:left-0 sm:right-auto mt-2 w-48 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl shadow-xl z-50 overflow-hidden max-h-80 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
          <div className="p-1 space-y-0.5">
            {COMMON_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={`
                  w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between
                  ${selectedLanguage === lang.code 
                    ? 'bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)]' 
                    : 'text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]'}
                `}
              >
                <span className="text-sm font-medium">{lang.name}</span>
                {selectedLanguage === lang.code && <Check className="h-3 w-3" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
