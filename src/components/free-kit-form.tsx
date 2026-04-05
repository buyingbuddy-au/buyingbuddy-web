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
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Something went wrong.");
      }

      setStatus("done");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-2xl bg-teal-50 p-6 text-center">
        <p className="text-2xl font-black text-gray-900">Kit on its way!</p>
        <p className="mt-2 text-sm text-gray-500">
          Check your email for the download link. If it&apos;s not there in a couple of minutes, check spam.
        </p>
        <a
          href="/check"
          className="mt-5 inline-flex min-h-[3rem] items-center justify-center rounded-2xl bg-teal-600 px-6 text-sm font-black text-white transition hover:bg-teal-700"
        >
          Run a free check on your car &rarr;
        </a>
      </div>
    );
  }

  const inputClass = "w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10";
  const labelClass = "block text-sm font-bold text-gray-900 mb-2";

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <label className={labelClass} htmlFor="kit-name">Full name</label>
      <input
        id="kit-name"
        type="text"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Jordan Lansbury"
        className={inputClass}
      />

      <label className={labelClass} htmlFor="kit-email">Email</label>
      <input
        id="kit-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className={inputClass}
      />

      {errorMsg && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{errorMsg}</div>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex min-h-[3rem] w-full items-center justify-center rounded-2xl bg-teal-600 px-6 text-sm font-black text-white transition hover:bg-teal-700 disabled:opacity-60"
      >
        {status === "loading" ? "Sending..." : "Download Free Kit"}
      </button>

      <p className="text-center text-xs text-gray-400">No spam. Unsubscribe anytime.</p>
    </form>
  );
}
