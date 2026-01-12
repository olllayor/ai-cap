import { Sparkles } from 'lucide-react';
import { UserProfile } from '../auth/UserProfile';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--color-border)] bg-[var(--color-bg-primary)]/95 backdrop-blur-lg">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)]">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-white">AI Captions</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-xs font-mono text-[var(--color-text-muted)]">100% Client-Side</div>
          <UserProfile />
        </div>
      </div>
    </header>
  );
}
