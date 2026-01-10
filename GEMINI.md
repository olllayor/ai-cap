# GEMINI.md - Project Overview: AI-Cap

This document provides a high-level overview of the **AI-Cap** project, its architecture, and development conventions to be used as instructional context for Gemini.

## 1. Project Overview

**AI-Cap** is a client-side video captioning tool built with React, TypeScript, and Vite. It allows users to upload a video, automatically generate captions using a client-side AI model, style the captions, and export the final video with the captions burned in.

The entire process, from audio extraction to transcription and video rendering, happens in the browser, ensuring user privacy.

### Core Technologies

*   **Frontend:** React, TypeScript, Vite, Tailwind CSS
*   **Video/Audio Processing:** `ffmpeg.wasm` is used inside a Web Worker to extract audio from videos and to burn subtitles into the final output.
*   **AI/Transcription:** `@huggingface/transformers` is used to run a client-side speech-to-text model (likely a variant of Whisper) for generating transcriptions.
*   **State Management:** `zustand` is used for global state management (e.g., video state, caption data).
*   **Worker Communication:** `comlink` is used to provide a clean API for communicating with the Web Workers that handle heavy tasks like video processing and transcription.

### Architecture

The application is structured around a central `App.tsx` component that orchestrates the main user workflow:

1.  **Compatibility Check:** Verifies if the user's browser supports `SharedArrayBuffer`, which is essential for `ffmpeg.wasm`.
2.  **Upload:** The user uploads a video file.
3.  **Studio View:** The main UI is presented, which is split into three main tabs:
    *   **Edit:** A timeline-based editor (`CaptionEditor.tsx`) to review and modify the generated captions.
    *   **Style:** A panel (`StylePanel.tsx`) to customize the appearance of the captions (font, color, size, etc.).
    *   **Export:** A panel (`ExportPanel.tsx`) to download the captions as an `.srt` file or to render the final video with burned-in captions.
4.  **Processing Pipeline:**
    *   The audio is extracted from the video using `ffmpeg.worker.ts`.
    *   The extracted audio is transcribed using `whisper.worker.ts`.
    *   The final video is rendered using `ffmpeg.worker.ts`.

## 2. Building and Running

### Prerequisites

*   `bun`(for development and production, package manager, runtime).

### Key Commands

The following commands are defined in `package.json`:

*   **Install Dependencies:**
    ```bash
    bun install
    ```

*   **Run Development Server:**
    Starts the app on `localhost`. The `vite.config.ts` sets the required headers for `SharedArrayBuffer` support.
    ```bash
    bun run dev
    ```

*   **Build for Production:**
    Type-checks the code with `tsc` and then bundles it with `vite`.
    ```bash
    bun run build
    ```

*   **Lint the Code:**
    Runs ESLint to check for code quality and style issues.
    ```bash
    bun run lint
    ```

*   **Preview Production Build:**
    Serves the production build locally.
    ```bash
    bun run preview
    ```

## 3. Development Conventions

*   **Component-Based Architecture:** The UI is built with reusable React components located in `src/components/`.
*   **State Management:** Global state is managed using `zustand` stores found in `src/stores/`. This is preferred for sharing state between non-parent/child components.
*   **Hooks:** Business logic and side effects are encapsulated in custom hooks (e.g., `useFFmpeg`, `useTranscription`) found in `src/hooks/`.
*   **Web Workers:** Computationally intensive tasks (FFmpeg, AI model inference) are offloaded to Web Workers (see `src/workers/`) to avoid blocking the main UI thread. `comlink` is used to simplify worker communication.
*   **Styling:** Tailwind CSS is used for styling, with custom theme values defined in `tailwind.config.js`.
*   **Typing:** The project is written in TypeScript, and type safety is enforced.
