# ShopAssist AI 🤖

**Track 4 — AI Customer Support Agent for Commerce**

> An AI-powered customer support chat agent for e-commerce stores, built on Claude. Handles order tracking, returns, product questions, complaints, and account issues — with real-time intent detection and automatic escalation.

---

## Problem Statement

Small e-commerce stores receive hundreds of repetitive support tickets weekly. 60–70% are the same 6 questions (order status, returns, refund timelines, etc.). Hiring support staff is expensive; rigid decision-tree bots frustrate customers. ShopAssist AI uses Claude to provide natural, empathetic, 24/7 support that resolves most queries without a human.

---

## Demo

-🎥 **Demo Video:** [ShopAssist AI Demo](https://www.loom.com/share/2fc129e73cdf42649687790c9e8521f5)
-📸 **Screenshots:** See `/screenshots/` folder

---

## Features

- 💬 Natural language support for 6 intent categories
- 🏷️ Real-time intent detection with color-coded badges
- ⚡ Quick-tap prompt chips for the most common queries
- 🔔 Automatic escalation detection and flagging
- ⭐ In-chat CSAT satisfaction survey
- 📊 Live session stats (messages, intents, escalation status)
- 🔄 Full multi-turn conversation context
- ✨ Production-grade dark UI with typing indicator

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (JSX), CSS-in-JS |
| AI | Anthropic Claude (claude-sonnet-4) |
| API | Anthropic `/v1/messages` |
| Hosting | Claude.ai Artifacts (demo) |
| Fonts | DM Sans + Syne (Google Fonts) |

---

## How to Run Locally

### Prerequisites
- Node.js 18+
- Anthropic API key

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/shopassist-ai.git
cd shopassist-ai

# 2. Install dependencies
npm install

# 3. Set your API key
cp .env.example .env
# Edit .env and add: VITE_ANTHROPIC_API_KEY=sk-ant-...

# 4. Start the dev server
npm run dev
```

Open `http://localhost:5173` in your browser.

> **Note:** The Claude.ai Artifacts version handles API authentication automatically. For local development, you need your own Anthropic API key.

### Project Structure

```
shopassist-ai/
├── src/
│   └── App.jsx              # Main application component
├── public/
│   └── index.html
├── screenshots/             # UI screenshots
├── README.md                # This file
├── PRODUCT_DOCUMENT.md      # What we built, for whom, and why
├── TECHNICAL_DOCUMENT.md    # Architecture and implementation details
├── DECISION_LOG.md          # Key decisions with reasoning
└── package.json
```

---

## How to Use

1. **Type naturally** — ask about your order, start a return, report a problem
2. **Use quick chips** — tap any quick prompt button for instant access to common queries
3. **Watch intent badges** — each AI response shows a color-coded detected category
4. **Escalation** — if the AI can't resolve your issue, it automatically flags for human review

---

## Supported Intent Categories

| Category | Example Queries |
|---|---|
| 📦 ORDER_STATUS | "Where is my order?", "Track my package" |
| ↩️ RETURN_REFUND | "I want to return this", "When will I get my refund?" |
| 🔍 PRODUCT_QUESTION | "Is this in stock?", "Does this work with X?" |
| 😞 COMPLAINT | "This is terrible", "I'm very disappointed" |
| 👤 ACCOUNT_ISSUE | "I can't log in", "Reset my password" |
| 📋 GENERAL_FAQ | "What's your return policy?", "Do you accept PayPal?" |

---

## Documentation

| Document | Description |
|---|---|
| [PRODUCT_DOCUMENT.md](./PRODUCT_DOCUMENT.md) | Problem, users, features, decisions, scope |
| [TECHNICAL_DOCUMENT.md](./TECHNICAL_DOCUMENT.md) | Architecture, implementation, failure handling, limitations |
| [DECISION_LOG.md](./DECISION_LOG.md) | 10 key decisions with "considered X, chose Y, because Z" format |

---

## Contribution Note (Solo Build)

This is a solo submission. Time was split approximately:

- **40% — Product thinking:** Track selection, problem scoping, user persona definition, UX flow design, intent category design, system prompt engineering, escalation logic design
- **60% — Engineering:** React component architecture, Claude API integration, intent classifier, escalation detector, CSAT flow, UI implementation, documentation writing

Both aspects were worked on simultaneously — documentation decisions were made as code decisions were made, not written after the fact.

---

## Limitations & Future Work

- Order data is simulated (no real Shopify/WooCommerce integration yet)
- Conversations are not persisted across page refreshes
- English only
- See `TECHNICAL_DOCUMENT.md` Section 10 for full roadmap

---

## License

MIT
