# Deploying to Cloudflare Pages

This project uses `ffmpeg.wasm` which requires `SharedArrayBuffer` support. This means the server must send specific headers:
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: require-corp`

We have included a `public/_headers` file which Cloudflare Pages automatically detects to apply these headers.

## Deployment Steps

1.  **Connect Repository**:
    - Go to the Cloudflare Dashboard -> Workers & Pages -> Create Application -> Pages -> Connect to Git.
    - Select this repository.

2.  **Build Settings**:
    - **Framework Preset**: None (or custom)
    - **Build Command**: `bun run build`
    - **Build Output Directory**: `dist`

3.  **Environment Variables**:
    - If needed, add `NODE_VERSION` (though Cloudflare usually detects this or uses a default).
    - Ensure Cloudflare uses a version of Node/Bun compatible with the project.
    - **IMPORTANT**: As of late 2024/2025, Cloudflare Pages supports Bun natively. If you don't see an option to select Bun version, you might need to use `npm install && npm run build` (if you add a package-lock.json) or ensure the build image supports `bun`.
    - *Alternative*: If Cloudflare build environment doesn't support `bun` out of the box yet without configuration, you can stick to `npm`/`yarn` by creating a `package-lock.json` via `npm install` and changing the build command to `npm run build`. However, since we are using `bun` locally, try to use `bun` in CI if possible.

## Verify Deployment

After deployment, open the site and check the browser console. If `SharedArrayBuffer` is working, you shouldn't see errors related to it. You can also inspect the network response headers for the main document to verify the COOP/COEP headers are present.
