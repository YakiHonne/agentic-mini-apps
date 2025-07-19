
# Agentic Mini Apps Hack on Nostr Round 1

Build your AI-powered MiniApp, unlock new possibilities in decentralized social and payment experiences
# 📅 Timeline & Prize Pool

- Kickoff: June 20, 2025 
- Development Phase: June 20 – July 15 
- Demo & Community Review: July 15 – July 31 
- Final Results: Early August

# 💰 Total Prize Pool: 10,000,000 sats (paid in BTC), awarded across three rounds:

- 🥇 1st Prize: 1,000,000 sats 1 
- 🥈 2nd Prize: 700,000 sats 1 
- 🥉 3rd Prize: 500,000 sats  2 
- 🎁 Participation Rewards – All successfully deployed MiniApps will receive rewards (details TBA)

# 🛠 Hackathon Tracks

- Nostr Tools: Nip-05 services, Relay tools, Short notes services, plugins and more.  
- Payment Solutions –  Innovations in Payments: BTC, Lightning, Stablecoins, and Local Currencies; Red packets, tipping, QR pay, content paywalls, merchant tools  
- AI Interaction – AI bots, content recommenders, smart media MiniApps  
- Other Innovative Use Cases – Any decentralized application idea is welcome  

# How to participate?
✅ Nostr Version:
- Submit your application to [YakiHonne Smart Widgets GitHub](https://github.com/YakiHonne/agentic-mini-apps)
- Deploy your MiniApp via YakiHonne (new or adapted from an existing app)
- Your MiniApp must be usable and testable in Nostr posts

# 🧑‍⚖️ Judging Criteria
- Technical implementation & innovation
- UX/UI design quality
- Level of decentralization
- Integration with Nostr / YakiHonne
- Community votes
- Expert panel evaluation


# 🎉 Why Join?
- Build the next generation of AI-powered decentralized MiniApps
- Deploy on the most open and composable network: Nostr + Lightning + AI
- Gain global exposure, community traffic, and funding
- Rapidly validate your ideas in the real world
- Pioneer the Agentic MiniApp development track


# 🚀 Why Join the Agentic Mini Apps Hack on Nostr?

The Nostr network is rapidly growing, opening up unprecedented opportunities for innovation in decentralized social and payment systems. At the same time, AI is revolutionizing how we interact—with intelligent agents, social assistants, and content recommendations.

**Agentic MiniApps represent a new generation of applications designed for this future:**
✅ Lightweight, open, and composable. 
✅ Natively support AI, payments, and social interaction.
✅ Decentralized deployment—no downloads needed, users access them directly from Nostr posts.
### Agentic Mini Apps Hack on Nostr – Round 1 is the first hackathon centered on this emerging format. It combines Nostr + Bitcoin/Lightning payments + AI to explore the next generation of decentralized apps, enriching Nostr with advanced social, payment, and intelligent interaction capabilities—powering the open ecosystem forward.
# What is a  Mini App?

A MiniApp as a Smart Widgets are interactive graphical components encapsulated as Nostr events, designed for seamless integration into applications. Each widget type serves a specific purpose, with well-defined structures and behaviors to support various use cases.

Refer to https://yakihonne.com/docs/sw/intro for full documentation.

## Widget Types

### Basic Widget (Does not concern the current Hackathon)

- **Description:** A versatile widget comprising multiple UI components for flexible display and interaction.
- **Components:**
    - Images (mandatory, maximum of one).
    - Input Field (optional, maximum of one).
    - Buttons (optional, maximum of six).
- **Use Case:** Ideal for scenarios requiring a combination of visual elements and user inputs, such as forms or dashboards.

![1744436557264-YAKIHONNES3 (2)](https://github.com/user-attachments/assets/cd20ace8-659d-4a41-9008-319cfd4e2956)

### Action Widget

- **Description:** A streamlined widget designed to trigger an action by embedding a URL in an iframe.
- **Components:**
    - Image (single, for visual representation).
    - Button (single, type: app).
- **Behavior:**
    - Clicking the button opens the specified URL within an iframe.
    - The iframe does not return any data to the parent application.
- **Use Case:** Suitable for launching external applications or resources without expecting a response, such as opening a third-party tool.

### Tool Widget

- **Description:** A widget that facilitates interaction with an external application via an iframe, with data exchange capabilities.
- **Components:**
    - Image (single, for visual representation).
    - Button (single, type: app).
- **Behavior:**
    - Clicking the button opens the specified URL within an iframe.
    - The iframe is configured to return data to the parent application upon interaction.
- **Use Case:** Perfect for scenarios requiring data retrieval or feedback from an external tool, such as a configuration interface or a data picker.

![1744437071492-YAKIHONNES3 (1)](https://github.com/user-attachments/assets/81da2805-2a06-4124-a7f5-f4feb86db250)

## Technical Notes

- **Nostr Event Structure:** Each widget is represented as a Nostr event, ensuring compatibility with the Nostr protocol for decentralized communication.
- **Iframe Integration:** For Action and Tool widgets, the iframe must adhere to standard web security practices (e.g., sandboxing, CORS policies) to ensure safe URL embedding.
- **Extensibility:** Developers can customize widget appearance and behavior within the defined constraints (e.g., maximum button limits, single input field) to align with application requirements.
# 🔧 How to Deploy Your MiniApp?

Developers will build and deploy via the YakiHonne Programmable Smart Widgets Product: 
1. Build your mini app using YakiHonne provided packages 
	1. Smart widget handler package: https://yakihonne.com/docs/sw/smart-widget-handler
	2. Smart widget previewer package (required for clients): https://yakihonne.com/docs/sw/smart-widget-previewer
2. Deploy to a hosting service:
	1. Vercel, Netflify, GitHub Pages, etc.
	2. Ensure the `/.well-known/widget.json` file is accessible (Widget Manifest)
	```JSON
		{
	  "pubkey": "your-nostr-pubkey-in-hex",
	  "widget": {
	    "title": "My Amazing Widget",
	    "appUrl": "https://your-app-url.com",
	    "iconUrl": "https://your-app-url.com/icon.png",
	    "imageUrl": "https://your-app-url.com/thumbnail.png",
	    "buttonTitle": "Launch Widget",
	    "tags": ["tool", "utility", "nostr"]
	  }
	}	
	// This manifest serves two important purposes: 
	// 1. Verifies the authenticity of your mini app
	// 2. Provides metadata for Nostr clients to display your widget (miniapp)
	```
3. Register with YakiHonne Widget Editor
	1. Go to the [YakiHonne Widget Editor](https://yakihonne.com/smart-widget-builder)
	2. Select `Action` or `Tool` based on your mini app type 
	3. Enter your mini app URL
	4. The editor will fetch your manifest and validate it 
	5. Configure any additional settings 
	6. Publish to Nostr 


# Side notes: 
- Smart widget previewer is required by Nostr client to preview all types of smart widgets whether: Action/Tool or even the Basic ones (Please refer to [Smart widget previewer](https://yakihonne.com/docs/sw/smart-widget-previewer) for more details)
- Smart widget builder is only used to created embedde `Basic` smart widgets types, which out of scope for this hackathon (Please refer to [Smart widget builder](https://yakihonne.com/docs/sw/smart-widget-builder) for more details)
- Smart widget handler is necessary for the `MiniApps` developers to build and deploy their `Mini-Apps` (Smart widgets from types: Action/Tool) (Please refer to [Smart widget handler](https://yakihonne.com/docs/sw/smart-widget-handler) for more details)
# Common Use Cases
## Action Mini Apps
- Note composers with special formatting
- Media uploaders
- Event creators
- NFT minters
- Payment widgets
## Tool Mini Apps
- Analytics providers
- Search tools
- Data aggregators
- Content recommendation engines
- Information lookup services

💡 YakiHonne Smart Widgets are programmable micro-app components enabling real-time social interaction, on-chain payments, and AI features—creating a seamless “scroll-and-use” experience.

# 🎯 Why Choose YakiHonne Smart Widgets?

⚡ Fast deployment, viral reach – Go live instantly, no app store approval, spread via Nostr posts 
🤖 Deep AI + Payment + Social integration – Build immersive, smart and transactional MiniApps  
🔐 One-click login – Use Nostr, a pubkey with no KYC hassle  
📈 High visibility – Your MiniApp lives in nostr events, clients, posts, DMs, and community feeds  
🌍 Open ecosystem – Supports Lightning / BTC / stablecoins, accessible across clients



# Reference Links 
- Smart widgets full documentation: https://yakihonne.com/docs/sw/intro
- Smart widgets builder package a package for NodeJS to build Nostr Smart Widgets: 
	- https://yakihonne.com/docs/sw/smart-widget-builder
	- https://www.npmjs.com/package/smart-widget-builder
- Smart widgets previewer a React component for previewing and interacting with Nostr-based Smart Widgets: 
	- https://yakihonne.com/docs/sw/smart-widget-previewer
	- https://www.npmjs.com/package/smart-widget-previewer
- Smart widgets handler an sdk to communicate with embeded apps on nostr smart widgets:
	- https://yakihonne.com/docs/sw/smart-widget-handler
	- https://www.npmjs.com/package/smart-widget-handler
# Quick Tutorials 
### Action/Tool smart widgets mini-apps Part 1
[![Action/Tool smart widgets mini-apps Part 1](https://img.youtube.com/vi/SS-5N-LVCPM/0.jpg)](https://www.youtube.com/watch?v=SS-5N-LVCPM)
### Action/Tool smart widgets mini-apps Part 2
[![Action/Tool smart widgets mini-apps Part 2](https://img.youtube.com/vi/4NfMqjkRKnQ/0.jpg)](https://www.youtube.com/watch?v=4NfMqjkRKnQ)
### Action/Tool smart widgets mini-apps Part 3
[![Action/Tool smart widgets mini-apps Part 3](https://img.youtube.com/vi/VGCEEGfIo_I/0.jpg)](https://www.youtube.com/watch?v=VGCEEGfIo_I)



{
  "pubkey": "52524fbb6588d0f8a73677fd3e4f0cefc204fd310f459bc6c476e23dae4025dc",
  "widget": {
    "title": "Bitstream Analytics",
    "appUrl": "https://bitstreamanalytics.netlify.app/",
    "iconUrl": "https://bitstreamanalytics.netlify.app/icon.jpg",
    "imageUrl": "https://bitstreamanalytics.netlify.app/",
    "buttonTitle": "Click to Learn",
    "tags": [
      "nostr",
      "bitcoin",
      "yakihonne"
    ]
  }
}