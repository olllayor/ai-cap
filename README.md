

# AI-Cap - Smart Caption Editor

A client-side caption editor using FFmpeg.wasm and Whisper.

## Deployment

This project is optimized for **Cloudflare Pages**.

### Why Cloudflare Pages?
- **Unlimited Bandwidth**: Ideal for downloading large AI models (Whisper) on the client side.
- **Security Headers**: Native support for `Cross-Origin-Opener-Policy` and `Cross-Origin-Embedder-Policy` (required for FFmpeg.wasm) via `_headers`.
- **Future Scalability**: Seamless integration with **Cloudflare Workers AI** if you decide to move heavy inference to the edge.

### How to deploy:
1. Connect your GitHub repository to Cloudflare Pages.
2. Set the **Build command** to: `bun run build`
3. Set the **Output directory** to: `dist`
4. Ensure the `.node-version` file is respected.

## FEATURES

- [ ] add 720, 1080, 2k and 4k export options
- [ ] add frame rate options (24, 30, 60 fps)
- [ ] add export presets (tiktok, youtube, instagram, etc)
- [ ] add ability to export only audio with burned in captions
