# ShopAssist AI — Product Document

**Track:** 4 — AI Customer Support Agent for Commerce  
**Builder:** Solo  
**Version:** 1.0  

---

## 1. Problem Statement

E-commerce customer support is broken at scale. Small and mid-sized online stores face a painful tradeoff: hire a large support team (expensive, slow to scale) or leave customers waiting (churn, negative reviews). The average e-commerce store receives 40–70% repeat questions about the same topics — order status, returns, refund timelines, and store policies.

Existing chatbot solutions (Zendesk bots, Tidio, etc.) rely on rigid decision trees. They break the moment a customer phrases something unexpectedly. They feel robotic. And they can't handle nuance — like a customer who is *angry* about a late order and needs empathy before a solution.

**ShopAssist AI** solves this by deploying a Claude-powered conversational agent that understands natural language, detects emotional tone, classifies intent in real time, and knows when to escalate — all without a human needing to be in the loop for routine queries.

---

## 2. Target User

**Primary:** Small-to-mid e-commerce store owners and their support managers  
**Secondary:** End customers interacting with the support widget on a storefront

**User Persona — Store Owner "Priya":**
- Runs a D2C fashion brand on Shopify
- Gets ~200 support tickets/week; 70% are "where's my order?" or "how do I return?"
- Can't afford a 5-person support team
- Wants 24/7 coverage without paying overnight agents

---

## 3. What We Built

ShopAssist AI is a web-based AI customer support chat interface powered by Claude (claude-sonnet-4). It provides:

| Feature | Description |
|---|---|
| **Real-time AI responses** | Claude handles freeform customer queries with context |
| **Intent classification** | Detects 6 support categories client-side before the API call |
| **Intent badges** | Visual label on each AI response showing detected category |
| **Quick prompt chips** | One-tap access to the 6 most common query types |
| **Escalation detection** | Automatically flags conversations needing human handoff |
| **Satisfaction prompt** | In-chat CSAT survey after 4+ exchanges |
| **Session stats** | Live counter of messages, intents, escalation status |
| **Typing indicator** | Realistic UX while the AI responds |
| **Chat reset** | Start a fresh session without refreshing the page |

---

## 4. Key Decisions & Tradeoffs

### 4.1 Single-page web app vs. embeddable widget
**Chose:** Single-page app (React/JSX)  
**Why:** Embeddable widgets require iframe sandboxing, CORS configuration, and host-page negotiation — all scope creep for a hackathon demo. A standalone app demonstrates the full UX clearly.  
**Tradeoff:** Not immediately drop-in for a real Shopify store; would need wrapper work.

### 4.2 Client-side intent detection vs. asking Claude to classify
**Chose:** Client-side regex-based pre-classification  
**Why:** Zero latency for the badge display; gives immediate visual feedback before the API responds. Also lets us log intent without parsing the AI's response text.  
**Tradeoff:** Regex is brittle for edge cases. Production would use a lightweight classifier or Claude's first-pass classification.

### 4.3 Simulated store data vs. real Shopify API
**Chose:** Simulated (Claude invents plausible order numbers, tracking statuses)  
**Why:** Shopify API integration requires OAuth, webhooks, and a real store — days of work. The AI still demonstrates correct *behavior* and conversation flow.  
**Tradeoff:** Not production-ready for real order lookups without the integration layer.

### 4.4 Memory: stateless per-session vs. persistent
**Chose:** Full conversation history passed on every API call (stateful within session)  
**Why:** Claude has no memory between calls; passing the full `messages[]` array gives it context for multi-turn support conversations.  
**Tradeoff:** Long conversations increase token usage. Production would implement sliding window or summary compression.

---

## 5. Scope

### In Scope
- Natural language support for 6 intent categories
- Escalation detection and flagging
- In-session satisfaction collection
- Clean, production-grade UI

### Out of Scope (future work)
- Real order/inventory API integration (Shopify, WooCommerce)
- Persistent conversation history across sessions
- Agent dashboard for human handoff queue
- Multi-language support
- Voice input

---

## 6. Success Metrics (if productized)

| Metric | Target |
|---|---|
| First-contact resolution rate | >65% (vs. 30% for decision-tree bots) |
| Escalation rate | <25% of conversations |
| Average handle time | <90 seconds |
| CSAT score | >4.2/5 |
| Cost per resolved ticket | <$0.05 (API cost) |

---

## 7. Why Claude?

Claude was chosen over GPT-4 / Gemini for three reasons:
1. **Instruction following** — Claude reliably stays within the support persona and doesn't hallucinate off-topic content
2. **Tone calibration** — Claude naturally modulates between efficient (FAQ) and empathetic (complaints) without explicit per-turn instructions
3. **Safety** — Claude's built-in refusals prevent the agent from being jailbroken into saying something harmful in a customer-facing context
