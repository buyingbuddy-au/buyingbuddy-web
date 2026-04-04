"use client";

import { useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { CheckCircle2, XCircle, Clock, Upload, AlertTriangle } from "lucide-react";
import type { DealPublicRecord } from "@/lib/types";

// This is a placeholder; I'll build out the subcomponents for BuyerForm, SellerForm, and DealStatusBoard based on the logic in page.tsx

export function DealStatusBoard({ deal }: { deal: DealPublicRecord }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">Status</h3>
      <div className="mt-3 grid gap-2">
        <StatusItem done={deal.buyer_licence_uploaded} label="Buyer info" />
        <StatusItem done={deal.seller_licence_uploaded} label="Seller info" />
        <StatusItem done={deal.seller_confirmed_price === 1} label="Price confirmed" />
        <StatusItem done={deal.status === 'finalised'} label="Finalised" />
      </div>
    </div>
  );
}

function StatusItem({ done, label }: { done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {done ? <CheckCircle2 className="h-4 w-4 text-teal-600" /> : <Clock className="h-4 w-4 text-gray-400" />}
      <span className={done ? "font-bold text-gray-900" : "text-gray-500"}>{label}</span>
    </div>
  );
}

export function FileUploadField({
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
    reader.onloadend = () => {
      onChange(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  return (
    <label className="grid gap-2" htmlFor={id}>
      <span className="text-sm font-bold text-gray-900">{label}</span>
      <input type="file" id={id} onChange={handleFile} className="hidden" />
      <div className={`flex min-h-[3.5rem] items-center justify-center rounded-2xl border-2 border-dashed px-4 ${uploaded ? "border-teal-200 bg-teal-50" : "border-gray-300 hover:border-teal-500"}`}>
        {uploaded ? (
          <span className="flex items-center gap-2 font-bold text-teal-700">
            <CheckCircle2 className="h-5 w-5" /> Uploaded
          </span>
        ) : (
          <span className="flex items-center gap-2 font-bold text-gray-500">
            <Upload className="h-5 w-5" /> Select file
          </span>
        )}
      </div>
    </label>
  );
}
