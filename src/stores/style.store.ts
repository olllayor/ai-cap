import { create } from 'zustand';

export type AnimationType = 'none' | 'pop' | 'highlight' | 'karaoke' | 'typewriter';

export interface CaptionStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  textColor: string;
  outlineColor: string;
  outlineWidth: number;
  backgroundColor: string;
  backgroundOpacity: number;
  shadowColor: string;
  shadowBlur: number;
  animation: AnimationType;
  highlightColor: string;
  yOffset: number; // % from bottom
  maxWidth: number; // % width
  uppercase: boolean;
}

interface StyleState {
  style: CaptionStyle;
  updateStyle: (updates: Partial<CaptionStyle>) => void;
  reset: () => void;
}

const DEFAULT_STYLE: CaptionStyle = {
  fontFamily: 'DM Sans',
  fontSize: 32,
  fontWeight: 700,
  textColor: '#FFFFFF',
  outlineColor: '#000000',
  outlineWidth: 1,
  backgroundColor: '#000000',
  backgroundOpacity: 0,
  shadowColor: 'rgba(0,0,0,0.5)',
  shadowBlur: 4,
  animation: 'highlight',
  highlightColor: '#6366f1', // Indigo-500
  yOffset: 8,
  maxWidth: 80,
  uppercase: true,
};

export const useStyleStore = create<StyleState>((set) => ({
  style: DEFAULT_STYLE,
  updateStyle: (updates) => set((state) => ({ style: { ...state.style, ...updates } })),
  reset: () => set({ style: DEFAULT_STYLE }),
}));
