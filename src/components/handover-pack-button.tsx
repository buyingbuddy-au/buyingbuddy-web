"use client";

import { useState } from "react";

export function HandoverPackButton() {
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/docs/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Download failed. Please try again.");
      }

      // Trigger browser download
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "BuyingBuddy_QLD_Handover_Pack.zip";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setStatus("done");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Try again.");
      setStatus("error");
    }
  }

  function openModal() {
    setShowModal(true);
    setStatus("idle");
    setErrorMsg("");
  }

  function closeModal() {
    if (status === "loading") return;
    setShowModal(false);
  }

  return (
    <>
      <button
        className="button button-primary contract-buy-button"
        type="button"
        onClick={openModal}
      >
        Download Full Pack — Free
      </button>

      {showModal && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,0.55)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#FFFFFF", borderRadius: "16px", padding: "32px",
              width: "100%", maxWidth: "420px",
              boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
            }}
          >
            {status === "done" ? (
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "40px", marginBottom: "12px" }}>✅</p>
                <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#1F2937", marginBottom: "8px" }}>
                  Download started!
                </h2>
                <p style={{ fontSize: "14px", color: "#6B7280", marginBottom: "24px" }}>
                  Your QLD Handover Pack (ZIP) should be downloading now. Check your Downloads folder.
                </p>
                <button
                  onClick={closeModal}
                  style={{
                    background: "#0D9488", color: "#FFF", border: "none",
                    borderRadius: "8px", padding: "12px 28px",
                    fontSize: "15px", fontWeight: "700", cursor: "pointer",
                  }}
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <h2 id="modal-title" style={{ fontSize: "20px", fontWeight: "800", color: "#1F2937", marginBottom: "8px" }}>
                  Get your free QLD Handover Pack
                </h2>
                <p style={{ fontSize: "14px", color: "#6B7280", marginBottom: "20px" }}>
                  Enter your email and we'll send you the pack — 4 professional PDF documents, ready to print and use.
                </p>

                <form onSubmit={handleSubmit}>
                  <label
                    htmlFor="handover-email"
                    style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#374151", marginBottom: "6px" }}
                  >
                    Email address
                  </label>
                  <input
                    id="handover-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    disabled={status === "loading"}
                    style={{
                      width: "100%", padding: "12px 14px",
                      border: "1px solid #D1D5DB", borderRadius: "8px",
                      fontSize: "15px", marginBottom: "16px",
                      boxSizing: "border-box",
                      outline: "none",
                    }}
                  />

                  {status === "error" && (
                    <p style={{ color: "#DC2626", fontSize: "13px", marginBottom: "12px" }}>
                      {errorMsg}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === "loading" || !email.trim()}
                    style={{
                      width: "100%", background: status === "loading" ? "#6B7280" : "#0D9488",
                      color: "#FFF", border: "none", borderRadius: "8px",
                      padding: "14px", fontSize: "15px", fontWeight: "700",
                      cursor: status === "loading" ? "not-allowed" : "pointer",
                      marginBottom: "12px",
                    }}
                  >
                    {status === "loading" ? "Generating PDFs…" : "Download Pack — Free"}
                  </button>

                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={status === "loading"}
                    style={{
                      width: "100%", background: "transparent",
                      color: "#6B7280", border: "1px solid #E5E7EB",
                      borderRadius: "8px", padding: "12px",
                      fontSize: "14px", cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </form>

                <p style={{ fontSize: "11px", color: "#9CA3AF", textAlign: "center", marginTop: "12px" }}>
                  No spam. We'll only use your email for relevant updates from Buying Buddy.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
