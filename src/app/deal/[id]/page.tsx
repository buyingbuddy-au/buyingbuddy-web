"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  Copy,
  FileText,
  Loader2,
  MessageCircle,
  Share2,
  Upload,
} from "lucide-react";
import type { DealPublicRecord } from "@/lib/types";

type DealResponse = { ok: true; deal: DealPublicRecord } | { ok: false; error: string };

/* ── helpers ─────────────────────────────────────────────────────── */

function showToast(msg: string) {
  const el = document.createElement("div");
  el.className = "fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-2xl bg-gray-900 px-5 py-3 text-sm font-bold text-white shadow-lg";
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2200);
}

type NoteEntry = { ts: string; text: string };

function parseNotes(raw: string | null): NoteEntry[] {
  if (!raw) return [];
  try { return JSON.parse(raw) as NoteEntry[]; } catch { return []; }
}

/* ── file upload ─────────────────────────────────────────────────── */

function FileUploadField({
  id, label, uploaded, onChange,
}: {
  id: string; label: string; uploaded: boolean;
  onChange: (base64: string) => void;
}) {
  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { if (typeof reader.result === "string") onChange(reader.result); };
    reader.readAsDataURL(file);
  }

  return (
    <label htmlFor={id} className="grid gap-2">
      <span className="text-sm font-bold text-gray-900">{label}</span>
      {uploaded ? (
        <div className="flex items-center gap-2 rounded-2xl bg-teal-50 px-4 py-3 text-sm font-bold text-teal-700">
          <CheckCircle2 className="h-4 w-4" /> Uploaded
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-4 py-4 text-sm text-gray-500 cursor-pointer hover:border-teal-400 hover:bg-teal-50/30 transition">
          <Upload className="h-4 w-4" /> Choose file
          <input id={id} type="file" accept="image/*,.pdf" className="hidden" onChange={handleFile} />
        </div>
      )}
    </label>
  );
}

/* ── status item ─────────────────────────────────────────────────── */

function StatusItem({ done, label }: { done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {done ? <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-600" /> : <Clock className="h-4 w-4 shrink-0 text-gray-400" />}
      <span className={done ? "font-bold text-gray-900" : "text-gray-500"}>{label}</span>
    </div>
  );
}

/* ── main component ──────────────────────────────────────────────── */

const inputClass = "w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-base sm:text-sm text-gray-900 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10";

export default function DealRoomPage() {
  const params = useParams();
  const dealId = params?.id as string;
  const [deal, setDeal] = useState<DealPublicRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Save indicator
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Buyer fields
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerAddress, setBuyerAddress] = useState("");
  const [buyerLicence, setBuyerLicence] = useState("");

  // Vehicle fields
  const [vehicleMake, setVehicleMake] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleYear, setVehicleYear] = useState("");
  const [vehicleVin, setVehicleVin] = useState("");
  const [vehicleRego, setVehicleRego] = useState("");
  const [vehicleKm, setVehicleKm] = useState("");
  const [vehicleColour, setVehicleColour] = useState("");
  const [vehicleTransmission, setVehicleTransmission] = useState("");

  // Price fields
  const [askingPrice, setAskingPrice] = useState("");
  const [offeredPrice, setOfferedPrice] = useState("");
  const [agreedPrice, setAgreedPrice] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  // Deal terms
  const [conditions, setConditions] = useState("");
  const [handoverDate, setHandoverDate] = useState("");
  const [handoverLocation, setHandoverLocation] = useState("");

  // Notes
  const [notes, setNotes] = useState<NoteEntry[]>([]);
  const [newNote, setNewNote] = useState("");

  // Seller fields
  const [sellerName, setSellerName] = useState("");
  const [sellerEmail, setSellerEmail] = useState("");
  const [sellerPhone, setSellerPhone] = useState("");
  const [sellerAddress, setSellerAddress] = useState("");
  const [sellerLicence, setSellerLicence] = useState("");
  const [sellerRegoPapers, setSellerRegoPapers] = useState("");
  const [sellerSafetyCert, setSellerSafetyCert] = useState("");
  const [sellerBsb, setSellerBsb] = useState("");
  const [sellerAccount, setSellerAccount] = useState("");
  const [sellerPayid, setSellerPayid] = useState("");
  const [sellerConfirmPrice, setSellerConfirmPrice] = useState(false);
  const [sellerConfirmConditions, setSellerConfirmConditions] = useState(false);

  /* ── fetch deal ─────────────────────────────────────────────── */

  const fetchDeal = useCallback(async () => {
    try {
      const res = await fetch(`/api/deal/${dealId}`);
      const data = (await res.json()) as DealResponse;
      if (data.ok) {
        const d = data.deal;
        setDeal(d);
        setBuyerName(d.buyer_name ?? "");
        setBuyerEmail(d.buyer_email ?? "");
        setBuyerPhone(d.buyer_phone ?? "");
        setBuyerAddress(d.buyer_address ?? "");
        setVehicleMake(d.vehicle_make ?? "");
        setVehicleModel(d.vehicle_model ?? "");
        setVehicleYear(d.vehicle_year ?? "");
        setVehicleVin(d.vehicle_vin ?? "");
        setVehicleRego(d.vehicle_rego ?? "");
        setVehicleKm(d.vehicle_km ?? "");
        setVehicleColour(d.vehicle_colour ?? "");
        setVehicleTransmission(d.vehicle_transmission ?? "");
        setAskingPrice(d.asking_price ?? "");
        setOfferedPrice(d.offered_price ?? "");
        setAgreedPrice(d.agreed_price ?? "");
        setDepositAmount(d.deposit_amount ?? "");
        setPaymentMethod(d.payment_method ?? "");
        setConditions(d.conditions ?? "");
        setHandoverDate(d.handover_date ?? "");
        setHandoverLocation(d.handover_location ?? "");
        setNotes(parseNotes(d.notes));
        setSellerName(d.seller_name ?? "");
        setSellerEmail(d.seller_email ?? "");
        setSellerPhone(d.seller_phone ?? "");
        setSellerAddress(d.seller_address ?? "");
        setSellerBsb(d.seller_bank_bsb ?? "");
        setSellerPayid(d.seller_payid ?? "");
        setSellerConfirmPrice(Boolean(d.seller_confirmed_price));
        setSellerConfirmConditions(Boolean(d.seller_confirmed_conditions));
      }
    } catch {
      setError("Could not load deal.");
    } finally {
      setLoading(false);
    }
  }, [dealId]);

  useEffect(() => { void fetchDeal(); }, [fetchDeal]);

  /* ── auto-save (500ms debounce) ─────────────────────────────── */

  const saveBuyer = useCallback(async () => {
    setSaveState("saving");
    try {
      const res = await fetch(`/api/deal/${dealId}/buyer`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyer_name: buyerName, buyer_email: buyerEmail, buyer_phone: buyerPhone,
          buyer_address: buyerAddress,
          buyer_licence: buyerLicence || undefined,
          vehicle_make: vehicleMake, vehicle_model: vehicleModel, vehicle_year: vehicleYear,
          vehicle_vin: vehicleVin, vehicle_rego: vehicleRego,
          vehicle_km: vehicleKm, vehicle_colour: vehicleColour, vehicle_transmission: vehicleTransmission,
          asking_price: askingPrice, offered_price: offeredPrice,
          agreed_price: agreedPrice, deposit_amount: depositAmount,
          payment_method: paymentMethod,
          conditions, handover_date: handoverDate, handover_location: handoverLocation,
          notes: JSON.stringify(notes),
        }),
      });
      const data = (await res.json()) as DealResponse;
      if (data.ok) {
        setDeal(data.deal);
        setSaveState("saved");
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => setSaveState("idle"), 2000);
      }
    } catch {
      setSaveState("idle");
    }
  }, [dealId, buyerName, buyerEmail, buyerPhone, buyerAddress, buyerLicence,
    vehicleMake, vehicleModel, vehicleYear, vehicleVin, vehicleRego,
    vehicleKm, vehicleColour, vehicleTransmission,
    askingPrice, offeredPrice, agreedPrice, depositAmount, paymentMethod,
    conditions, handoverDate, handoverLocation, notes]);

  // Trigger debounced save on buyer field changes (skip initial load)
  const initialLoadDone = useRef(false);
  useEffect(() => {
    if (!initialLoadDone.current) {
      if (deal) initialLoadDone.current = true;
      return;
    }
    if (deal?.status === "finalised") return;

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { void saveBuyer(); }, 500);
    return () => clearTimeout(debounceRef.current);
  }, [saveBuyer, deal]);

  /* ── seller save (manual) ───────────────────────────────────── */

  const [savingSeller, setSavingSeller] = useState(false);

  async function handleSaveSeller() {
    setSavingSeller(true);
    try {
      const res = await fetch(`/api/deal/${dealId}/seller`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seller_name: sellerName, seller_email: sellerEmail, seller_phone: sellerPhone,
          seller_address: sellerAddress,
          seller_licence: sellerLicence || undefined,
          seller_rego_papers: sellerRegoPapers || undefined,
          seller_safety_cert: sellerSafetyCert || undefined,
          seller_bank_bsb: sellerBsb, seller_bank_account: sellerAccount, seller_payid: sellerPayid,
          seller_confirmed_price: sellerConfirmPrice,
          seller_confirmed_conditions: sellerConfirmConditions,
        }),
      });
      const data = (await res.json()) as DealResponse;
      if (data.ok) {
        setDeal(data.deal);
        showToast("Seller details saved");
      }
    } catch { showToast("Save failed"); } finally { setSavingSeller(false); }
  }

  /* ── finalise ───────────────────────────────────────────────── */

  async function finaliseDeal() {
    setSaveState("saving");
    try {
      const res = await fetch(`/api/deal/${dealId}/finalise`, { method: "POST" });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (data.ok) {
        showToast("Deal finalised! PDF sent to both parties.");
        void fetchDeal();
      } else {
        setError(data.error ?? "Could not finalise.");
      }
    } catch { setError("Network error."); } finally { setSaveState("idle"); }
  }

  /* ── notes ──────────────────────────────────────────────────── */

  function addNote() {
    if (!newNote.trim()) return;
    const entry: NoteEntry = { ts: new Date().toISOString(), text: newNote.trim() };
    setNotes((prev) => [entry, ...prev]);
    setNewNote("");
  }

  /* ── share ──────────────────────────────────────────────────── */

  function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      void navigator.share({ title: "BuyingBuddy Deal Room", url });
    } else {
      void navigator.clipboard.writeText(url);
      showToast("Link copied!");
    }
  }

  function copyShareMessage() {
    const url = window.location.href;
    const vehicle = [vehicleYear, vehicleMake, vehicleModel].filter(Boolean).join(" ") || "the car";
    const msg = `Hey! I'm using BuyingBuddy to keep track of our deal for ${vehicle}${vehicleRego ? ` (${vehicleRego})` : ""}. Can you fill in your details here? ${url}`;
    void navigator.clipboard.writeText(msg);
    showToast("Message copied — paste it in Messenger");
  }

  /* ── loading / not found ────────────────────────────────────── */

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="mx-auto max-w-2xl px-4 pt-16 text-center">
        <h1 className="text-3xl font-black text-gray-900">Deal not found</h1>
        <Link href="/deal" className="mt-6 inline-flex rounded-2xl bg-teal-600 px-6 py-3 text-sm font-bold text-white">
          Create a Deal Room
        </Link>
      </div>
    );
  }

  const isFinalised = deal.status === "finalised";
  const bothComplete = deal.status === "both_complete";

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-600">Deal Room</p>
          <p className="mt-1 truncate text-sm text-gray-500" title={deal.id}>
            {vehicleRego ? <span className="font-mono font-bold text-gray-900">{vehicleRego}</span> : null}
            {vehicleRego ? " · " : ""}ID: {deal.id.slice(0, 8)}…
          </p>
        </div>
        <div className="flex items-center gap-2">
          {saveState === "saving" && (
            <span className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving
            </span>
          )}
          {saveState === "saved" && (
            <span className="flex items-center gap-1 text-xs font-bold text-teal-600">
              <CheckCircle2 className="h-3.5 w-3.5" /> Saved
            </span>
          )}
        </div>
      </div>

      {/* Status Board */}
      <section className="mt-4 rounded-[2rem] border border-gray-200 bg-gray-50 p-5 shadow-sm">
        <p className="text-sm font-black uppercase tracking-[0.16em] text-gray-500">Status</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <StatusItem done={Boolean(deal.buyer_completed_at)} label="Buyer details" />
          <StatusItem done={Boolean(deal.seller_completed_at)} label="Seller details" />
          <StatusItem done={Boolean(deal.agreed_price)} label={`Price: ${deal.agreed_price ? `$${deal.agreed_price}` : "pending"}`} />
          <StatusItem done={Boolean(deal.seller_confirmed_price)} label="Seller confirmed price" />
          <StatusItem done={deal.seller_safety_cert_uploaded} label="Safety certificate" />
          <StatusItem done={isFinalised} label={isFinalised ? "Deal finalised" : "Deal summary pending"} />
        </div>
      </section>

      {/* Share with seller */}
      {!isFinalised && (
        <section className="mt-4 rounded-[2rem] border border-teal-200 bg-teal-50 p-5 shadow-sm">
          <p className="text-sm font-black text-gray-900">Share with seller</p>
          <p className="mt-1 text-xs text-gray-500">Send the seller this link so they can fill in their side.</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <button
              onClick={copyShareMessage}
              className="inline-flex min-h-[2.75rem] flex-1 items-center justify-center gap-2 rounded-2xl bg-teal-600 px-4 text-sm font-bold text-white transition hover:bg-teal-700 active:scale-[0.98]"
            >
              <MessageCircle className="h-4 w-4" /> Copy FB Messenger message
            </button>
            <button
              onClick={handleShare}
              className="inline-flex min-h-[2.75rem] items-center justify-center gap-2 rounded-2xl border border-teal-300 bg-white px-4 text-sm font-bold text-teal-700 transition hover:bg-teal-50 active:scale-[0.98]"
            >
              <Share2 className="h-4 w-4" /> Share link
            </button>
          </div>
        </section>
      )}

      {error && <div className="sticky top-14 z-20 mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 shadow-sm">{error}</div>}

      {isFinalised && (
        <div className="mt-4 rounded-[2rem] bg-teal-600 p-6 text-center text-white">
          <FileText className="mx-auto h-8 w-8" />
          <p className="mt-3 text-xl font-black">Deal Record Finalised</p>
          <p className="mt-2 text-sm text-teal-100">The Deal Summary PDF has been emailed to both parties.</p>
          <Link
            href="/"
            className="mt-5 inline-flex min-h-[3rem] items-center justify-center rounded-2xl border border-white/30 bg-white/10 px-6 text-sm font-bold text-white transition hover:bg-white/20"
          >
            Back to home
          </Link>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* ─── BUYER SECTION ─────────────────────────────────── */}
        <section className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-600">Buyer</p>

          <div className="mt-4 grid gap-4">
            <label className="grid gap-1"><span className="text-sm font-bold text-gray-900">Name</span>
              <input value={buyerName} onChange={e => setBuyerName(e.target.value)} disabled={isFinalised} className={inputClass} placeholder="Your full name" /></label>
            <label className="grid gap-1"><span className="text-sm font-bold text-gray-900">Email</span>
              <input type="email" value={buyerEmail} onChange={e => setBuyerEmail(e.target.value)} disabled={isFinalised} className={inputClass} placeholder="you@example.com" /></label>
            <label className="grid gap-1"><span className="text-sm font-bold text-gray-900">Phone</span>
              <input type="tel" value={buyerPhone} onChange={e => setBuyerPhone(e.target.value)} disabled={isFinalised} className={inputClass} placeholder="04xx xxx xxx" /></label>
            <label className="grid gap-1"><span className="text-sm font-bold text-gray-900">Address</span>
              <input value={buyerAddress} onChange={e => setBuyerAddress(e.target.value)} disabled={isFinalised} className={inputClass} placeholder="123 Main St, Ipswich QLD 4305" /></label>
            <FileUploadField id="buyer-licence" label="Driver's licence photo" uploaded={deal.buyer_licence_uploaded || Boolean(buyerLicence)} onChange={setBuyerLicence} />

            {/* Vehicle */}
            <p className="mt-2 text-xs font-black uppercase tracking-[0.16em] text-gray-500">Vehicle</p>
            <div className="grid grid-cols-3 gap-3">
              <input value={vehicleYear} onChange={e => setVehicleYear(e.target.value)} disabled={isFinalised} className={inputClass} placeholder="Year" />
              <input value={vehicleMake} onChange={e => setVehicleMake(e.target.value)} disabled={isFinalised} className={inputClass} placeholder="Make" />
              <input value={vehicleModel} onChange={e => setVehicleModel(e.target.value)} disabled={isFinalised} className={inputClass} placeholder="Model" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input value={vehicleVin} onChange={e => setVehicleVin(e.target.value.toUpperCase())} disabled={isFinalised} className={inputClass} placeholder="VIN" />
              <input value={vehicleRego} onChange={e => setVehicleRego(e.target.value.toUpperCase())} disabled={isFinalised} className={inputClass} placeholder="Rego" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <input value={vehicleKm} onChange={e => setVehicleKm(e.target.value)} disabled={isFinalised} className={inputClass} placeholder="Kilometres" />
              <input value={vehicleColour} onChange={e => setVehicleColour(e.target.value)} disabled={isFinalised} className={inputClass} placeholder="Colour" />
              <select value={vehicleTransmission} onChange={e => setVehicleTransmission(e.target.value)} disabled={isFinalised} className={inputClass}>
                <option value="">Trans...</option>
                <option value="Automatic">Auto</option>
                <option value="Manual">Manual</option>
              </select>
            </div>

            {/* Price breakdown */}
            <p className="mt-2 text-xs font-black uppercase tracking-[0.16em] text-gray-500">Price</p>
            <div className="grid grid-cols-2 gap-3">
              <input value={askingPrice} onChange={e => setAskingPrice(e.target.value)} disabled={isFinalised} className={inputClass} placeholder="Asking price ($)" />
              <input value={offeredPrice} onChange={e => setOfferedPrice(e.target.value)} disabled={isFinalised} className={inputClass} placeholder="Your offer ($)" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input value={agreedPrice} onChange={e => setAgreedPrice(e.target.value)} disabled={isFinalised} className={inputClass} placeholder="Agreed price ($)" />
              <input value={depositAmount} onChange={e => setDepositAmount(e.target.value)} disabled={isFinalised} className={inputClass} placeholder="Deposit ($)" />
            </div>

            {/* Deal terms */}
            <p className="mt-2 text-xs font-black uppercase tracking-[0.16em] text-gray-500">Deal terms</p>
            <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} disabled={isFinalised} className={inputClass}>
              <option value="">Payment method...</option>
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank transfer</option>
              <option value="payid">PayID</option>
            </select>
            <textarea value={conditions} onChange={e => setConditions(e.target.value)} disabled={isFinalised} className={inputClass} placeholder="Conditions (e.g. 'seller to fix left tail light')" rows={3} />
            <div className="grid grid-cols-2 gap-3">
              <input type="date" value={handoverDate} onChange={e => setHandoverDate(e.target.value)} disabled={isFinalised} className={inputClass} />
              <input value={handoverLocation} onChange={e => setHandoverLocation(e.target.value)} disabled={isFinalised} className={inputClass} placeholder="Handover location" />
            </div>
          </div>
        </section>

        {/* ─── SELLER SECTION ────────────────────────────────── */}
        <section className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-600">Seller</p>

          <div className="mt-4 grid gap-4">
            <label className="grid gap-1"><span className="text-sm font-bold text-gray-900">Name</span>
              <input value={sellerName} onChange={e => setSellerName(e.target.value)} disabled={isFinalised} className={inputClass} placeholder="Seller's full name" /></label>
            <label className="grid gap-1"><span className="text-sm font-bold text-gray-900">Email</span>
              <input type="email" value={sellerEmail} onChange={e => setSellerEmail(e.target.value)} disabled={isFinalised} className={inputClass} placeholder="seller@example.com" /></label>
            <label className="grid gap-1"><span className="text-sm font-bold text-gray-900">Phone</span>
              <input type="tel" value={sellerPhone} onChange={e => setSellerPhone(e.target.value)} disabled={isFinalised} className={inputClass} placeholder="04xx xxx xxx" /></label>
            <label className="grid gap-1"><span className="text-sm font-bold text-gray-900">Address</span>
              <input value={sellerAddress} onChange={e => setSellerAddress(e.target.value)} disabled={isFinalised} className={inputClass} placeholder="456 Oak Ave, Brisbane QLD 4000" /></label>

            <FileUploadField id="seller-licence" label="Driver's licence photo" uploaded={deal.seller_licence_uploaded || Boolean(sellerLicence)} onChange={setSellerLicence} />
            <FileUploadField id="seller-rego" label="Rego papers" uploaded={deal.seller_rego_papers_uploaded || Boolean(sellerRegoPapers)} onChange={setSellerRegoPapers} />
            <FileUploadField id="seller-safety" label="Safety certificate (RWC)" uploaded={deal.seller_safety_cert_uploaded || Boolean(sellerSafetyCert)} onChange={setSellerSafetyCert} />
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="text-xs font-black text-amber-800">QLD Safety Certificate</p>
              <p className="mt-1 text-xs leading-relaxed text-amber-700">
                In Queensland, a seller must provide a valid safety certificate (roadworthy) for vehicles under 15 years old when selling privately. It&apos;s valid for 2 months or 2,000km — whichever comes first.
              </p>
            </div>

            <p className="mt-2 text-xs font-black uppercase tracking-[0.16em] text-gray-500">Payment details</p>
            <div className="grid grid-cols-2 gap-3">
              <input value={sellerBsb} onChange={e => setSellerBsb(e.target.value)} disabled={isFinalised} className={inputClass} placeholder="BSB" />
              <input value={sellerAccount} onChange={e => setSellerAccount(e.target.value)} disabled={isFinalised} className={inputClass} placeholder="Account number" />
            </div>
            <input value={sellerPayid} onChange={e => setSellerPayid(e.target.value)} disabled={isFinalised} className={inputClass} placeholder="PayID (optional)" />

            <p className="mt-2 text-xs font-black uppercase tracking-[0.16em] text-gray-500">Confirmations</p>
            <label className="flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-3 cursor-pointer">
              <input type="checkbox" checked={sellerConfirmPrice} onChange={e => setSellerConfirmPrice(e.target.checked)} disabled={isFinalised} className="h-5 w-5 rounded border-gray-300 text-teal-600" />
              <span className="text-sm font-bold text-gray-900">I confirm the agreed price is correct</span>
            </label>
            <label className="flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-3 cursor-pointer">
              <input type="checkbox" checked={sellerConfirmConditions} onChange={e => setSellerConfirmConditions(e.target.checked)} disabled={isFinalised} className="h-5 w-5 rounded border-gray-300 text-teal-600" />
              <span className="text-sm font-bold text-gray-900">I confirm the conditions are correct</span>
            </label>

            {!isFinalised && (
              <button onClick={() => void handleSaveSeller()} disabled={savingSeller} className="mt-2 inline-flex min-h-[3rem] w-full items-center justify-center rounded-2xl bg-teal-600 text-sm font-bold text-white hover:bg-teal-700 active:scale-[0.98] disabled:opacity-60">
                {savingSeller ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Save Seller Details"}
              </button>
            )}
          </div>
        </section>
      </div>

      {/* ─── NOTES LOG ───────────────────────────────────────── */}
      {!isFinalised && (
        <section className="mt-6 rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Notes</p>
          <div className="mt-3 flex gap-2">
            <input
              value={newNote}
              onChange={e => setNewNote(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addNote(); } }}
              className={inputClass}
              placeholder="Add a note (press Enter)"
            />
            <button onClick={addNote} className="shrink-0 rounded-2xl bg-teal-600 px-4 text-sm font-bold text-white hover:bg-teal-700 active:scale-[0.98]">
              Add
            </button>
          </div>
          {notes.length > 0 && (
            <div className="mt-3 grid gap-2">
              {notes.map((n, i) => (
                <div key={i} className="rounded-2xl bg-gray-50 px-4 py-3">
                  <p className="text-xs text-gray-400">{new Date(n.ts).toLocaleString("en-AU", { dateStyle: "medium", timeStyle: "short" })}</p>
                  <p className="mt-1 text-sm text-gray-900">{n.text}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ─── ACTIONS ─────────────────────────────────────────── */}
      {!isFinalised && (
        <section className="mt-6 grid gap-3 sm:grid-cols-2">
          <a
            href={`/api/deal/${dealId}/pdf`}
            download
            className="inline-flex min-h-[3rem] items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-4 text-sm font-bold text-gray-700 transition hover:bg-gray-100 active:scale-[0.98]"
          >
            <FileText className="h-4 w-4" /> Download Deal PDF
          </a>
          <button
            onClick={() => showToast("SMS notifications coming soon")}
            className="inline-flex min-h-[3rem] items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-4 text-sm font-bold text-gray-700 transition hover:bg-gray-100 active:scale-[0.98]"
          >
            <Copy className="h-4 w-4" /> SMS updates
          </button>
        </section>
      )}

      {/* Finalise */}
      {bothComplete && !isFinalised && (
        <section className="mt-6 rounded-[2rem] border-2 border-teal-300 bg-teal-50 p-6 text-center shadow-sm">
          <p className="text-xl font-black text-gray-900">Both sides are complete</p>
          <p className="mt-2 text-sm text-gray-500">Finalise the deal to generate the Deal Summary PDF and email it to both parties.</p>
          <button onClick={() => void finaliseDeal()} disabled={saveState === "saving"} className="mt-4 inline-flex min-h-[3.5rem] items-center justify-center rounded-2xl bg-teal-600 px-8 text-base font-black text-white hover:bg-teal-700 active:scale-[0.98] disabled:opacity-60">
            {saveState === "saving" ? "Finalising..." : "Finalise Deal & Send PDF"}
          </button>
        </section>
      )}

      <p className="mt-6 text-center text-xs text-gray-400">
        This Deal Record is a voluntary summary of transaction details. Not a legal contract. Not legal advice.
      </p>
    </div>
  );
}
