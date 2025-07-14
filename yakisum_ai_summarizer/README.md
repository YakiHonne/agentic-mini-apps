# YakisomeAI Summarizer - YakiHonne Smart Widget

A Next.js-based smart widget for YakiHonne that provides AI-powered summarization of Nostr posts and articles using Google's Gemini AI.

## 🚀 Features

- **AI-Powered Summarization**: Uses Google Gemini 2.0 Flash to generate concise summaries of articles and Nostr posts
- **Nostr Integration**: Fetches and processes Nostr kind 1 events (posts) from the network
- **Smart Search**: Search through Nostr posts with keyword filtering
- **Article Cards**: Beautiful UI displaying article information with clickable links
- **Real-time Processing**: Live fetching and processing of Nostr events
- **YakiHonne Integration**: Designed as a smart widget for the YakiHonne Nostr client

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **AI**: Google Gemini 2.0 Flash API
- **Nostr**: @nostr-dev-kit/ndk for Nostr network integration
- **Database**: IndexedDB for local caching (via NDK)
- **Deployment**: Vercel-ready



## 🎯 Usage

### 1. Search Articles
- Enter a search query in the chat interface
- The system will fetch relevant Nostr posts from the last 7 days
- Results are displayed as article cards

### 2. Summarize Articles
- Click on an article card to trigger summarization
- The AI will generate a 3-5 sentence summary
- Summary appears as a chat message

### 3. Direct Summarization
- Provide a specific article ID or URL
- Get immediate summarization without search

## 🔍 How It Works

### Nostr Integration
- Uses NDK (Nostr Dev Kit) to connect to Nostr relays
- Fetches kind 1 events (text posts) from the network
- Processes and formats posts for display

### AI Summarization
- Sends article content to Google Gemini 2.0 Flash
- Uses structured prompts for consistent summaries
- Handles errors gracefully with fallback messages

### UI/UX
- Responsive design with mobile support
- Real-time chat interface
- Article cards with metadata display
- Loading states and error handling



## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [YakiHonne](https://yakihonne.com/) for the Nostr client platform
- [Google Gemini](https://ai.google.dev/) for AI capabilities
- [Nostr Dev Kit](https://github.com/nostr-dev-kit/ndk) for Nostr integration
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components

## 📞 Support

For support, please open an issue on GitHub or contact the development team.

---

**Built with ❤️ for the Nostr community** 