"use client";

import { useState } from "react";

export function PPSRProcessForm({
  order_id,
  customer_email,
}: {
  order_id: string;
  customer_email: string;
}) {
  const [raw_text, set_raw_text] = useState("");
  const [certificate_pdf, set_certificate_pdf] = useState<{
    base64: string;
    filename: string;
  } | null>(null);
  const [loading, set_loading] = useState(false);
  const [result, set_result] = useState<{ verdict: string; summary: string } | null>(null);
  const [error, set_error] = useState<string | null>(null);

  async function handle_certificate_change(file: File | null) {
    set_error(null);
    set_certificate_pdf(null);

    if (!file) {
      return;
    }

    if (file.type && file.type !== "application/pdf") {
      set_error("Official PPSR certificate must be a PDF.");
      return;
    }

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error("Could not read the selected certificate."));
        reader.onload = () => resolve(String(reader.result ?? ""));
        reader.readAsDataURL(file);
      });

      set_certificate_pdf({ base64, filename: file.name });
    } catch {
      set_error("Could not read the selected certificate PDF.");
    }
  }

  async function handle_submit(e: React.FormEvent) {
    e.preventDefault();
    if (!raw_text.trim()) return;

    set_loading(true);
    set_error(null);
    set_result(null);

    try {
      const res = await fetch("/api/ppsr/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawPPSRText: raw_text,
          customerEmail: customer_email,
          orderId: order_id,
          certificatePdfBase64: certificate_pdf?.base64,
          certificateFilename: certificate_pdf?.filename,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.ok) {
        set_error(json.error ?? "Failed to process PPSR report.");
        return;
      }

      set_result({ verdict: json.data.verdict, summary: json.data.summary });
    } catch {
      set_error("Network error — could not reach the server.");
    } finally {
      set_loading(false);
    }
  }

  return (
    <form className="admin-form" onSubmit={handle_submit}>
      <label className="admin-field">
        <span>Paste raw PPSR certificate text</span>
        <textarea
          className="hero-input admin-textarea admin-code-textarea"
          disabled={loading}
          onChange={(e) => set_raw_text(e.target.value)}
          placeholder="Paste the full text from the PPSR certificate here..."
          rows={10}
          value={raw_text}
        />
      </label>

      <label className="admin-field">
        <span>Attach official PPSR certificate PDF</span>
        <input
          accept="application/pdf"
          className="hero-input"
          disabled={loading}
          onChange={(e) => void handle_certificate_change(e.target.files?.[0] ?? null)}
          type="file"
        />
        <small>
          Optional but preferred — the official certificate is forwarded to info@buyingbuddy.com.au with the internal guide handoff.
        </small>
      </label>

      <button
        className="button button-primary"
        disabled={loading || !raw_text.trim()}
        type="submit"
      >
        {loading ? "Generating…" : "Generate Report"}
      </button>

      {result && (
        <p className="admin-inline-alert">
          Done — verdict: <strong>{result.verdict}</strong>. {result.summary} Internal PPSR pack sent to info@buyingbuddy.com.au for customer guide review.
        </p>
      )}

      {error && (
        <p className="admin-inline-alert" style={{ background: "#FEF2F2", color: "#DC2626", borderColor: "#DC2626" }}>
          Error: {error}
        </p>
      )}
    </form>
  );
}
