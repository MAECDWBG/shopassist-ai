# Decision Log — ShopAssist AI

> Format: Considered X → Chose Y → Because Z

---

## DL-01: Track Selection
**Considered:** Track 1 (Shopping Agent), Track 3 (Checkout Copilot), Track 4 (Customer Support)  
**Chose:** Track 4 — AI Customer Support Agent  
**Because:** Customer support has the clearest problem scope for a solo build. The input/output contract (message in → helpful response out) is well-defined, demonstrable in a 5-minute video, and doesn't require external API integrations to feel real. Tracks 1 and 3 require product catalog data or checkout session state to be convincing.

---

## DL-02: UI Framework
**Considered:** Vanilla HTML/CSS/JS, Vue, Svelte, React  
**Chose:** React (JSX)  
**Because:** React's component model makes the chat message list clean to implement. State management for the conversation history, loading state, and escalation flag is straightforward with `useState`. JSX is the most readable format for a hackathon reviewer scanning the code.

---

## DL-03: Intent Classification Location
**Considered:** (A) Ask Claude to classify intent in its response, (B) Client-side regex, (C) Separate classifier API call  
**Chose:** Client-side regex (Option B)  
**Because:** Option A adds prompt complexity and requires parsing the response. Option C adds latency and cost. Client-side regex runs in <1ms, shows the badge instantly (before the API returns), and keeps the intent signal decoupled from the AI response. Accuracy is sufficient for 6 well-defined categories.

---

## DL-04: Conversation State Management
**Considered:** (A) Send only the last message to the API, (B) Send full history on every call, (C) Server-side session state  
**Chose:** Full history on every call (Option B)  
**Because:** Support conversations require context — "update on my refund" is meaningless without the earlier exchange about the order. Option A breaks multi-turn. Option C requires a backend server. The token overhead is acceptable for typical support conversations (5–15 turns).

---

## DL-05: Real vs. Simulated Order Data
**Considered:** (A) Shopify API integration, (B) Hardcoded mock data, (C) Claude simulates realistic data  
**Chose:** Claude simulates (Option C)  
**Because:** Shopify OAuth takes hours to set up and requires a live store. Hardcoded mocks look obviously fake and break if the user asks follow-up questions. Letting Claude simulate plausible order numbers, tracking statuses, and timelines keeps the conversation flowing naturally while demonstrating the AI's core behavior. Limitation is clearly documented.

---

## DL-06: Escalation Detection Method
**Considered:** (A) Keyword scan on Claude's response, (B) Separate API call to classify escalation, (C) Claude returns a structured JSON flag  
**Chose:** Keyword scan on response (Option A)  
**Because:** Options B and C add latency and complexity. The system prompt instructs Claude to use the phrases "escalate" or "human agent" when it can't resolve something — so scanning for these keywords is reliable given controlled prompting. In production, Option C (structured output) would be preferred for robustness.

---

## DL-07: CSAT Timing
**Considered:** (A) Ask for rating after every AI message, (B) Show once after N exchanges, (C) Show at end of session only  
**Chose:** After 5+ messages (Option B)  
**Because:** Option A is annoying and interrupts flow. Option C misses the moment — users often close the tab once resolved. Showing after 5 messages means the conversation has had enough substance to rate, but the user is still engaged.

---

## DL-08: Visual Design Direction
**Considered:** Light/clean SaaS style, dark enterprise dashboard, playful colorful chat  
**Chose:** Dark, refined enterprise — deep navy background, blue gradient accents, subtle glass effects  
**Because:** Customer support tools are used in professional contexts. The dark theme reduces eye strain during long shifts. Navy + blue signals trust and reliability (consistent with financial/commerce SaaS conventions). Avoids the generic purple-gradient-on-white AI aesthetic.

---

## DL-09: Font Choice
**Considered:** Inter (too generic), Geist, DM Sans + Syne  
**Chose:** DM Sans (body) + Syne (headings)  
**Because:** DM Sans is legible at small sizes for chat text. Syne's geometric boldness gives the header visual authority without being aggressive. The pairing avoids the overused Inter/Space Grotesk defaults and gives the product a distinctive identity.

---

## DL-10: Solo Time Split
**Spent:** ~40% product/UX thinking, ~60% implementation  
**Rationale:** The problem space and scope decisions were made upfront (DL-01 through DL-05). Getting these right before writing any code prevented rework. The implementation was faster because the architecture was already decided.
