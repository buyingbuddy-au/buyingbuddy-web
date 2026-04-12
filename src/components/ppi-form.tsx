"use client";

import { useState } from "react";

type FormState = {
  name: string;
  phone: string;
  email: string;
  carYear: string;
  carMake: string;
  carModel: string;
  location: string;
  preferredDate: string;
  notes: string;
};

const empty: FormState = {
  name: "", phone: "", email: "", carYear: "", carMake: "", carModel: "",
  location: "", preferredDate: "", notes: "",
};

export function PpiForm() {
  const [values, setValues] = useState<FormState>(empty);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function set(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setValues((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/ppi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
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
        <p className="mt-3 font-black text-gray-900">Enquiry received!</p>
        <p className="mt-2 text-sm text-gray-500">
          We&apos;ll be in touch within a few hours to confirm your inspection. Check your email.
        </p>
      </div>
    );
  }

  const inputClass = "w-full rounded-xl border border-gray-900/20 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600/60";
  const labelClass = "block text-sm font-bold text-gray-900 mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass} htmlFor="ppi-name">Your name</label>
          <input id="ppi-name" type="text" required value={values.name} onChange={set("name")} placeholder="Jordan" className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="ppi-phone">Phone</label>
          <input id="ppi-phone" type="tel" required value={values.phone} onChange={set("phone")} placeholder="04xx xxx xxx" className={inputClass} />
        </div>
      </div>
      <div>
        <label className={labelClass} htmlFor="ppi-email">Email</label>
        <input id="ppi-email" type="email" required value={values.email} onChange={set("email")} placeholder="you@example.com" className={inputClass} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={labelClass} htmlFor="ppi-year">Year</label>
          <input id="ppi-year" type="text" required value={values.carYear} onChange={set("carYear")} placeholder="2019" className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="ppi-make">Make</label>
          <input id="ppi-make" type="text" required value={values.carMake} onChange={set("carMake")} placeholder="Toyota" className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="ppi-model">Model</label>
          <input id="ppi-model" type="text" required value={values.carModel} onChange={set("carModel")} placeholder="Corolla" className={inputClass} />
        </div>
      </div>
      <div>
        <label className={labelClass} htmlFor="ppi-location">Car&apos;s location (suburb)</label>
        <input id="ppi-location" type="text" required value={values.location} onChange={set("location")} placeholder="Ipswich QLD" className={inputClass} />
      </div>
      <div>
        <label className={labelClass} htmlFor="ppi-date">Preferred inspection date</label>
        <input id="ppi-date" type="date" value={values.preferredDate} onChange={set("preferredDate")} className={inputClass} />
      </div>
      <div>
        <label className={labelClass} htmlFor="ppi-notes">Anything else we should know?</label>
        <textarea id="ppi-notes" rows={3} value={values.notes} onChange={set("notes")} placeholder="Facebook listing link, asking price, any concerns..." className={inputClass} />
      </div>

      {status === "error" && <p className="text-sm text-red-600">{errorMsg}</p>}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full min-h-12 rounded-full bg-teal-600 px-6 py-3 text-sm font-black uppercase tracking-[0.08em] text-white transition hover:bg-teal-700 active:scale-[0.98] disabled:opacity-60"
      >
        {status === "loading" ? "Sending…" : "Request inspection quote"}
      </button>
      <p className="text-xs text-gray-400 text-center">No obligation. We&apos;ll confirm cost before booking.</p>
    </form>
  );
}
