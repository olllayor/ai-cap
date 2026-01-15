import { Edit3, Palette, Download } from 'lucide-react';

export type Tab = 'edit' | 'style' | 'export';

interface TabNavigationProps {
	activeTab: Tab;
	onTabChange: (tab: Tab) => void;
	className?: string;
}

export function TabNavigation({ activeTab, onTabChange, className = '' }: TabNavigationProps) {
	const tabs = [
		{ id: 'edit' as Tab, icon: Edit3, label: 'Edit' },
		{ id: 'style' as Tab, icon: Palette, label: 'Style' },
		{ id: 'export' as Tab, icon: Download, label: 'Export' },
	];

	return (
		<div
			className={`flex bg-[var(--color-bg-tertiary)]/50 p-1 rounded-xl border border-[var(--color-border)] w-fit mx-auto backdrop-blur-sm ${className}`}
		>
			{tabs.map((tab) => {
				const Icon = tab.icon;
				return (
					<button
						key={tab.id}
						onClick={() => onTabChange(tab.id)}
						className={`
              relative flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all
              ${
								activeTab === tab.id
									? 'bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] text-white shadow-md'
									: 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]'
							}
            `}
					>
						<Icon className="h-4 w-4" />
						<span>{tab.label}</span>
					</button>
				);
			})}
		</div>
	);
}
