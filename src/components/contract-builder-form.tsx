"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CheckCircle2, ChevronDown, Mail, ShieldCheck } from "lucide-react";

type ContractFormState = {
  email: string;
  buyerName: string;
  buyerPhone: string;
  buyerAddress: string;
  sellerName: string;
  sellerPhone: string;
  sellerEmail: string;
  sellerAddress: string;
  vehicleMakeModel: string;
  vehicleYear: string;
  vehicleRego: string;
  vehicleVin: string;
  vehicleColour: string;
  odometer: string;
  salePrice: string;
  depositAmount: string;
  balanceDue: string;
  paymentMethod: string;
  financePayoutRequired: "unknown" | "no" | "yes";
  financePayoutAmount: string;
  financePayoutRecipient: string;
  sellerBalanceAmount: string;
  handoverDate: string;
  handoverLocation: string;
  includedAccessories: string;
  roadworthyStatus: string;
  ppsrStatus: string;
  specialConditions: string;
  knownFaults: string;
};

const INITIAL_FORM: ContractFormState = {
  email: "",
  buyerName: "",
  buyerPhone: "",
  buyerAddress: "",
  sellerName: "",
  sellerPhone: "",
  sellerEmail: "",
  sellerAddress: "",
  vehicleMakeModel: "",
  vehicleYear: "",
  vehicleRego: "",
  vehicleVin: "",
  vehicleColour: "",
  odometer: "",
  salePrice: "",
  depositAmount: "",
  balanceDue: "",
  paymentMethod: "Bank transfer",
  financePayoutRequired: "unknown",
  financePayoutAmount: "",
  financePayoutRecipient: "",
  sellerBalanceAmount: "",
  handoverDate: "",
  handoverLocation: "",
  includedAccessories: "",
  roadworthyStatus: "",
  ppsrStatus: "Not recorded yet",
  specialConditions: "",
  knownFaults: "",
};

type FieldConfig = {
  name: keyof ContractFormState;
  label: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  multiline?: boolean;
};

const FIELD_GROUPS: Array<{ title: string; intro: string; fields: FieldConfig[] }> = [
  {
    title: "1. Buyer and delivery",
    intro: "This is where the finished PDF will be emailed. Blank fields stay blank in the contract.",
    fields: [
      { name: "email", label: "Email for the contract PDF", type: "email", placeholder: "you@example.com", required: true },
      { name: "buyerName", label: "Buyer full name", placeholder: "Full legal name" },
      { name: "buyerPhone", label: "Buyer phone", placeholder: "Mobile number" },
      { name: "buyerAddress", label: "Buyer address", placeholder: "Street, suburb, state", multiline: true },
    ],
  },
  {
    title: "2. Seller",
    intro: "Record who is selling the vehicle before payment or keys change hands.",
    fields: [
      { name: "sellerName", label: "Seller full name", placeholder: "Full legal name" },
      { name: "sellerPhone", label: "Seller phone", placeholder: "Mobile number" },
      { name: "sellerEmail", label: "Seller email", type: "email", placeholder: "seller@example.com" },
      { name: "sellerAddress", label: "Seller address", placeholder: "Street, suburb, state", multiline: true },
    ],
  },
  {
    title: "3. Vehicle",
    intro: "The key identifiers should match the physical car, registration paperwork and PPSR result.",
    fields: [
      { name: "vehicleMakeModel", label: "Vehicle make/model", placeholder: "Example SUV" },
      { name: "vehicleYear", label: "Year", placeholder: "2024" },
      { name: "vehicleRego", label: "Rego", placeholder: "123ABC" },
      { name: "vehicleVin", label: "VIN", placeholder: "17-character VIN" },
      { name: "vehicleColour", label: "Colour", placeholder: "White" },
      { name: "odometer", label: "Odometer", placeholder: "12,000 km" },
    ],
  },
  {
    title: "4. Money and conditions",
    intro: "If the seller still has finance, write the payout condition down before money moves.",
    fields: [
      { name: "salePrice", label: "Agreed sale price", placeholder: "$50,000" },
      { name: "depositAmount", label: "Deposit", placeholder: "$500" },
      { name: "balanceDue", label: "Balance due", placeholder: "$49,500" },
      { name: "paymentMethod", label: "Payment method", placeholder: "Bank transfer" },
      { name: "financePayoutAmount", label: "Finance payout amount if relevant", placeholder: "$48,000" },
      { name: "financePayoutRecipient", label: "Finance payout recipient", placeholder: "Finance provider" },
      { name: "sellerBalanceAmount", label: "Amount paid to seller after payout", placeholder: "$2,000" },
      { name: "specialConditions", label: "Special conditions", placeholder: "Subject to finance payout being completed before keys are handed over.", multiline: true },
    ],
  },
  {
    title: "5. Handover record",
    intro: "Use this section to slow down handover and avoid fuzzy memories later.",
    fields: [
      { name: "handoverDate", label: "Handover date/time", placeholder: "Friday 15 May, 2:00pm" },
      { name: "handoverLocation", label: "Handover location", placeholder: "Brisbane QLD" },
      { name: "includedAccessories", label: "Keys/accessories included", placeholder: "Two keys, service books, charger, floor mats", multiline: true },
      { name: "roadworthyStatus", label: "Roadworthy / safety certificate status", placeholder: "Seller to provide current safety certificate", multiline: true },
      { name: "ppsrStatus", label: "PPSR check status", placeholder: "Checked by buyer before settlement", multiline: true },
      { name: "knownFaults", label: "Known faults or condition notes", placeholder: "Stone chip on bonnet, rear tyre close to replacement", multiline: true },
    ],
  },
];

function setFieldValue<T extends keyof ContractFormState>(
  data: ContractFormState,
  key: T,
  value: ContractFormState[T],
) {
  return { ...data, [key]: value };
}

function Field({ field, value, onChange, disabled }: {
  field: FieldConfig;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}) {
  const inputClass = "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-50 disabled:bg-slate-100";

  return (
    <label className="block text-sm font-bold text-slate-700">
      {field.label}
      {field.required ? <span className="text-teal-600"> *</span> : null}
      {field.multiline ? (
        <textarea
          className={`${inputClass} min-h-24 resize-y`}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={field.placeholder}
          disabled={disabled}
        />
      ) : (
        <input
          className={inputClass}
          type={field.type ?? "text"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={field.placeholder}
          disabled={disabled}
          required={field.required}
          autoComplete={field.name === "email" ? "email" : undefined}
        />
      )}
    </label>
  );
}

export function ContractBuilderForm() {
  const [form, setForm] = useState<ContractFormState>(INITIAL_FORM);
  const [openGroup, setOpenGroup] = useState(0);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  const completedCoreFields = useMemo(() => {
    const core: Array<keyof ContractFormState> = ["email", "buyerName", "sellerName", "vehicleMakeModel", "salePrice"];
    return core.filter((key) => String(form[key]).trim()).length;
  }, [form]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");

    try {
      const response = await fetch("/api/contract-pack/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const payload = await response.json().catch(() => ({})) as { message?: string; error?: string };
      if (!response.ok) {
        throw new Error(payload.message ?? "We could not email the contract PDF. Please try again.");
      }

      setStatus("sent");
      setMessage("We’ve emailed your private sale contract PDF. Check your inbox before you head to handover.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-[2rem] border border-teal-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="inline-flex rounded-2xl bg-teal-50 p-3 text-teal-600">
          <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
        </div>
        <h2 className="mt-4 text-2xl font-black tracking-[-0.05em] text-slate-950">Contract PDF emailed.</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">{message}</p>
        <div className="mt-5 rounded-2xl border border-teal-100 bg-teal-50 p-4 text-sm leading-6 text-teal-900">
          <strong>You’re in control.</strong> If the seller rushes you, pause. It’s easier to live with walking away than dealing with problems.
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link
            href="/deal"
            className="inline-flex min-h-[3rem] items-center justify-center rounded-2xl bg-teal-600 px-5 text-sm font-black text-white transition hover:bg-teal-700"
          >
            Open a Deal Pack
          </Link>
          <Link
            href="/inspect/full"
            className="inline-flex min-h-[3rem] items-center justify-center rounded-2xl border border-slate-200 px-5 text-sm font-black text-slate-700 transition hover:border-teal-300 hover:text-teal-700"
          >
            Review inspection notes
          </Link>
        </div>
        <p className="mt-4 text-xs leading-5 text-slate-500">
          Deal Room is where the listing, inspection, PPSR, seller messages and paperwork stay together before you sign.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-600">Digital contract builder</p>
          <h2 className="mt-2 text-2xl font-black tracking-[-0.05em] text-slate-950">Email a clean private-sale PDF.</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
            Fill what you know now. The PDF keeps blank spaces for anything you still need to confirm at handover.
          </p>
        </div>
        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700">
          {completedCoreFields}/5 core fields filled
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        {FIELD_GROUPS.map((group, index) => {
          const isOpen = openGroup === index;
          return (
            <section key={group.title} className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
              <button
                type="button"
                className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left sm:px-5"
                onClick={() => setOpenGroup(isOpen ? -1 : index)}
                aria-expanded={isOpen}
              >
                <span>
                  <span className="block text-sm font-black text-slate-950">{group.title}</span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500">{group.intro}</span>
                </span>
                <ChevronDown className={`h-5 w-5 shrink-0 text-slate-500 transition ${isOpen ? "rotate-180" : ""}`} aria-hidden="true" />
              </button>

              {isOpen ? (
                <div className="grid gap-4 border-t border-slate-200 bg-white p-4 sm:grid-cols-2 sm:p-5">
                  {group.title.startsWith("4.") ? (
                    <label className="block text-sm font-bold text-slate-700 sm:col-span-2">
                      Finance payout required?
                      <select
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-50 disabled:bg-slate-100"
                        value={form.financePayoutRequired}
                        onChange={(event) => setForm(setFieldValue(form, "financePayoutRequired", event.target.value as ContractFormState["financePayoutRequired"]))}
                        disabled={status === "sending"}
                      >
                        <option value="unknown">Not sure yet</option>
                        <option value="no">No</option>
                        <option value="yes">Yes</option>
                      </select>
                    </label>
                  ) : null}

                  {group.fields.map((field) => (
                    <Field
                      key={field.name}
                      field={field}
                      value={String(form[field.name])}
                      disabled={status === "sending"}
                      onChange={(value) => setForm(setFieldValue(form, field.name, value as never))}
                    />
                  ))}
                </div>
              ) : null}
            </section>
          );
        })}
      </div>

      <div className="mt-6 rounded-3xl border border-teal-100 bg-teal-50 p-4 text-sm leading-6 text-teal-950 sm:p-5">
        <div className="flex gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" aria-hidden="true" />
          <p>
            <strong>You’re in control.</strong> Use the paperwork to slow the sale down before money changes hands. This template is practical paperwork, not legal advice.
          </p>
        </div>
      </div>

      {status === "error" ? (
        <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700" role="alert">
          {message}
        </p>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={status === "sending" || !form.email.trim()}
          className="inline-flex min-h-[3.25rem] items-center justify-center gap-2 rounded-2xl bg-teal-600 px-6 text-sm font-black text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          <Mail className="h-4 w-4" aria-hidden="true" />
          {status === "sending" ? "Emailing contract PDF…" : "Email my contract PDF"}
        </button>
        <Link href="/deal" className="inline-flex min-h-[3.25rem] items-center justify-center rounded-2xl border border-slate-200 px-6 text-sm font-black text-slate-700 transition hover:border-teal-300 hover:text-teal-700">
          See Deal Pack first
        </Link>
      </div>

      <p className="mt-4 text-xs leading-5 text-slate-500">
        We email one PDF to the address above. The Deal Pack is the next step if you want the full sale-control workspace before signing.
      </p>
    </form>
  );
}
