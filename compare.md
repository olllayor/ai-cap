# Whisper Model Comparison

This document compares different versions of the Whisper model for use in **AI-Cap**.

Currently, AI-Cap uses `Xenova/whisper-tiny.en`, which is optimized for English and runs entirely in the browser.

## 1. Client-Side Models (Xenova / transformers.js)

These models run locally in the user's browser using WebAssembly and/or WebGPU.

| Model | Parameters | Quantized Size (Approx) | Est. VRAM/RAM Usage | Relative Speed | Multilingual Support | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Tiny** | 39 M | ~40 MB | ~500 MB - 1 GB | Fastest | Yes (`Xenova/whisper-tiny`) | Current default. Fast, low memory, good for English. Multilingual version is decent but less accurate. |
| **Small** | 244 M | ~200 MB | ~2 GB | Medium | Yes (`Xenova/whisper-small`) | Significant accuracy jump from Tiny. Viable for modern laptops/desktops. May struggle on mobile or older devices. |
| **Medium** | 769 M | ~600 MB | ~5 GB + | Slow | Yes (`Xenova/whisper-medium`) | High accuracy. **Not recommended for general web deployment** due to high memory usage; likely to crash browser tabs on average consumer hardware. |

### "What happens if we switch?"

*   **To `Xenova/whisper-tiny` (Multilingual):**
    *   **Pros:** Supports many languages (Spanish, French, etc.). Size is similar to `.en` version.
    *   **Cons:** Slightly lower accuracy on English compared to the specialized `.en` model.
    *   **Verdict:** Safe switch if multilingual support is a priority.

*   **To `Xenova/whisper-small`:**
    *   **Pros:** Much better transcription quality and handling of accents/noise.
    *   **Cons:** Initial download is 4-5x larger (~200MB). Inference is slower (2-4x slower). Higher RAM usage may crash tabs on low-end devices.
    *   **Verdict:** Good for a "High Quality" mode toggle, but risky as a default for all users.

## 2. Server-Side Integration (OpenAI Whisper API)

Switching to the official OpenAI Whisper API implies sending audio data to OpenAI's servers.

| Feature | Client-Side (Current) | OpenAI Whisper API |
| :--- | :--- | :--- |
| **Privacy** | **Private.** Audio never leaves the device. | **Not Private.** Audio is uploaded to OpenAI. |
| **Cost** | **Free** for you and the user. | **Paid.** ~$0.006 per minute of audio. |
| **Latency** | Instant (after model load). Real-time feedback possible. | High latency (upload + process + download). |
| **Offline** | Works offline. | Requires internet connection. |
| **Quality** | Limited by device power (Tiny/Small). | Best possible (uses Large-v2/v3 models). |
| **Architecture** | Simple (Static site). | Complex. Requires a **backend server** to securely hide your API key. |

### "What if we change to OpenAI Whisper model?"

If "OpenAI Whisper model" means the **API**:
*   You would need to build a backend (e.g., Node.js/NestJS) to proxy requests and manage API keys.
*   You lose the "Client-side / Privacy" selling point of AI-Cap.
*   You gain state-of-the-art accuracy (Whisper Large v3).

If "OpenAI Whisper model" means **running the official Python model locally**:
*   Not possible in the browser directly. We rely on the `Xenova` port (transformers.js) which *is* the supported way to run these models in the browser.

## Recommendation

1.  **For Multilingual Support:**
    *   Add a dropdown to let users select language (or use "Auto").
    *   Switch to `Xenova/whisper-tiny` (without `.en`) to support 100 languages with minimal performance cost.

2.  **For Better Quality:**
    *   Offer `Xenova/whisper-small` as an *opt-in* "High Quality" setting. distinct from the default "Fast" mode. Use a warning about download size and memory.

3.  **Stay Client-Side:**
    *   Do not switch to the OpenAI API unless 100% perfect accuracy is more important than privacy and zero-cost hosting.
