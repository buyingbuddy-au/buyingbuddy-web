"use client";

import { useRef, useState, type FormEvent } from "react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const QUICK_REPLIES = [
  "Is this car overpriced?",
  "What should I look for?",
  "How do I negotiate?",
  "What are the red flags?",
  "QLD transfer rules",
  "Help with paperwork",
] as const;

export default function BuddyChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  function scrollToBottom() {
    requestAnimationFrame(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  }

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setError(null);
    const userMsg: ChatMessage = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    scrollToBottom();

    try {
      const res = await fetch("/api/buddy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(
          data.error ??
            "Buddy couldn't process that. Try rephrasing or use the Free Check tool for listing analysis."
        );
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      }
    } catch {
      setError("Network error — check your connection and try again.");
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    void sendMessage(input);
  }

  const showWelcome = messages.length === 0 && !loading;

  return (
    <section className="section buddy-section" id="buddy">
      <div className="container">
        <p className="eyebrow">Ask Buddy</p>
        <h2 className="section-title">Got a car question? Ask the dealer.</h2>
        <p className="section-subtitle">
          Free AI chat trained on 15+ years of buying, selling, and fixing other people&apos;s mistakes.
        </p>

        {/* Chat window */}
        <div className="buddy-chat-window">
          {showWelcome ? (
            <div className="buddy-welcome">
              <p className="buddy-welcome-icon">🦞</p>
              <p className="buddy-welcome-text">
                Hey! I&apos;m Buddy — ask me anything about buying a used car in QLD.
              </p>
            </div>
          ) : (
            <div className="buddy-messages">
              {messages.map((msg, i) => (
                <div key={i} className={`buddy-message buddy-message--${msg.role}`}>
                  <div className="buddy-message-bubble">{msg.content}</div>
                </div>
              ))}
              {loading && (
                <div className="buddy-message buddy-message--assistant">
                  <div className="buddy-message-buddy-message-bubble buddy-typing">
                    <span /><span /><span />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Error banner */}
        {error && (
          <div className="buddy-error" role="alert">
            {error}
          </div>
        )}

        {/* Quick replies */}
        {showWelcome && (
          <div className="buddy-quick-replies">
            {QUICK_REPLIES.map((label) => (
              <button
                key={label}
                className="buddy-quick-reply"
                type="button"
                onClick={() => void sendMessage(label)}
                disabled={loading}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <form className="buddy-input-row" onSubmit={handleSubmit}>
          <input
            className="buddy-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about buying a used car..."
            disabled={loading}
            autoComplete="off"
          />
          <button
            className="button button-primary buddy-send"
            type="submit"
            disabled={loading || !input.trim()}
          >
            {loading ? "..." : "Send"}
          </button>
        </form>

        {/* Disclaimer */}
        <p className="buddy-disclaimer">
          AI guidance only — not legal or financial advice
        </p>
      </div>
    </section>
  );
}
