import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `You are ShopAssist AI, a customer support agent for an e-commerce platform called "NovaMart". You are warm, efficient, and solution-focused.

You handle these intents:
1. ORDER_STATUS - Track orders, shipping updates
2. RETURN_REFUND - Process returns, refund status
3. PRODUCT_QUESTION - Product details, availability, compatibility
4. COMPLAINT - Handle dissatisfied customers with empathy
5. ACCOUNT_ISSUE - Password reset, account access, profile help
6. GENERAL_FAQ - Store policies, hours, payment methods

For each message:
- Identify the intent
- Respond helpfully and concisely
- If you cannot resolve it, say you'll escalate to a human agent
- Always offer a follow-up: "Is there anything else I can help with?"

Simulate realistic responses. For order tracking, invent believable order numbers and statuses. For returns, walk through the process step-by-step. Be natural and human-feeling, not robotic.

Keep responses under 120 words. Format with short paragraphs. Use ✓ for confirmations, → for next steps.`;

const QUICK_PROMPTS = [
  { label: "Track my order", icon: "📦" },
  { label: "Start a return", icon: "↩️" },
  { label: "Refund status", icon: "💳" },
  { label: "Product question", icon: "🔍" },
  { label: "Account help", icon: "👤" },
  { label: "Store policies", icon: "📋" },
];

const INTENT_COLORS = {
  ORDER_STATUS: "#22c55e",
  RETURN_REFUND: "#f59e0b",
  PRODUCT_QUESTION: "#3b82f6",
  COMPLAINT: "#ef4444",
  ACCOUNT_ISSUE: "#8b5cf6",
  GENERAL_FAQ: "#06b6d4",
  UNKNOWN: "#6b7280",
};

function detectIntent(text) {
  const t = text.toLowerCase();
  if (t.match(/order|track|ship|deliver|package|where.*my/)) return "ORDER_STATUS";
  if (t.match(/return|refund|money back|exchange|cancel/)) return "RETURN_REFUND";
  if (t.match(/product|item|stock|available|compat|work with/)) return "PRODUCT_QUESTION";
  if (t.match(/complain|angry|upset|terrible|worst|disappoint|never again/)) return "COMPLAINT";
  if (t.match(/account|password|login|sign in|profile|email/)) return "ACCOUNT_ISSUE";
  if (t.match(/policy|hour|payment|store|accept|how do/)) return "GENERAL_FAQ";
  return "UNKNOWN";
}

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center", padding: "12px 16px" }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: "50%",
          background: "#94a3b8",
          animation: "bounce 1.2s ease-in-out infinite",
          animationDelay: `${i * 0.2}s`,
        }} />
      ))}
    </div>
  );
}

function IntentBadge({ intent }) {
  if (!intent || intent === "UNKNOWN") return null;
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
      color: INTENT_COLORS[intent] || "#6b7280",
      background: `${INTENT_COLORS[intent]}18`,
      border: `1px solid ${INTENT_COLORS[intent]}40`,
      borderRadius: 20, padding: "2px 8px",
      marginBottom: 6,
    }}>
      <div style={{ width: 5, height: 5, borderRadius: "50%", background: INTENT_COLORS[intent] }} />
      {intent.replace("_", " ")}
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === "user";
  const isError = msg.isError;
  return (
    <div style={{
      display: "flex",
      flexDirection: isUser ? "row-reverse" : "row",
      gap: 10, marginBottom: 20,
      animation: "fadeSlideIn 0.3s ease-out",
    }}>
      {!isUser && (
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: isError
            ? "linear-gradient(135deg, #7f1d1d, #ef4444)"
            : "linear-gradient(135deg, #1e40af, #3b82f6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, flexShrink: 0, marginTop: 2,
          boxShadow: "0 2px 8px #3b82f640",
        }}>{isError ? "⚠️" : "🤖"}</div>
      )}
      <div style={{ maxWidth: "80%", minWidth: 60 }}>
        {!isUser && msg.intent && <IntentBadge intent={msg.intent} />}
        <div style={{
          background: isUser
            ? "linear-gradient(135deg, #1e40af, #2563eb)"
            : isError
            ? "rgba(239,68,68,0.08)"
            : "rgba(255,255,255,0.07)",
          border: isUser ? "none" : isError ? "1px solid rgba(239,68,68,0.3)" : "1px solid rgba(255,255,255,0.08)",
          color: isError ? "#fca5a5" : "#f1f5f9",
          borderRadius: isUser ? "18px 4px 18px 18px" : "4px 18px 18px 18px",
          padding: "11px 15px",
          fontSize: 14, lineHeight: 1.6,
          whiteSpace: "pre-wrap",
          boxShadow: isUser ? "0 4px 12px #1e40af40" : "none",
        }}>
          {msg.content}
        </div>
        <div style={{ fontSize: 10, color: "#475569", marginTop: 4, textAlign: isUser ? "right" : "left" }}>
          {msg.time}
        </div>
      </div>
      {isUser && (
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: "linear-gradient(135deg, #334155, #475569)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, flexShrink: 0, marginTop: 2,
        }}>🧑</div>
      )}
    </div>
  );
}

export default function App() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I'm ShopAssist AI — NovaMart's support agent. I can help with orders, returns, products, and account issues.\n\nWhat can I help you with today?",
      intent: null,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [escalated, setEscalated] = useState(false);
  const [satisfaction, setSatisfaction] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text) {
    if (!text.trim() || loading) return;
    const userMsg = {
      role: "user",
      content: text,
      intent: detectIntent(text),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const history = newMessages.map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-5",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: history,
        }),
      });

      const data = await res.json();

      // Show actual API error if request failed
      if (!res.ok) {
        const errMsg = data?.error?.message || JSON.stringify(data);
        setMessages((prev) => [...prev, {
          role: "assistant",
          content: `API Error ${res.status}: ${errMsg}`,
          intent: null,
          isError: true,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }]);
        setLoading(false);
        return;
      }

      const reply = data.content?.[0]?.text || "No response text returned.";
      const isEscalation = reply.toLowerCase().includes("escalate") || reply.toLowerCase().includes("human agent");
      if (isEscalation) setEscalated(true);

      setMessages((prev) => [...prev, {
        role: "assistant",
        content: reply,
        intent: userMsg.intent,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }]);

    } catch (err) {
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: `Network error: ${err.message}. Check your internet connection and try again.`,
        intent: null,
        isError: true,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }]);
    }

    setLoading(false);
    inputRef.current?.focus();
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  function resetChat() {
    setMessages([{
      role: "assistant",
      content: "Hi! I'm ShopAssist AI — NovaMart's support agent. I can help with orders, returns, products, and account issues.\n\nWhat can I help you with today?",
      intent: null,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }]);
    setEscalated(false);
    setSatisfaction(null);
    setInput("");
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080f1a",
      backgroundImage: "radial-gradient(ellipse at 20% 20%, #0f2444 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, #0a1628 0%, transparent 60%)",
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: 16,
      fontFamily: "'DM Sans', system-ui, sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }
        @keyframes fadeSlideIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1e3a5f; border-radius: 4px; }
        textarea:focus { outline: none; }
      `}</style>

      {/* Header */}
      <div style={{ width: "100%", maxWidth: 680, marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{
              fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800,
              color: "#f1f5f9", letterSpacing: "-0.02em",
            }}>
              ShopAssist <span style={{ color: "#3b82f6" }}>AI</span>
            </div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 1 }}>
              NovaMart Customer Support · Powered by Claude
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 5,
              background: "#0d2137", border: "1px solid #1e3a5f",
              borderRadius: 20, padding: "4px 10px", fontSize: 11, color: "#22c55e",
            }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", animation: "pulse 2s infinite" }} />
              Online
            </div>
            <button onClick={resetChat} style={{
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8, padding: "5px 12px", color: "#94a3b8", fontSize: 12,
              cursor: "pointer",
            }}>Reset</button>
          </div>
        </div>
      </div>

      {/* Chat window */}
      <div style={{
        width: "100%", maxWidth: 680,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 20, overflow: "hidden",
        boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
      }}>
        {/* Messages */}
        <div style={{ height: 440, overflowY: "auto", padding: "20px 20px 0" }}>
          {messages.map((m, i) => <Message key={i} msg={m} />)}
          {loading && (
            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 10,
                background: "linear-gradient(135deg, #1e40af, #3b82f6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, flexShrink: 0,
              }}>🤖</div>
              <div style={{
                background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "4px 18px 18px 18px",
              }}>
                <TypingDots />
              </div>
            </div>
          )}

          {/* CSAT after 5+ messages */}
          {messages.length >= 5 && !satisfaction && (
            <div style={{
              textAlign: "center", marginBottom: 20, padding: "12px",
              background: "rgba(255,255,255,0.03)", borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.06)",
            }}>
              <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8 }}>How's this going?</div>
              <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                {["😄 Great", "😐 Okay", "😞 Not good"].map((s) => (
                  <button key={s} onClick={() => setSatisfaction(s)} style={{
                    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 20, padding: "4px 12px", color: "#cbd5e1", fontSize: 12, cursor: "pointer",
                  }}>{s}</button>
                ))}
              </div>
            </div>
          )}
          {satisfaction && (
            <div style={{ textAlign: "center", fontSize: 12, color: "#22c55e", marginBottom: 16 }}>
              ✓ Thanks for your feedback: {satisfaction}
            </div>
          )}

          {/* Escalation banner */}
          {escalated && (
            <div style={{
              background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 12,
              color: "#fca5a5",
            }}>
              🔔 This conversation has been flagged for human agent review. Avg wait: ~3 min.
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick prompts */}
        <div style={{
          padding: "10px 16px",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          display: "flex", gap: 6, flexWrap: "wrap",
        }}>
          {QUICK_PROMPTS.map((q) => (
            <button key={q.label} onClick={() => sendMessage(q.label)} disabled={loading} style={{
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 16, padding: "4px 10px", fontSize: 11,
              color: "#94a3b8", cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(59,130,246,0.12)"; e.currentTarget.style.color = "#93c5fd"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "#94a3b8"; }}
            >
              {q.icon} {q.label}
            </button>
          ))}
        </div>

        {/* Input */}
        <div style={{
          padding: "12px 16px",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          display: "flex", gap: 10, alignItems: "flex-end",
        }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Type your message… (Enter to send)"
            rows={1}
            style={{
              flex: 1, background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12, padding: "10px 14px",
              color: "#f1f5f9", fontSize: 14, resize: "none",
              lineHeight: 1.5, maxHeight: 100, overflow: "auto",
            }}
          />
          <button onClick={() => sendMessage(input)} disabled={loading || !input.trim()} style={{
            background: loading || !input.trim()
              ? "rgba(59,130,246,0.3)"
              : "linear-gradient(135deg, #1e40af, #3b82f6)",
            border: "none", borderRadius: 12, width: 42, height: 42,
            color: "white", fontSize: 18, cursor: loading || !input.trim() ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, boxShadow: loading || !input.trim() ? "none" : "0 4px 12px #1e40af50",
          }}>
            {loading ? "⏳" : "↑"}
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{
        width: "100%", maxWidth: 680, marginTop: 12,
        display: "flex", gap: 16, justifyContent: "center",
      }}>
        {[
          { label: "Messages", value: messages.length },
          { label: "Intents Detected", value: messages.filter(m => m.intent && m.intent !== "UNKNOWN").length },
          { label: "Escalated", value: escalated ? "Yes" : "No" },
        ].map(s => (
          <div key={s.label} style={{
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 10, padding: "6px 16px", textAlign: "center",
          }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9" }}>{s.value}</div>
            <div style={{ fontSize: 10, color: "#475569" }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
