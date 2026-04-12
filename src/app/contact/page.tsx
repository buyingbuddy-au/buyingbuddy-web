"use client";

import { useState } from "react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const subject = encodeURIComponent(`BuyingBuddy enquiry from ${name || "website visitor"}`);
    const body = encodeURIComponent(
      [
        `Name: ${name || "Not supplied"}`,
        `Email: ${email || "Not supplied"}`,
        "",
        message || "",
      ].join("\n"),
    );

    window.location.href = `mailto:info@buyingbuddy.com.au?subject=${subject}&body=${body}`;
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-12 pt-6 sm:px-6 lg:px-8 lg:pt-12">
      <section className="rounded-[2rem] border border-gray-200 bg-gray-50 p-6 shadow-sm sm:p-10">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-600">Contact</p>
        <h1 className="mt-3 text-3xl font-black tracking-[-0.06em] text-gray-900 sm:text-5xl">
          Got a question? Send it through.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-gray-500">
          Keep it simple. If you need help with a check, a contract pack, or a buy decision, drop a note and I&apos;ll get back to you.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-4 rounded-[1.75rem] border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <label className="grid gap-2">
            <span className="text-sm font-bold text-gray-900">Name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="rounded-2xl border border-gray-300 bg-white px-4 py-4 text-sm text-gray-900 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
              placeholder="Jordan"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-bold text-gray-900">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="rounded-2xl border border-gray-300 bg-white px-4 py-4 text-sm text-gray-900 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
              placeholder="you@example.com"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-bold text-gray-900">Message</span>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={6}
              className="rounded-2xl border border-gray-300 bg-white px-4 py-4 text-sm text-gray-900 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10"
              placeholder="Tell me what you need help with."
            />
          </label>

          <button
            type="submit"
            className="inline-flex min-h-[3.25rem] items-center justify-center rounded-2xl bg-teal-600 px-6 text-sm font-black text-white transition hover:bg-teal-700"
          >
            Open email draft
          </button>
        </form>

        <div className="mt-6 grid gap-3 rounded-[1.5rem] border border-teal-200 bg-teal-50 p-5 text-sm text-teal-900 sm:grid-cols-2">
          <p>
            Email: <a className="font-bold underline decoration-teal-300 underline-offset-4" href="mailto:info@buyingbuddy.com.au">info@buyingbuddy.com.au</a>
          </p>
          <p>No account needed. Just send what you need and keep moving.</p>
        </div>
      </section>
    </div>
  );
}
