"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Loader2, MessageCircle, SendHorizontal } from "lucide-react";

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
  "Do I need a PPSR check?",
] as const;

/** Follow-up suggestions shown after assistant replies to keep the conversation moving */
const FOLLOW_UP_MAP: Record<string, string[]> = {
  "Is this car overpriced?": ["What are the red flags?", "How do I negotiate?"],
  "What should I look for?": ["What are the red flags?", "Do I need a PPSR check?"],
  "How do I negotiate?": ["Is this car overpriced?", "QLD transfer rules"],
  "What are the red flags?": ["What should I look for?", "Do I need a PPSR check?"],
  "QLD transfer rules": ["Do I need a PPSR check?", "How do I negotiate?"],
  "Do I need a PPSR check?": ["What are the red flags?", "QLD transfer rules"],
};

const DEFAULT_FOLLOW_UPS = ["What should I look for?", "Do I need a PPSR check?", "How do I negotiate?"];

export default function BuddyChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastUserMessage, setLastUserMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  async function sendMessage(nextMessage: string) {
    const trimmed = nextMessage.trim();

    if (!trimmed || loading) {
      return;
    }

    setError("");
    setMessages((current) => [...current, { role: "user", content: trimmed }]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/buddy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: messages.slice(-8),
        }),
      });

      const data = (await response.json()) as {
        ok?: boolean;
        reply?: string;
        error?: string;
      };

      if (!response.ok || !data.ok || !data.reply) {
        setError(
          data.error ??
            "Buddy couldn't process that. Try rephrasing or run a free check.",
        );
        return;
      }

      setMessages((current) => [
        ...current,
        { role: "assistant", content: data.reply as string },
      ]);
      setLastUserMessage(trimmed);
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  const showWelcome = messages.length === 0 && !loading;

  return (
    <section className="mx-auto flex min-h-[calc(100svh-8rem)] w-full max-w-6xl flex-col px-4 pb-6 pt-4 sm:px-6 lg:min-h-[calc(100svh-6rem)] lg:px-8 lg:pt-8">
      <div className="rounded-[2rem] border border-gray-200 bg-gray-50 p-5 shadow-sm sm:p-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-teal-700">
          <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
          Buddy Chat
        </div>
        <h1 className="mt-4 text-3xl font-black tracking-[-0.05em] text-gray-900 sm:text-5xl">
          Ask anything about buying a used car in QLD.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
          Free AI chat trained on 15+ years of buying, selling, and fixing
          other people&apos;s mistakes.
        </p>
      </div>

      <div className="mt-5 flex flex-1 flex-col rounded-[2rem] border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex min-h-[380px] flex-1 flex-col overflow-y-auto rounded-[1.5rem] bg-gray-50 p-4 sm:p-6">
          {showWelcome ? (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <div className="inline-flex rounded-full bg-teal-50 p-4 text-teal-600">
                <MessageCircle className="h-8 w-8" aria-hidden="true" />
              </div>
              <p className="mt-4 max-w-sm text-sm leading-6 text-gray-500">
                I&apos;m Buddy. Ask me what to check, how to negotiate, or what
                QLD paperwork you need.
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-[1.5rem] px-4 py-3 text-sm leading-6 sm:max-w-[75%] ${
                      message.role === "user"
                        ? "rounded-br-md bg-teal-600 text-white"
                        : "rounded-bl-md border border-gray-200 bg-white text-gray-900"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}

              {loading ? (
                <div className="flex justify-start">
                  <div className="inline-flex items-center gap-2 rounded-[1.5rem] rounded-bl-md border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-500">
                    <Loader2
                      className="h-4 w-4 animate-spin text-teal-600"
                      aria-hidden="true"
                    />
                    Thinking...
                  </div>
                </div>
              ) : null}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {error ? (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </div>
        ) : null}

        {showWelcome ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {QUICK_REPLIES.map((reply) => (
              <button
                key={reply}
                type="button"
                onClick={() => void sendMessage(reply)}
                disabled={loading}
                className="rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-bold text-teal-700 transition hover:bg-teal-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {reply}
              </button>
            ))}
          </div>
        ) : !loading && messages.length > 0 && messages[messages.length - 1].role === "assistant" ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {(FOLLOW_UP_MAP[lastUserMessage] ?? DEFAULT_FOLLOW_UPS).map((reply) => (
              <button
                key={reply}
                type="button"
                onClick={() => void sendMessage(reply)}
                disabled={loading}
                className="rounded-full border border-gray-200 bg-gray-50 px-3.5 py-2 text-sm font-semibold text-gray-700 transition hover:bg-teal-50 hover:border-teal-200 hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {reply}
              </button>
            ))}
          </div>
        ) : null}

        <form
          onSubmit={handleSubmit}
          className="mt-4 flex items-end gap-3"
        >
          <label className="sr-only" htmlFor="buddy-chat-input">
            Ask Buddy
          </label>
          <input
            id="buddy-chat-input"
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            disabled={loading}
            autoComplete="off"
            placeholder="Ask a question about buying a used car..."
            className="min-h-[3.5rem] flex-1 rounded-2xl border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10 disabled:bg-gray-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="inline-flex min-h-[3.5rem] items-center justify-center rounded-2xl bg-teal-600 px-5 text-sm font-black text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Send message"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            ) : (
              <SendHorizontal className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </form>

        <p className="mt-3 text-center text-xs text-gray-500">
          AI guidance only. Not legal or financial advice.
        </p>
      </div>
    </section>
  );
}
