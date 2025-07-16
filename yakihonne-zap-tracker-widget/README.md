# YakiHonne ZapTracker Widget

A YakiHonne widget that embeds the ZapTracker application for tracking Lightning Network zaps with full Nostr integration.

## Features

- 🚀 Embeds ZapTracker via secure iframe
- ⚡ Full Nostr integration using smart-widget-handler
- 🔐 Secure communication with YakiHonne parent app
- 👤 User context sharing from YakiHonne
- 📝 Event signing and publishing capabilities
- 🎨 Clean, responsive widget interface
- 🛡️ Secure iframe sandboxing
- 📱 Mobile-friendly responsive design

## Nostr Integration

This widget uses the official `smart-widget-handler` package for secure communication with YakiHonne:

### Client Features (Widget → YakiHonne)
- **Widget Ready Notification**: Tells YakiHonne when the widget is loaded
- **Event Publishing**: Request YakiHonne to sign and publish Nostr events
- **Custom Context**: Send custom data to the parent application
- **Message Listening**: Receive user data and responses from YakiHonne

### Host Features (YakiHonne → Widget)
- **User Context**: Receives user profile data from YakiHonne
- **Event Responses**: Gets signed/published event confirmations
- **Error Handling**: Receives error messages from failed operations

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. Clone or download this project
2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

### Development

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the widget.

### Building for Production

```bash
npm run build
npm run start
```

## Widget Configuration

The widget configuration is stored in `public/.well-known/widget.json`:

```json
{
  "pubkey": "pubkey",
  "widget": {
    "title": "ZapTracker",
    "appUrl": "https://zap-tracker.netlify.app/",
    "iconUrl": "/logo.png",
    "imageUrl": "https://zap-tracker.netlify.app/dashboard.png",
    "buttonTitle": "ZapTracker",
    "tags": ["zap", "nostr", "widget"]
  }
}
```

## Smart Widget Handler Usage

### Client Side (This Widget)

```javascript
import SWHandler from 'smart-widget-handler'

// Notify YakiHonne that widget is ready
SWHandler.client.ready()

// Listen for messages from YakiHonne
const listener = SWHandler.client.listen((data) => {
  if (data.kind === 'user-metadata') {
    setUser(data.data.user)
  }
})

// Request event publishing
SWHandler.client.requestEventPublish(eventDraft, parentOrigin)

// Send custom context
SWHandler.client.sendContext(JSON.stringify(data), parentOrigin)
```

### Host Side (YakiHonne)

```javascript
// Listen for widget messages
SWHandler.host.listen((data) => {
  if (data.kind === 'app-loaded') {
    // Send user context to widget
    SWHandler.host.sendContext(userProfile, hostOrigin, widgetOrigin, iframeRef)
  }
})

// Send signed events back to widget
SWHandler.host.sendEvent(signedEvent, 'success', widgetOrigin, iframeRef)
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

### Netlify

1. Build the project: `npm run build`
2. Deploy the `out` folder to Netlify

### Other Platforms

The widget can be deployed to any static hosting platform that supports Next.js.

## YakiHonne Integration

This widget is designed to work with the YakiHonne platform. The widget manifest is available at:

```
https://your-domain.com/.well-known/widget.json
```

## Development Notes

- Uses `smart-widget-handler` for secure parent-child communication
- Supports full Nostr event signing and publishing workflow
- Receives user context from YakiHonne automatically
- Error handling and loading states included
- Responsive design works on all screen sizes

## License

MIT License - feel free to use and modify as needed.
