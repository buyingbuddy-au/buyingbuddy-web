"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Share2,
  FileText,
  Upload,
  AlertTriangle,
} from "lucide-react";
import type { DealPublicRecord } from "@/lib/types";

type DealResponse = { ok: true; deal: DealPublicRecord } | { ok: false; error: string };

const DISCLAIMER =
  "This Deal Record is a voluntary summary of transaction details. Not a legal contract. Not legal advice.";

function StatusItem({ done, label }: { done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {done ? (
        <CheckCircle2 className="h-4 w-4 text-teal-600" />
      ) : (
        <Clock className="h-4 w-4 text-gray-400" />
      )}
      <span className={done ? "font-bold text-gray-900" : "text-gray-500"}>{label}</span>
    </div>
  );
}

function FileUploadField({
  id,
  label,
  uploaded,
  onChange,
}: {
  id: string;
  label: string;
  uploaded: boolean;
  onChange: (base64: string) => void;
}) {
  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onChange(reader.result);
      }
    };
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

const inputClass =
  "w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10";

export default function DealRoomPage() {
  const params = useParams();
  const dealId = params?.id as string;
  const [deal, setDeal] = useState<DealPublicRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Buyer form state
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerLicence, setBuyerLicence] = useState("");
  const [vehicleMake, setVehicleMake] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleYear, setVehicleYear] = useState("");
  const [vehicleVin, setVehicleVin] = useState("");
  const [vehicleRego, setVehicleRego] = useState("");
  const [agreedPrice, setAgreedPrice] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [conditions, setConditions] = useState("");
  const [handoverDate, setHandoverDate] = useState("");
  const [handoverLocation, setHandoverLocation] = useState("");

  // Seller form state
  const [sellerName, setSellerName] = useState("");
  const [sellerEmail, setSellerEmail] = useState("");
  const [sellerPhone, setSellerPhone] = useState("");
  const [sellerLicence, setSellerLicence] = useState("");
  const [sellerRegoPapers, setSellerRegoPapers] = useState("");
  const [sellerSafetyCert, setSellerSafetyCert] = useState("");
  const [sellerBsb, setSellerBsb] = useState("");
  const [sellerAccount, setSellerAccount] = useState("");
  const [sellerPayid, setSellerPayid] = useState("");
  const [sellerConfirmPrice, setSellerConfirmPrice] = useState(false);
  const [sellerConfirmConditions, setSellerConfirmConditions] = useState(false);

  const fetchDeal = useCallback(async () => {
    try {
      const res = await fetch(`/api/deal/${dealId}`);
      const data = (await res.json()) as DealResponse;
      if (data.ok) {
        const d = data.deal;
        setDeal(d);
        // Populate buyer fields
        setBuyerName(d.buyer_name ?? "");
        setBuyerEmail(d.buyer_email ?? "");
        setBuyerPhone(d.buyer_phone ?? "");
        setVehicleMake(d.vehicle_make ?? "");
        setVehicleModel(d.vehicle_model ?? "");
        setVehicleYear(d.vehicle_year ?? "");
        setVehicleVin(d.vehicle_vin ?? "");
        setVehicleRego(d.vehicle_rego ?? "");
        setAgreedPrice(d.agreed_price ?? "");
        setPaymentMethod(d.payment_method ?? "");
        setConditions(d.conditions ?? "");
        setHandoverDate(d.handover_date ?? "");
        setHandoverLocation(d.handover_location ?? "");
        // Populate seller fields
        setSellerName(d.seller_name ?? "");
        setSellerEmail(d.seller_email ?? "");
        setSellerPhone(d.seller_phone ?? "");
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

  async function saveBuyer() {
    setSaving(true); setError(""); setSuccess("");
    try {
      const res = await fetch(`/api/deal/${dealId}/buyer`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyer_name: buyerName, buyer_email: buyerEmail, buyer_phone: buyerPhone,
          buyer_licence: buyerLicence || undefined,
          vehicle_make: vehicleMake, vehicle_model: vehicleModel, vehicle_year: vehicleYear,
          vehicle_vin: vehicleVin, vehicle_rego: vehicleRego,
          agreed_price: agreedPrice, payment_method: paymentMethod,
          conditions, handover_date: handoverDate, handover_location: handoverLocation,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!data.ok) { setError(data.error ?? "Save failed."); return; }
      setSuccess("Buyer details saved.");
      void fetchDeal();
    } catch { setError("Network error."); } finally { setSaving(false); }
  }

  async function saveSeller() {
    setSaving(true); setError(""); setSuccess("");
    try {
      const res = await fetch(`/api/deal/${dealId}/seller`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seller_name: sellerName, seller_email: sellerEmail, seller_phone: sellerPhone,
          seller_licence: sellerLicence || undefined,
          seller_rego_papers: sellerRegoPapers || undefined,
          seller_safety_cert: sellerSafetyCert || undefined,
          seller_bank_bsb: sellerBsb, seller_bank_account: sellerAccount, seller_payid: sellerPayid,
          seller_confirmed_price: sellerConfirmPrice,
          seller_confirmed_conditions: sellerConfirmConditions,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!data.ok) { setError(data.error ?? "Save failed."); return; }
      setSuccess("Seller details saved.");
      void fetchDeal();
    } catch { setError("Network error."); } finally { setSaving(false); }
  }

  async function finaliseDeal() {
    setSaving(true); setError(""); setSuccess("");
    try {
      const res = await fetch(`/api/deal/${dealId}/finalise`, { method: "POST" });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!data.ok) { setError(data.error ?? "Could not finalise."); return; }
      setSuccess("Deal finalised! PDF sent to both parties.");
      void fetchDeal();
    } catch { setError("Network error."); } finally { setSaving(false); }
  }

  function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      void navigator.share({ title: "BuyingBuddy Deal Room", url });
    } else {
      void navigator.clipboard.writeText(url);
      alert("Link copied!");
    }
  }

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
          <p className="mt-1 truncate text-sm text-gray-500" title={deal.id}>ID: {deal.id.slice(0, 8)}…</p>
        </div>
        <button onClick={handleShare} className="inline-flex shrink-0 items-center gap-1.5 rounded-2xl bg-teal-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-teal-700 active:scale-[0.97] transition">
          <Share2 className="h-4 w-4" /> Share with seller
        </button>
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
          <StatusItem done={isFinalised} label={isFinalised ? "Deal finalised ✅" : "Deal summary pending"} />
        </div>
      </section>

      {error && <div className="sticky top-2 z-20 mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 shadow-sm">{error}</div>}
      {success && <div className="sticky top-2 z-20 mt-4 rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-700 shadow-sm">{success}</div>}

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
        {/* BUYER SECTION */}
        <section className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-600">Buyer</p>
          <div className="mt-4 grid gap-4">
            <label className="grid gap-1"><span className="text-sm font-bold text-gray-900">Name</span>
              <input value={buyerName} onChange={e => setBuyerName(e.target.value)} disabled={isFinalised} className={inputClass} placeholder="Your full name" /></label>
            <label className="grid gap-1"><span className="text-sm font-bold text-gray-900">Email</span>
              <input type="email" value={buyerEmail} onChange={e => setBuyerEmail(e.target.value)} disabled={isFinalised} className={inputClass} placeholder="you@example.com" /></label>
            <label className="grid gap-1"><span className="text-sm font-bold text-gray-900">Phone</span>
              <input type="tel" value={buyerPhone} onChange={e => setBuyerPhone(e.target.value)} disabled={isFinalised} className={inputClass} placeholder="04xx xxx xxx" /></label>
            <FileUploadField id="buyer-licence" label="Driver's licence photo" uploaded={deal.buyer_licence_uploaded || Boolean(buyerLicence)} onChange={setBuyerLicence} />

            <p className="mt-2 text-xs font-black uppercase tracking-[0.16em] text-gray-500">Vehicle</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <input value={vehicleYear} onChange={e => setVehicleYear(e.target.value)} disabled={isFinalised} className={inputClass} placeholder="Year" />
              <input value={vehicleMake} onChange={e => setVehicleMake(e.target.value)} disabled={isFinalised} className={inputClass} placeholder="Make" />
              <input value={vehicleModel} onChange={e => setVehicleModel(e.target.value)} disabled={isFinalised} className={inputClass} placeholder="Model" />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input value={vehicleVin} onChange={e => setVehicleVin(e.target.value.toUpperCase())} disabled={isFinalised} className={inputClass} placeholder="VIN" />
              <input value={vehicleRego} onChange={e => setVehicleRego(e.target.value.toUpperCase())} disabled={isFinalised} className={inputClass} placeholder="Rego" />
            </div>

            <p className="mt-2 text-xs font-black uppercase tracking-[0.16em] text-gray-500">Deal terms</p>
            <input value={agreedPrice} onChange={e => setAgreedPrice(e.target.value)} disabled={isFinalised} className={inputClass} placeholder="Agreed price ($)" />
            <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} disabled={isFinalised} className={inputClass}>
              <option value="">Payment method...</option>
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank transfer</option>
              <option value="payid">PayID</option>
            </select>
            <textarea value={conditions} onChange={e => setConditions(e.target.value)} disabled={isFinalised} className={inputClass} placeholder="Conditions (e.g. 'seller to fix left tail light')" rows={3} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input type="date" value={handoverDate} onChange={e => setHandoverDate(e.target.value)} disabled={isFinalised} className={inputClass} />
              <input value={handoverLocation} onChange={e => setHandoverLocation(e.target.value)} disabled={isFinalised} className={inputClass} placeholder="Handover location" />
            </div>

            {!isFinalised && (
              <button onClick={() => void saveBuyer()} disabled={saving} className="mt-2 inline-flex min-h-[3rem] w-full items-center justify-center rounded-2xl bg-teal-600 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-60">
                {saving ? "Saving..." : "Save Buyer Details"}
              </button>
            )}
          </div>
        </section>

        {/* SELLER SECTION */}
        <section className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-600">Seller</p>
          <div className="mt-4 grid gap-4">
            <label className="grid gap-1"><span className="text-sm font-bold text-gray-900">Name</span>
              <input value={sellerName} onChange={e => setSellerName(e.target.value)} disabled={isFinalised} className={inputClass} placeholder="Seller's full name" /></label>
            <label className="grid gap-1"><span className="text-sm font-bold text-gray-900">Email</span>
              <input type="email" value={sellerEmail} onChange={e => setSellerEmail(e.target.value)} disabled={isFinalised} className={inputClass} placeholder="seller@example.com" /></label>
            <label className="grid gap-1"><span className="text-sm font-bold text-gray-900">Phone</span>
              <input type="tel" value={sellerPhone} onChange={e => setSellerPhone(e.target.value)} disabled={isFinalised} className={inputClass} placeholder="04xx xxx xxx" /></label>
            
            <FileUploadField id="seller-licence" label="Driver's licence photo" uploaded={deal.seller_licence_uploaded || Boolean(sellerLicence)} onChange={setSellerLicence} />
            <FileUploadField id="seller-rego" label="Rego papers" uploaded={deal.seller_rego_papers_uploaded || Boolean(sellerRegoPapers)} onChange={setSellerRegoPapers} />
            <FileUploadField id="seller-safety" label="Safety certificate" uploaded={deal.seller_safety_cert_uploaded || Boolean(sellerSafetyCert)} onChange={setSellerSafetyCert} />

            <p className="mt-2 text-xs font-black uppercase tracking-[0.16em] text-gray-500">Payment details</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
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
              <button onClick={() => void saveSeller()} disabled={saving} className="mt-2 inline-flex min-h-[3rem] w-full items-center justify-center rounded-2xl bg-teal-600 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-60">
                {saving ? "Saving..." : "Save Seller Details"}
              </button>
            )}
          </div>
        </section>
      </div>

      {/* Finalise */}
      {bothComplete && !isFinalised && (
        <section className="mt-6 rounded-[2rem] border-2 border-teal-300 bg-teal-50 p-6 text-center shadow-sm">
          <p className="text-xl font-black text-gray-900">Both sides are complete</p>
          <p className="mt-2 text-sm text-gray-500">Finalise the deal to generate the Deal Summary PDF and email it to both parties.</p>
          <button onClick={() => void finaliseDeal()} disabled={saving} className="mt-4 inline-flex min-h-[3.5rem] items-center justify-center rounded-2xl bg-teal-600 px-8 text-base font-black text-white hover:bg-teal-700 disabled:opacity-60">
            {saving ? "Finalising..." : "Finalise Deal & Send PDF"}
          </button>
        </section>
      )}

      <p className="mt-6 text-center text-xs text-gray-400">{DISCLAIMER}</p>
    </div>
  );
}
