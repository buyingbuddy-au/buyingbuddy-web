"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { ArrowRight, Search } from "lucide-react";
import { normaliseQldRego } from "@/lib/qld-rego/normalise";

export function HomeRegoStarter() {
  const router = useRouter();
  const [rego, setRego] = useState("");
  const [error, setError] = useState("");
  const normalisedRego = useMemo(() => normaliseQldRego(rego), [rego]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (normalisedRego.length < 3) {
      setError("Pop in the QLD plate first — even the messy version is fine.");
      return;
    }
    setError("");
    router.push(`/rego-check?rego=${encodeURIComponent(normalisedRego)}&start=1`);
  }

  return (
    <form
      onSubmit={submit}
      className="mt-5 rounded-[1.5rem] border border-teal-200 bg-white p-3 shadow-lg shadow-teal-900/5 sm:mt-6 sm:p-4"
    >
      <label htmlFor="home-rego" className="sr-only">
        QLD rego
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-teal-600" />
          <input
            id="home-rego"
            value={rego}
            onChange={(event) => {
              setRego(normaliseQldRego(event.target.value));
              if (error) setError("");
            }}
            placeholder="Enter QLD rego"
            inputMode="text"
            enterKeyHint="go"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            maxLength={7}
            className="min-h-[3.875rem] w-full rounded-2xl border border-gray-200 bg-gray-50 pl-12 pr-4 text-xl font-black uppercase tracking-[0.12em] text-gray-950 outline-none transition placeholder:text-base placeholder:font-bold placeholder:normal-case placeholder:tracking-normal focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-100"
          />
        </div>
        <button
          type="submit"
          className="inline-flex min-h-[3.875rem] items-center justify-center gap-2 rounded-2xl bg-teal-600 px-6 text-base font-black text-white shadow-sm transition hover:bg-teal-700 active:scale-[0.98]"
        >
          Check free
          <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs font-bold text-gray-500">
        <span>QLD plates only</span>
        <span aria-hidden="true">•</span>
        <span>No signup</span>
        <span className="hidden sm:inline" aria-hidden="true">•</span>
        <span className="hidden sm:inline">PPSR is next if it looks worth chasing</span>
      </div>
      {error ? <p className="mt-3 text-sm font-bold text-amber-700">{error}</p> : null}
    </form>
  );
}
