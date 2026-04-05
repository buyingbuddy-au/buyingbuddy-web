"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Clock, FileText, Share2, Upload } from "lucide-react";

const DISCLAIMER =
  "Test mode only. This demo room does not charge Stripe and does not send real emails. Use it to test the flow.";

const inputClass =
  "w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10";

function StatusItem({ done, label }: { done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {done ? <CheckCircle2 className="h-4 w-4 text-teal-600" /> : <Clock className="h-4 w-4 text-gray-400" />}
      <span className={done ? "font-bold text-gray-900" : "text-gray-500"}>{label}</span>
    </div>
  );
}

function FileUploadField({
  id,
  label,
  uploaded,
  onUpload,
}: {
  id: string;
  label: string;
  uploaded: boolean;
  onUpload: () => void;
}) {
  return (
    <label htmlFor={id} className="grid gap-2">
      <span className="text-sm font-bold text-gray-900">{label}</span>
      <div
        className={`flex items-center gap-2 rounded-2xl px-4 py-4 text-sm transition ${
          uploaded
            ? "bg-teal-50 text-teal-700"
            : "cursor-pointer border border-dashed border-gray-300 bg-gray-50 text-gray-500 hover:border-teal-400 hover:bg-teal-50/30"
        }`}
      >
        {uploaded ? <CheckCircle2 className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
        {uploaded ? "Uploaded" : "Choose file"}
        <input
          id={id}
          type="file"
          accept="image/*,.pdf"
          className="hidden"
          onChange={() => onUpload()}
        />
      </div>
    </label>
  );
}

export default function DealDemoPage() {
  const searchParams = useSearchParams();
  const starterEmail = searchParams.get("email") ?? "";

  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState(starterEmail);
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerLicenceUploaded, setBuyerLicenceUploaded] = useState(false);
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

  const [sellerName, setSellerName] = useState("");
  const [sellerEmail, setSellerEmail] = useState("");
  const [sellerPhone, setSellerPhone] = useState("");
  const [sellerLicenceUploaded, setSellerLicenceUploaded] = useState(false);
  const [sellerRegoUploaded, setSellerRegoUploaded] = useState(false);
  const [sellerSafetyUploaded, setSellerSafetyUploaded] = useState(false);
  const [sellerBsb, setSellerBsb] = useState("");
  const [sellerAccount, setSellerAccount] = useState("");
  const [sellerPayid, setSellerPayid] = useState("");
  const [sellerConfirmPrice, setSellerConfirmPrice] = useState(false);
  const [sellerConfirmConditions, setSellerConfirmConditions] = useState(false);
  const [finalised, setFinalised] = useState(false);

  const buyerComplete = useMemo(
    () =>
      Boolean(
        buyerName &&
          buyerEmail &&
          buyerPhone &&
          buyerLicenceUploaded &&
          vehicleMake &&
          vehicleModel &&
          vehicleYear &&
          vehicleVin &&
          vehicleRego &&
          agreedPrice &&
          paymentMethod &&
          conditions &&
          handoverDate &&
          handoverLocation,
      ),
    [
      agreedPrice,
      buyerEmail,
      buyerLicenceUploaded,
      buyerName,
      buyerPhone,
      conditions,
      handoverDate,
      handoverLocation,
      paymentMethod,
      vehicleMake,
      vehicleModel,
      vehicleRego,
      vehicleVin,
      vehicleYear,
    ],
  );

  const sellerPaymentReady = paymentMethod === "bank_transfer"
    ? Boolean(sellerBsb && sellerAccount)
    : paymentMethod === "payid"
      ? Boolean(sellerPayid)
      : true;

  const sellerComplete = useMemo(
    () =>
      Boolean(
        sellerName &&
          sellerEmail &&
          sellerPhone &&
          sellerLicenceUploaded &&
          sellerRegoUploaded &&
          sellerSafetyUploaded &&
          sellerConfirmPrice &&
          sellerConfirmConditions &&
          sellerPaymentReady,
      ),
    [
      sellerConfirmConditions,
      sellerConfirmPrice,
      sellerEmail,
      sellerLicenceUploaded,
      sellerName,
      sellerPaymentReady,
      sellerPhone,
      sellerRegoUploaded,
      sellerSafetyUploaded,
    ],
  );

  const canFinalise = buyerComplete && sellerComplete;

  function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      void navigator.share({ title: "BuyingBuddy Test Deal Room", url });
    } else {
      void navigator.clipboard.writeText(url);
      alert("Link copied!");
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-6 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-600">Deal Room · Test Mode</p>
          <p className="mt-1 truncate text-sm text-gray-500">Temporary no-pay demo room</p>
        </div>
        <button onClick={handleShare} className="inline-flex shrink-0 items-center gap-1.5 rounded-2xl bg-teal-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-teal-700">
          <Share2 className="h-4 w-4" /> Share with seller
        </button>
      </div>

      <section className="mt-4 rounded-[2rem] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <strong>Test mode:</strong> Stripe is bypassed. This room is for testing the UX and flow only.
      </section>

      <section className="mt-4 rounded-[2rem] border border-gray-200 bg-gray-50 p-5 shadow-sm">
        <p className="text-sm font-black uppercase tracking-[0.16em] text-gray-500">Status</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <StatusItem done={buyerComplete} label="Buyer details" />
          <StatusItem done={sellerComplete} label="Seller details" />
          <StatusItem done={Boolean(agreedPrice)} label={agreedPrice ? `Price: $${agreedPrice}` : "Price pending"} />
          <StatusItem done={sellerConfirmPrice} label="Seller confirmed price" />
          <StatusItem done={sellerSafetyUploaded} label="Safety certificate" />
          <StatusItem done={finalised} label={finalised ? "Test finalised" : "Final summary pending"} />
        </div>
      </section>

      {finalised && (
        <div className="mt-4 rounded-[2rem] bg-teal-600 p-6 text-center text-white">
          <FileText className="mx-auto h-8 w-8" />
          <p className="mt-3 text-xl font-black">Test Deal Finalised</p>
          <p className="mt-2 text-sm text-teal-100">You’ve tested the full Deal Room flow successfully.</p>
          <Link href="/deal" className="mt-5 inline-flex min-h-[3rem] items-center justify-center rounded-2xl border border-white/30 bg-white/10 px-6 text-sm font-bold text-white transition hover:bg-white/20">
            Back to Deal Room home
          </Link>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-600">Buyer</p>
          <div className="mt-4 grid gap-4">
            <input value={buyerName} onChange={(e) => setBuyerName(e.target.value)} className={inputClass} placeholder="Buyer full name" />
            <input value={buyerEmail} onChange={(e) => setBuyerEmail(e.target.value)} className={inputClass} placeholder="Buyer email" />
            <input value={buyerPhone} onChange={(e) => setBuyerPhone(e.target.value)} className={inputClass} placeholder="Buyer phone" />
            <FileUploadField id="buyer-licence-demo" label="Driver's licence photo" uploaded={buyerLicenceUploaded} onUpload={() => setBuyerLicenceUploaded(true)} />

            <p className="mt-2 text-xs font-black uppercase tracking-[0.16em] text-gray-500">Vehicle</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <input value={vehicleYear} onChange={(e) => setVehicleYear(e.target.value)} className={inputClass} placeholder="Year" />
              <input value={vehicleMake} onChange={(e) => setVehicleMake(e.target.value)} className={inputClass} placeholder="Make" />
              <input value={vehicleModel} onChange={(e) => setVehicleModel(e.target.value)} className={inputClass} placeholder="Model" />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input value={vehicleVin} onChange={(e) => setVehicleVin(e.target.value.toUpperCase())} className={inputClass} placeholder="VIN" />
              <input value={vehicleRego} onChange={(e) => setVehicleRego(e.target.value.toUpperCase())} className={inputClass} placeholder="Rego" />
            </div>

            <p className="mt-2 text-xs font-black uppercase tracking-[0.16em] text-gray-500">Deal terms</p>
            <input value={agreedPrice} onChange={(e) => setAgreedPrice(e.target.value)} className={inputClass} placeholder="Agreed price ($)" />
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className={inputClass}>
              <option value="">Payment method...</option>
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank transfer</option>
              <option value="payid">PayID</option>
            </select>
            <textarea value={conditions} onChange={(e) => setConditions(e.target.value)} className={inputClass} placeholder="Conditions" rows={3} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input type="date" value={handoverDate} onChange={(e) => setHandoverDate(e.target.value)} className={inputClass} />
              <input value={handoverLocation} onChange={(e) => setHandoverLocation(e.target.value)} className={inputClass} placeholder="Handover location" />
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-600">Seller</p>
          <div className="mt-4 grid gap-4">
            <input value={sellerName} onChange={(e) => setSellerName(e.target.value)} className={inputClass} placeholder="Seller full name" />
            <input value={sellerEmail} onChange={(e) => setSellerEmail(e.target.value)} className={inputClass} placeholder="Seller email" />
            <input value={sellerPhone} onChange={(e) => setSellerPhone(e.target.value)} className={inputClass} placeholder="Seller phone" />
            <FileUploadField id="seller-licence-demo" label="Driver's licence photo" uploaded={sellerLicenceUploaded} onUpload={() => setSellerLicenceUploaded(true)} />
            <FileUploadField id="seller-rego-demo" label="Rego papers" uploaded={sellerRegoUploaded} onUpload={() => setSellerRegoUploaded(true)} />
            <FileUploadField id="seller-safety-demo" label="Safety certificate" uploaded={sellerSafetyUploaded} onUpload={() => setSellerSafetyUploaded(true)} />

            <p className="mt-2 text-xs font-black uppercase tracking-[0.16em] text-gray-500">Payment details</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input value={sellerBsb} onChange={(e) => setSellerBsb(e.target.value)} className={inputClass} placeholder="BSB" />
              <input value={sellerAccount} onChange={(e) => setSellerAccount(e.target.value)} className={inputClass} placeholder="Account number" />
            </div>
            <input value={sellerPayid} onChange={(e) => setSellerPayid(e.target.value)} className={inputClass} placeholder="PayID (optional)" />

            <label className="flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-3 cursor-pointer">
              <input type="checkbox" checked={sellerConfirmPrice} onChange={(e) => setSellerConfirmPrice(e.target.checked)} className="h-5 w-5 rounded border-gray-300 text-teal-600" />
              <span className="text-sm font-bold text-gray-900">I confirm the agreed price is correct</span>
            </label>
            <label className="flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-3 cursor-pointer">
              <input type="checkbox" checked={sellerConfirmConditions} onChange={(e) => setSellerConfirmConditions(e.target.checked)} className="h-5 w-5 rounded border-gray-300 text-teal-600" />
              <span className="text-sm font-bold text-gray-900">I confirm the conditions are correct</span>
            </label>
          </div>
        </section>
      </div>

      {canFinalise && !finalised && (
        <section className="mt-6 rounded-[2rem] border-2 border-teal-300 bg-teal-50 p-6 text-center shadow-sm">
          <p className="text-xl font-black text-gray-900">Both sides are complete</p>
          <p className="mt-2 text-sm text-gray-500">This is test mode only, but you can still test the finalise step and completion state.</p>
          <button onClick={() => setFinalised(true)} className="mt-4 inline-flex min-h-[3.5rem] items-center justify-center rounded-2xl bg-teal-600 px-8 text-base font-black text-white hover:bg-teal-700">
            Finalise Test Deal
          </button>
        </section>
      )}

      <p className="mt-6 text-center text-xs text-gray-400">{DISCLAIMER}</p>
    </div>
  );
}
