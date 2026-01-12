
# AI-Cap

AI-powered video captioning tool that runs entirely in your browser. Generate, style, and export captions with complete privacy.

## ✨ Features

- 🎥 **Client-Side Processing**: All video processing happens in your browser
- 🤖 **AI-Powered Transcription**: Automatic speech-to-text using Whisper
- 🎨 **Customizable Styles**: Font, size, color, and positioning options
- 📤 **Multiple Export Options**: SRT files or video with burned-in captions
- 🔒 **Privacy First**: Your videos never leave your device
- 🔐 **Secure Authentication**: Sign in with Google via Supabase

## 🚀 Quick Start

See [SETUP.md](./SETUP.md) for detailed setup instructions including:
- Supabase configuration
- Google OAuth setup
- Environment variables
- Database schema

### Prerequisites

- [Bun](https://bun.sh/) v1.0.0 or higher
- A [Supabase](https://supabase.com/) account
- Google Cloud project (for OAuth)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/olllayor/ai-cap.git
   cd ai-cap
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

4. Run the development server:
   ```bash
   bun run dev
   ```

## 📖 Documentation

- [Setup Guide](./SETUP.md) - Complete setup instructions
- [Project Overview](./GEMINI.md) - Architecture and conventions

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Video Processing**: FFmpeg.wasm (Web Workers)
- **AI/ML**: Hugging Face Transformers (Whisper)
- **State Management**: Zustand
- **Authentication**: Supabase Auth (Google OAuth)
- **Database**: Supabase (PostgreSQL)

## 📋 Roadmap

### Planned Features

- [ ] add 720, 1080, 2k and 4k export options
- [ ] add frame rate options (24, 30, 60 fps)
- [ ] add export presets (tiktok, youtube, instagram, etc)
- [ ] add ability to export only audio with burned in captions
- [ ] save caption projects to database
- [ ] share caption templates with other users

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see LICENSE file for details
