# ShopAssist AI — Technical Document

**Track:** 4 — AI Customer Support Agent for Commerce  
**Stack:** React (JSX), Claude API (claude-sonnet-4), Anthropic AI-in-Artifacts pattern  

---

## 1. Architecture Overview

```
┌──────────────────────────────────────────────────────┐
│                   Browser (Client)                    │
│                                                      │
│  ┌─────────────────────────────────────────────┐    │
│  │           React App (app.jsx)                │    │
│  │                                              │    │
│  │  ┌──────────────┐   ┌────────────────────┐  │    │
│  │  │ Intent       │   │ Conversation State  │  │    │
│  │  │ Classifier   │   │ (messages[])        │  │    │
│  │  │ (regex/NLP)  │   │                    │  │    │
│  │  └──────┬───────┘   └────────┬───────────┘  │    │
│  │         │                    │               │    │
│  │         └──────────┬─────────┘               │    │
│  │                    ▼                          │    │
│  │         ┌──────────────────┐                 │    │
│  │         │  Claude API Call │                 │    │
│  │         │  /v1/messages    │                 │    │
│  │         └────────┬─────────┘                 │    │
│  │                  │                            │    │
│  │         ┌────────▼─────────┐                 │    │
│  │         │ Response Parser  │                 │    │
│  │         │ + Escalation     │                 │    │
│  │         │   Detector       │                 │    │
│  │         └────────┬─────────┘                 │    │
│  │                  │                            │    │
│  │         ┌────────▼─────────┐                 │    │
│  │         │   Chat UI        │                 │    │
│  │         │ (messages, CSAT, │                 │    │
│  │         │  stats, badges)  │                 │    │
│  │         └──────────────────┘                 │    │
│  └─────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │   Anthropic API       │
              │  claude-sonnet-4      │
              │  (stateless, per-req) │
              └───────────────────────┘
```

---

## 2. Component Structure

### `App` (main component)
Manages all state and orchestrates the chat lifecycle.

**State:**
```javascript
messages[]     // Full conversation history (role, content, intent, time)
input          // Controlled textarea value
loading        // Boolean — API in flight
escalated      // Boolean — conversation flagged for human review
satisfaction   // null | string — CSAT response
```

### `Message`
Renders a single chat bubble. Handles user vs. assistant layout mirroring, intent badge display, and timestamps.

### `IntentBadge`
Color-coded pill showing the detected support category. Reads from `INTENT_COLORS` map.

### `TypingDots`
Animated 3-dot indicator shown while the API call is in flight.

---

## 3. Intent Classification

Intent is detected **client-side** using regex pattern matching before the API call. This enables:
- Zero-latency badge display
- Pre-classification logging (analytics hook)
- Fallback if API response is ambiguous

```javascript
function detectIntent(text) {
  const t = text.toLowerCase();
  if (t.match(/order|track|ship|deliver|package|where.*my/)) return "ORDER_STATUS";
  if (t.match(/return|refund|money back|exchange|cancel/))   return "RETURN_REFUND";
  if (t.match(/product|item|stock|available|compat/))        return "PRODUCT_QUESTION";
  if (t.match(/complain|angry|upset|terrible|worst/))        return "COMPLAINT";
  if (t.match(/account|password|login|sign in|profile/))     return "ACCOUNT_ISSUE";
  if (t.match(/policy|hour|payment|store|accept/))           return "GENERAL_FAQ";
  return "UNKNOWN";
}
```

**6 categories:**

| Intent | Color | Trigger Keywords |
|---|---|---|
| ORDER_STATUS | Green | order, track, ship, deliver, package |
| RETURN_REFUND | Amber | return, refund, money back, exchange, cancel |
| PRODUCT_QUESTION | Blue | product, item, stock, available, compatible |
| COMPLAINT | Red | complain, angry, upset, terrible, worst |
| ACCOUNT_ISSUE | Purple | account, password, login, sign in, profile |
| GENERAL_FAQ | Cyan | policy, hour, payment, store, accept |

---

## 4. Claude API Integration

### System Prompt Design
The system prompt defines:
1. **Persona** — "ShopAssist AI" for "NovaMart"
2. **Capabilities** — explicit list of 6 handled intents
3. **Behavioral constraints** — max 120 words, short paragraphs, escalate when can't resolve
4. **Output formatting** — use ✓ for confirmations, → for next steps
5. **Simulation instructions** — invent realistic order data when needed

```javascript
const res = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    system: SYSTEM_PROMPT,
    messages: history,   // full conversation passed every call
  }),
});
```

### Multi-turn Context
The full `messages[]` array (trimmed to `{role, content}`) is sent on every API call. This gives Claude full conversation context for follow-up questions like "what about the second item?" — critical for support flows.

---

## 5. Escalation Detection

After receiving each API response, the text is scanned for escalation signals:

```javascript
const isEscalation = 
  reply.toLowerCase().includes("escalate") || 
  reply.toLowerCase().includes("human agent");
if (isEscalation) setEscalated(true);
```

When triggered:
- `escalated` state flips to `true`
- A red banner appears in the chat UI
- Simulated wait time is displayed ("Avg wait: ~3 min")
- The session stat "Escalated" updates to "Yes"

In production, this would fire a webhook to a helpdesk system (Zendesk, Freshdesk) with the conversation transcript attached.

---

## 6. Failure Handling

| Failure Mode | Handling |
|---|---|
| API network error | `try/catch` renders a ⚠️ error message in chat |
| Empty API response | Falls back to `"Sorry, I couldn't process that."` |
| API rate limit | Error bubble shown; user can retry |
| Long conversations | No pruning currently; future: sliding window at ~20 messages |
| User sends empty message | `sendMessage` guards with `!text.trim()` check |

---

## 7. UX Decisions

### Typing indicator
Shown immediately when the API call starts. Prevents the user from thinking the app froze during the ~1–2s API latency.

### Quick prompts
6 chip buttons for the most common query types. Reduces friction — a customer who just received a wrong item can tap "Start a return" instead of typing. Tapping a chip calls `sendMessage()` directly.

### CSAT prompt
Appears after 5+ messages in the conversation. Non-blocking — floats above the input, doesn't interrupt the flow. Only shows once per session.

### Session stats bar
Lightweight analytics visible to the store operator (in a real deployment, this would be a dashboard, not inline). Useful for demo purposes to show intent detection working.

---

## 8. Limitations

1. **No persistent storage** — conversations are lost on page refresh
2. **Simulated order data** — Claude invents plausible but fake tracking numbers
3. **Single session** — no multi-tab or multi-user support
4. **No Shopify/WooCommerce integration** — requires additional backend
5. **English only** — system prompt and regex patterns are English-optimized
6. **Token cost scales with conversation length** — no summarization implemented

---

## 9. Security Considerations

- API key is handled by the Anthropic AI-in-Artifacts proxy — never exposed client-side
- No user PII is collected or stored
- System prompt includes implicit persona lock (Claude stays as ShopAssist AI)
- No tool use or code execution enabled — response is text-only

---

## 10. Future Technical Roadmap

| Priority | Feature | Complexity |
|---|---|---|
| High | Real order API integration (Shopify) | Medium |
| High | Persistent conversation history (localStorage / backend) | Low |
| Medium | Webhook-based escalation to Zendesk | Medium |
| Medium | Sliding window context management | Low |
| Medium | Multi-language support | Medium |
| Low | Voice input (Web Speech API) | Medium |
| Low | Analytics dashboard | High |
