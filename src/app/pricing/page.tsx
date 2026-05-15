import Link from "next/link";
import { Check, CheckCircle2, X } from "lucide-react";

export const metadata = {
  title: "Pricing",
  description:
    "Simple buyer-side used-car help: free tools, $4.95 PPSR reports, and a $9.99 Deal Pack for private car buyers."
};

const PRODUCTS = [
  {
    name: "Free Rego & Listing Tools",
    price: "Free",
    description: "Start with the plate or listing when a car looks interesting but you are not ready to spend money yet.",
    href: "/rego-check",
    buttonText: "Start free",
    highlight: false,
    features: [
      "Listing sanity check",
      "Red flags and scam prompts",
      "Inspection checklist",
      "Private-sale contract PDF builder",
    ],
  },
  {
    name: "PPSR Report",
    price: "$4.95",
    description: "The minimum paid check before you send a deposit or hand over cash.",
    href: "/ppsr",
    buttonText: "Run PPSR Check",
    highlight: true,
    features: [
      "Finance owing check",
      "Stolen vehicle status",
      "Written-off status",
      "Plain-English summary",
      "Same business day, usually within 2 hours",
    ],
  },
  {
    name: "Deal Pack",
    price: "$9.99",
    description: "For the car that passes the first sniff test and is worth chasing properly.",
    href: "/deal",
    buttonText: "Open Deal Pack",
    highlight: false,
    features: [
      "PPSR next-step guidance",
      "Private-sale contract PDF",
      "Guided handover checklist",
      "Deal Pack record",
      "Buyer/seller detail capture",
    ],
  },
] as const;

const COMPARISON = [
  { feature: "Listing red-flag check", free: true, ppsr: false, deal: true },
  { feature: "Inspection checklist", free: true, ppsr: false, deal: true },
  { feature: "Finance owing / encumbrance check", free: false, ppsr: true, deal: true },
  { feature: "Stolen and written-off status", free: false, ppsr: true, deal: true },
  { feature: "Private-sale contract PDF", free: true, ppsr: false, deal: true },
  { feature: "Guided handover record", free: false, ppsr: false, deal: true },
] as const;

export default function PricingPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-6 sm:px-6 lg:px-8 lg:pt-12">
      <section className="rounded-[2rem] border border-gray-200 bg-gray-50 p-6 shadow-sm sm:p-10">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-600">Pricing</p>
        <h1 className="mt-4 max-w-2xl text-3xl font-black tracking-[-0.06em] text-gray-900 sm:text-5xl">
          Buyer-side help without the premium fee.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-gray-500">
          Start free. Only pay when the car looks worth chasing — without a traditional buyer's-agent fee.
        </p>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {PRODUCTS.map((product) => (
          <article
            key={product.name}
            className={`flex flex-col rounded-[1.75rem] border bg-white p-6 shadow-sm ${
              product.highlight ? "border-teal-300 ring-2 ring-teal-600/20" : "border-gray-200"
            }`}
          >
            {product.highlight && (
              <span className="mb-4 inline-flex self-start rounded-full bg-teal-600 px-3 py-1 text-xs font-bold text-white">
                Minimum smart move
              </span>
            )}
            <h2 className="text-lg font-black text-gray-900">{product.name}</h2>
            <p className="mt-2 text-3xl font-black tracking-[-0.05em] text-gray-900">{product.price}</p>
            <p className="mt-2 text-sm leading-6 text-gray-500">{product.description}</p>

            <ul className="mt-6 grid flex-1 gap-2">
              {product.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" aria-hidden="true" />
                  {feature}
                </li>
              ))}
            </ul>

            <Link
              href={product.href}
              className={`mt-6 inline-flex min-h-[3rem] w-full items-center justify-center rounded-2xl text-sm font-bold transition ${
                product.highlight
                  ? "bg-teal-600 text-white hover:bg-teal-700"
                  : "border border-gray-300 text-gray-900 hover:bg-gray-50"
              }`}
            >
              {product.buttonText}
            </Link>
          </article>
        ))}
      </section>

      <section className="mt-10">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Compare</p>
        <h2 className="mt-3 text-2xl font-black tracking-[-0.05em] text-gray-900">What&apos;s included</h2>

        <div className="mt-6 overflow-x-auto rounded-[1.75rem] border border-gray-200 bg-white shadow-sm">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="p-4 text-left font-bold text-gray-900">Feature</th>
                <th className="p-4 text-center font-bold text-gray-500">Free</th>
                <th className="p-4 text-center font-bold text-teal-700">PPSR</th>
                <th className="p-4 text-center font-bold text-gray-500">Deal Pack</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row) => (
                <tr key={row.feature} className="border-b border-gray-50 last:border-none">
                  <td className="p-4 text-gray-700">{row.feature}</td>
                  {[row.free, row.ppsr, row.deal].map((value, index) => (
                    <td key={index} className="p-4 text-center">
                      {value ? (
                        <Check className="mx-auto h-4 w-4 text-teal-600" aria-hidden="true" />
                      ) : (
                        <X className="mx-auto h-4 w-4 text-gray-300" aria-hidden="true" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10 rounded-[2rem] border border-teal-200 bg-teal-50 p-6 text-center shadow-sm sm:p-10">
        <h2 className="text-2xl font-black tracking-[-0.05em] text-gray-900 sm:text-4xl">
          Not sure where to start?
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-gray-600">
          Run the free listing check first. It tells you whether a PPSR is worth doing for that specific car.
        </p>
        <Link
          href="/check"
          className="mt-8 inline-flex min-h-[3.5rem] items-center justify-center rounded-2xl bg-teal-600 px-8 text-base font-black text-white transition hover:bg-teal-700"
        >
          Run Free Check
        </Link>
      </section>
    </div>
  );
}
