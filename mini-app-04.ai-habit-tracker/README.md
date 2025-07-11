# AI Habit Tracker

A smart habit tracking mini-app built for the Nostr ecosystem. Users can stake sats on their habits, post progress updates, and receive AI-analyzed rewards based on their authentic progress.

## Features

### 🎯 Core Functionality

- **Habit Creation**: Create personalized habits with emojis, descriptions, and staking amounts
- **Progress Tracking**: Visual progress bars and streak counters
- **Daily Completion**: Mark habits as complete with instant feedback

### 🤖 AI-Powered Analysis

- **Content Analysis**: AI analyzes your progress posts for authenticity
- **Sentiment Detection**: Measures the positivity and genuineness of updates
- **Reward Recommendations**: Smart recommendations for sats rewards based on content quality

### ⚡ Bitcoin Integration

- **Staking Mechanism**: Stake sats to increase commitment to habits
- **Reward System**: Earn back staked sats plus rewards for consistent progress
- **Simple V0**: Single wallet system for easy MVP implementation

### 📱 Nostr Integration

- **Smart Widget**: Built as a YakiHonne Smart Widget for seamless Nostr integration
- **Post to Nostr**: Share progress updates directly to your Nostr feed
- **Hashtag Support**: Automatic hashtag generation for habit tracking

### 📊 Analytics & Insights

- **Streak Tracking**: Monitor your longest streaks and current progress
- **Stats Dashboard**: View total habits, staked sats, and completion rates
- **AI Insights**: Get AI-powered suggestions for habit improvement

## How It Works

1. **Create Habits**: Set up habits with personalized emojis and optional sats staking
2. **Track Progress**: Mark habits as complete daily and track your streaks
3. **Post Updates**: Share your progress with the Nostr community
4. **AI Analysis**: Get AI feedback on your progress posts
5. **Earn Rewards**: Receive sats rewards for authentic, consistent progress

## Technology Stack

- **Frontend**: React + Redux Toolkit
- **Styling**: CSS with custom design system
- **Icons**: Lucide React
- **Build**: Vite
- **Integration**: YakiHonne Smart Widget Handler (Nostr Client)

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Deployment

This mini-app is designed to be deployed as a YakiHonne Smart Widget:

1. Build the application: `npm run build`
2. Deploy to a hosting service (Vercel, Netlify, etc.)
3. Update the `widget.json` manifest with your pubkey and deployment URL
4. Register with YakiHonne Widget Editor

## Widget Manifest

The app includes a `widget.json` file that defines the smart widget metadata:

## Features in Detail

### Habit Management

- Create unlimited habits with custom emojis and descriptions
- Set staking amounts to increase commitment
- Track streaks and total completions
- Visual progress indicators

### AI Analysis

- Mock AI service (easily replaceable with real AI API)
- Sentiment analysis of progress posts
- Keyword extraction and relevance scoring
- Reward recommendations based on content quality

### Responsive Design

- Mobile-first approach
- Accessible on all devices
- Optimized for embedding in Nostr clients

## Future Enhancements

- Real AI integration (OpenAI, Claude, etc.)
- Lightning Network integration for instant payments
- Multi-signature wallet support
- Advanced analytics and insights
- Social features and habit sharing
- Gamification elements

## Contributing

This is a hackathon project for the Agentic Mini Apps Hack on Nostr. Feel free to fork and improve!
