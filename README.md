# LogiPulse — Customer Support Console

A React + TypeScript application for the back-office support team to monitor and assist users of the LogiPulse Angular app in real time via SignalR.

## Project Structure

```
src/
├── App.tsx                          # Root component
├── index.tsx                        # Entry point
├── constants.ts                     # Hub URL, agents, flows, UI element IDs
├── types/index.ts                   # TypeScript types matching .NET contracts
├── styles/globals.css               # Design tokens + base styles
├── services/
│   └── translation.ts               # Claude API translation + built-in fallback
├── hooks/
│   ├── useSignalR.ts                # SignalR connection + all hub logic
│   └── useToasts.ts                 # Toast notification state
└── components/
    ├── common/
    │   ├── Avatar.tsx               # User/agent avatar
    │   └── ToastDock.tsx            # Toast notification dock
    ├── layout/
    │   ├── Topbar.tsx               # Top bar with stats + agent pill
    │   ├── LoginScreen.tsx          # Agent login + API key setup
    │   └── ApiKeyModal.tsx          # In-app API key manager
    ├── users/
    │   └── UserList.tsx             # Left sidebar — online users
    ├── activity/
    │   └── ActivityFeed.tsx         # Real-time activity event feed
    ├── guidance/
    │   └── GuidancePanel.tsx        # Flow sender + element highlighter
    └── chat/
        └── ChatPanel.tsx            # Chat with auto-translation
```

## Getting Started

```bash
# Install dependencies
npm install

# Start development server (proxies API calls to http://localhost:5000)
npm start
```

The app runs at **http://localhost:3000** and connects to the .NET SignalR hub at **http://localhost:5000/hubs/support**.

If the .NET server is not running, the app automatically switches to **Demo Mode** with 4 sample users.

## Environment Variables

Create a `.env` file to override the hub URL:

```
REACT_APP_HUB_URL=http://your-server:5000/hubs/support
```

## Features

- **Real-time user monitoring** — online status, current page, idle time, click tracking
- **Activity feed** — stream of page visits, clicks, chats, stuck/idle alerts
- **Guided flows** — send `create_shipment`, `edit_shipment`, `view_invoice`, `track_shipment` flows; server translates and highlights elements in Angular app
- **Element highlighting** — build custom highlight sequences from live UI tree
- **Chat with translation** — type in English; Claude API translates to user's native language (ES/FR/AR/ZH); falls back to built-in phrases without a key
- **Idle/stuck detection** — visual alerts when users go idle ≥60s or repeatedly click the same element

## Running All Three Parts Together

```bash
# Terminal 1 — .NET Backend (LogiPulse.Server)
cd LogiPulse.Server/src/LogiPulse.Server
dotnet run

# Terminal 2 — Angular User App
cd logipulse-angular
npm install && ng serve

# Terminal 3 — This React Support Console
npm install && npm start
```
