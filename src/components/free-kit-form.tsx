"use client";

import { useState } from "react";

export function FreeKitForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/free-kit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Something went wrong");
      }

      setStatus("done");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Try again.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="mt-6 rounded-xl bg-green-50 border border-green-200 p-6 text-center">
        <p className="text-2xl">✅</p>
        <p className="mt-3 font-black text-brand-navy">Kit on its way!</p>
        <p className="mt-2 text-sm text-brand-ink/70">
          Check your inbox — the download link is in your email. Check spam if you don&apos;t see it.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div>
        <label className="block text-sm font-bold text-brand-navy mb-1.5" htmlFor="kit-name">
          First name
        </label>
        <input
          id="kit-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jordan"
          className="w-full rounded-xl border border-brand-navy/20 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-lime/60"
        />
      </div>
      <div>
        <label className="block text-sm font-bold text-brand-navy mb-1.5" htmlFor="kit-email">
          Email address
        </label>
        <input
          id="kit-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-xl border border-brand-navy/20 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-lime/60"
        />
      </div>

      {status === "error" && (
        <p className="text-sm text-red-600">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full min-h-12 rounded-full bg-brand-navy px-6 py-3 text-sm font-black uppercase tracking-[0.08em] text-white transition hover:-translate-y-0.5 hover:text-brand-lime disabled:opacity-60"
      >
        {status === "loading" ? "Sending…" : "Send me the kit — free"}
      </button>
      <p className="text-xs text-brand-ink/50 text-center">No spam. Unsubscribe anytime.</p>
    </form>
  );
}
