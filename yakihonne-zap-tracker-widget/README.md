# YakiHonne ZapTracker Widget

A YakiHonne widget that embeds the ZapTracker application for tracking Lightning Network zaps.

## Features

- 🚀 Embeds ZapTracker via iframe
- 🎨 Clean, responsive widget interface
- 🔄 Refresh and external link functionality
- ⚡ Lightning-themed design
- 🛡️ Secure iframe sandboxing
- 📱 Mobile-friendly responsive design

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
  "pubkey": "8535603a45cb8472b6749c0f9fa5d8a93cc223ef6572b47fbb72916c1eb809d7",
  "widget": {
    "title": "ZapTracker",
    "appUrl": "https://zap-tracker.netlify.app/",
    "iconUrl": "https://zap-tracker.netlify.app/new_logo3.png",
    "imageUrl": "https://zap-tracker.netlify.app/dashboard.png",
    "buttonTitle": "ZapTracker",
    "tags": ["zap", "nostr", "widget"]
  }
}
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

- The widget loads ZapTracker in a secure iframe
- Error handling and loading states are included
- The widget configuration is dynamically loaded
- Responsive design works on all screen sizes

## License

MIT License - feel free to use and modify as needed.
```

```# .gitignore

# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js
.yarn/install-state.gz

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
```
