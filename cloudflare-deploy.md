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
    - *Alternative*:    - If Cloudflare build environment doesn't support `bun` out of the box yet without configuration, you can stick to `npm`/`yarn` by creating a `package-lock.json` via `npm install` and changing the build command to `npm run build`. However, since we are using `bun` locally, try to use `bun` in CI if possible.

## Deploying from CLI (Recommended)

Since you have `wrangler` installed, you can deploy directly from your terminal:

1.  **Configure Wrangler**: ensure you are logged in (`npx wrangler login`).
2.  **Deploy**: Run the following command:
    ```bash
    bun run deploy
    ```
    This will build the project and upload it to Cloudflare Pages (project `ai-cap`).

## Connecting to GitHub (for Automatic Deploys)

To have Cloudflare automatically deploy whenever you push to GitHub, follow these steps:

1.  **Go to Cloudflare Dashboard**: Navigate to **Workers & Pages**.
2.  **Select Project**: Click on your project (`ai-cap`).
3.  **Settings**: Go to the **Settings** tab -> **Builds & deployments**.
4.  **Connect Git**: Under "Configure Production Environment", click **Connect Git**.
5.  **Select GitHub**: Connect your GitHub account and select the `ai-cap` repository.
6.  **Build Settings**:
    - **Framework preset**: None
    - **Build command**: `bun run build`
    - **Build output directory**: `dist`
    - **Compatibility date**: `2024-09-23` (or later)
7.  **Environment Variables**: Ensure `ENABLE_BUN=1` is set if using their build system, or use their native Bun support if available.

After deployment, open the site and check the browser console. If `SharedArrayBuffer` is working, you shouldn't see errors related to it. You can also inspect the network response headers for the main document to verify the COOP/COEP headers are present.
