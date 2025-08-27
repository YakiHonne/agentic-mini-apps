# 🌌 Nebulus - Nostr Research Agent

> AI-powered research assistant that finds, analyzes, and summarizes the best content from Nostr

Nebulus is a sophisticated decentralized mini-app that acts as your personal AI research assistant on the Nostr network. It leverages artificial intelligence to curate, analyze, and summarize content, making it easier to discover valuable insights from the growing Nostr ecosystem.

## ✨ Features

### 🔍 **Smart Research Agent**
- **Quick Scan**: Free basic keyword search across Nostr relays
- **Deep Analysis**: Premium AI-powered analysis with intelligent summaries (210 sats)
- **Time-filtered Search**: Search within specific time ranges (24h, 7d, 30d, all time)
- **Intelligent Curation**: AI identifies high-quality, relevant content

### 🤖 **AI-Powered Insights**
- **Content Summarization**: Get concise, one-sentence summaries of complex posts
- **Engagement Analysis**: Prioritizes content with high zaps, replies, and engagement
- **Author Reputation**: Filters for content from reputable authors
- **Context Awareness**: Understands topic relevance and content quality

### ⚡ **Lightning Integration**
- **Micro-transactions**: Pay for premium features with Lightning Network
- **WebLN Support**: Seamless integration with Alby and other Lightning wallets
- **Instant Payments**: 210 sats for deep analysis and AI summaries

### 📱 **Beautiful User Experience**
- **Modern UI**: Sleek, responsive design with smooth animations
- **Interactive Results**: Click on any event to view detailed information
- **Editable Summaries**: Customize AI-generated summaries before posting
- **One-Click Publishing**: Post research results directly to your Nostr feed

### 🔗 **Nostr Integration**
- **Smart Widget Handler**: Seamless integration with Nostr clients
- **Event Publishing**: Share research findings as formatted notes
- **Profile Integration**: Connect with your Nostr identity
- **Cross-Client Compatibility**: Works with all major Nostr clients

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- A Nostr client (Damus, Amethyst, Iris, etc.)
- Lightning wallet with WebLN support (Alby, etc.)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/nebulus.git
cd nebulus

# Install dependencies
pnpm install

# Run the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Usage

1. **Launch the App**: Open Nebulus in your Nostr client or web browser
2. **Connect Your Profile**: Your Nostr identity will be automatically detected
3. **Enter Research Query**: Type what you want to research in the search field
4. **Choose Analysis Type**:
   - **Quick Scan**: Free basic search
   - **Deep Analysis**: Premium AI analysis (210 sats)
5. **Review Results**: Browse AI-curated content with summaries
6. **Customize & Share**: Edit summaries and post to your Nostr feed

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Framer Motion animations
- **UI Components**: Radix UI, Custom component library
- **State Management**: Zustand
- **Nostr Integration**: Smart Widget Handler SDK
- **Lightning**: WebLN API
- **AI/LLM**: OpenAI/Gemini integration (backend)

## 📁 Project Structure

```
nebulus/
├── src/
│   ├── app/                 # Next.js app router
│   │   ├── globals.css      # Global styles
│   │   └── page.tsx         # Main research interface
│   ├── components/          # Reusable UI components
│   │   ├── ui/              # Base UI components
│   │   ├── user-card.tsx    # User profile card
│   │   ├── events.tsx       # Event listing component
│   │   └── event-detail-drawer.tsx # Event detail view
│   ├── lib/                 # Utilities and configuration
│   │   ├── store.ts         # Global state management
│   │   └── utils.ts         # Utility functions
│   └── types/               # TypeScript type definitions
├── public/                  # Static assets
└── package.json
```

## 🎯 Key Components

### Research Interface (`page.tsx`)
- Main search interface with time filtering
- Quick scan vs. deep analysis options
- Lightning payment integration
- Results display with animations

### User Card (`user-card.tsx`)
- Beautiful animated user profile display
- Connection status indicator
- Responsive design with hover effects

### Event Detail Drawer (`event-detail-drawer.tsx`)
- Comprehensive event information display
- Editable AI summaries
- One-click note publishing
- Technical metadata view

### Events Grid (`events.tsx`)
- Curated event listings
- AI summary highlights
- Click-to-view functionality
- Responsive card layout

## 🌟 Business Model

Nebulus implements a freemium model with Lightning micropayments:

- **Free Tier**: Basic keyword search, limited results
- **Premium Tier**: AI analysis, summaries, advanced filtering (210 sats)
- **Sustainable**: Micro-transactions make premium features accessible
- **Scalable**: Lightning Network enables global, instant payments

## 🔮 Future Roadmap

- [ ] **Multi-language Support**: AI summaries in multiple languages
- [ ] **Advanced Filters**: Author reputation, engagement metrics
- [ ] **Saved Searches**: Bookmark and track research topics
- [ ] **Collaboration**: Share research with teams
- [ ] **Analytics**: Research insights and trending topics
- [ ] **API Access**: Developer API for integrations
- [ ] **Mobile App**: Native iOS/Android applications

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Setup

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Run linting
pnpm lint
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Nostr Protocol**: For creating an open, decentralized social network
- **Lightning Network**: For enabling instant, low-cost micropayments
- **Smart Widget Handler**: For seamless Nostr client integration
- **OpenAI/Gemini**: For powering our AI analysis capabilities

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/nebulus/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/nebulus/discussions)
- **Nostr**: Follow us on Nostr for updates and announcements

---

**Made with ❤️ for the Nostr community**

*Nebulus - Your AI research companion in the decentralized future*
