import { Edit3, Palette, Download } from 'lucide-react';

export type Tab = 'edit' | 'style' | 'export';

interface TabNavigationProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  className?: string;
}

export function TabNavigation({ activeTab, onTabChange, className = '' }: TabNavigationProps) {
  return (
    <div className={`flex bg-[var(--color-bg-secondary)] p-1 rounded-xl border border-[var(--color-border)] w-fit mx-auto shadow-sm ${className}`}>
      <button 
        onClick={() => onTabChange('edit')}
        className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'edit' ? 'bg-[var(--color-accent-primary)] text-white shadow-lg' : 'text-[var(--color-text-secondary)] hover:text-white'}`}
      >
        <Edit3 className="h-4 w-4" /> Timeline
      </button>
      <button 
        onClick={() => onTabChange('style')}
        className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'style' ? 'bg-[var(--color-accent-primary)] text-white shadow-lg' : 'text-[var(--color-text-secondary)] hover:text-white'}`}
      >
        <Palette className="h-4 w-4" /> Style
      </button>
      <button 
        onClick={() => onTabChange('export')}
        className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'export' ? 'bg-[var(--color-accent-primary)] text-white shadow-lg' : 'text-[var(--color-text-secondary)] hover:text-white'}`}
      >
        <Download className="h-4 w-4" /> Export
      </button>
    </div>
  );
}
