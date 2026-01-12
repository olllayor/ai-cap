import { create } from 'zustand';

export interface Word {
  word: string;
  start: number;
  end: number;
  score?: number;
}

export interface Thumbnail {
  url: string;
  time: number;
}

interface CaptionState {
  transcript: Word[];
  isTranscribing: boolean;
  progress: number;
  status: string; // 'idle' | 'loading_model' | 'extracting_audio' | 'transcribing' | 'completed' | 'error'
  selectedModel: string;
  selectedLanguage: string;
  setTranscript: (words: Word[]) => void;
  setStatus: (status: string) => void;
  setProgress: (progress: number) => void;
  setModel: (model: string) => void;
  setLanguage: (lang: string) => void;
  reset: () => void;
}

export const useCaptionStore = create<CaptionState>((set) => ({
  transcript: [],
  isTranscribing: false,
  progress: 0,
  status: 'idle',
  selectedModel: 'Xenova/whisper-tiny.en',
  selectedLanguage: 'en', // Default to English since default model is .en
  setTranscript: (transcript) => set({ transcript }),
  setStatus: (status) => set({ status }),
  setProgress: (progress) => set({ progress }),
  setModel: (model) => set({ selectedModel: model }),
  setLanguage: (lang) => set({ selectedLanguage: lang }),
  reset: () => set({ 
    transcript: [], 
    isTranscribing: false, 
    progress: 0, 
    status: 'idle' 
  }),
}));
