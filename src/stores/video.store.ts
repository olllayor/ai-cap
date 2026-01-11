import { create } from 'zustand';

interface VideoState {
  file: File | null;
  videoUrl: string | null;
  duration: number;
  currentTime: number;
  isPlaying: boolean;
  dimensions: { width: number; height: number } | null;
  setFile: (file: File) => void;
  setDuration: (duration: number) => void;
  setCurrentTime: (time: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setDimensions: (width: number, height: number) => void;
  reset: () => void;
}

export const useVideoStore = create<VideoState>((set) => ({
  file: null,
  videoUrl: null,
  duration: 0,
  currentTime: 0,
  isPlaying: false,
  dimensions: null,
  setFile: (file) => {
    // Create object URL for preview
    const url = URL.createObjectURL(file);
    set({ file, videoUrl: url, currentTime: 0, isPlaying: false, dimensions: null });
  },
  setDuration: (duration) => set({ duration }),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setDimensions: (width, height) => set({ dimensions: { width, height } }),
  reset: () => set((state) => {
    if (state.videoUrl) {
      URL.revokeObjectURL(state.videoUrl);
    }
    return { file: null, videoUrl: null, duration: 0, currentTime: 0, isPlaying: false };
  }),
}));
