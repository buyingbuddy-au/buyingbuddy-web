import Link from "next/link";
import { Check, X, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Pricing — Buying Buddy",
  description: "Choose your level of car buying protection. From free tools to complete buyer bundles.",
};

const PRODUCTS = [
  {
    name: "Free Kit",
    price: "Free",
    description: "Essential checklists and guides to get you started.",
    href: "/free-kit",
    buttonText: "Download Free",
    highlight: false,
    features: [
      "20-point inspection checklist",
      "Red flags and scam detection",
      "Basic negotiation tips",
      "QLD rego transfer basics",
    ],
  },
  {
    name: "PPSR Report",
    price: "$4.95",
    description: "Finance, stolen, and write-off checks on one vehicle.",
    href: "/ppsr",
    buttonText: "Run PPSR Check",
    highlight: false,
    features: [
      "Official PPSR data",
      "Finance owing check",
      "Stolen vehicle check",
      "Write-off history",
      "Plain English report",
    ],
  },
  {
    name: "Contract Pack",
    price: "Free",
    description: "QLD private sale paperwork for handover day. Enter your email and download instantly.",
    href: "/contract-pack",
    buttonText: "Download Free",
    highlight: true,
    features: [
      "QLD vehicle sale contract",
      "Receipt of payment",
      "Vehicle condition report",
      "Transfer of rego guide",
    ],
  },
  {
    name: "Dealer Review",
    price: "$14.95",
    description: "A sharper read on price, faults, and whether the car is worth chasing.",
    href: "/check",
    buttonText: "Start Review",
    highlight: false,
    features: [
      "Everything in PPSR",
      "Known make/model failure points",
      "Inspection angles",
      "Negotiation strategy",
    ],
  },
  {
    name: "Full Pack",
    price: "$34.95",
    description: "Everything bundled. Best when you're ready to move on one car.",
    href: "/check",
    buttonText: "Get Full Pack",
    highlight: false,
    features: [
      "Dealer review included",
      "QLD contract pack included",
      "Negotiation guidance",
      "Multiple vehicle checks",
    ],
  },
] as const;

const COMPARISON = [
  { feature: "20-point inspection checklist", free: true, ppsr: false, contract: false, dealer: true, full: true },
  { feature: "Verified PPSR report", free: false, ppsr: true, contract: false, dealer: true, full: true },
  { feature: "QLD legal contracts", free: false, ppsr: false, contract: true, dealer: false, full: true },
  { feature: "Known fault analysis", free: false, ppsr: false, contract: false, dealer: true, full: true },
  { feature: "Negotiation scripts", free: false, ppsr: false, contract: false, dealer: true, full: true },
  { feature: "Multiple vehicle checks", free: false, ppsr: false, contract: false, dealer: false, full: true },
] as const;

export default function PricingPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-6 sm:px-6 lg:px-8 lg:pt-12">
      <section className="rounded-[2rem] border border-gray-200 bg-gray-50 p-6 shadow-sm sm:p-10">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-600">Pricing</p>
        <h1 className="mt-4 max-w-2xl text-3xl font-black tracking-[-0.06em] text-gray-900 sm:text-5xl">
          Pick the protection that matches the risk.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-gray-500">
          Start free. Only pay when the car looks worth chasing.
        </p>
      </section>

      {/* Product Cards */}
      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PRODUCTS.map((product) => (
          <article
            key={product.name}
            className={`flex flex-col rounded-[1.75rem] border bg-white p-6 shadow-sm ${
              product.highlight ? "border-teal-300 ring-2 ring-teal-600/20" : "border-gray-200"
            }`}
          >
            {product.highlight && (
              <span className="mb-4 inline-flex self-start rounded-full bg-teal-600 px-3 py-1 text-xs font-bold text-white">
                Most Popular
              </span>
            )}
            <h2 className="text-lg font-black text-gray-900">{product.name}</h2>
            <p className="mt-2 text-3xl font-black tracking-[-0.05em] text-gray-900">{product.price}</p>
            <p className="mt-2 text-sm leading-6 text-gray-500">{product.description}</p>

            <ul className="mt-6 flex-1 grid gap-2">
              {product.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
                  {f}
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

      {/* Comparison Table */}
      <section className="mt-10">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Compare</p>
        <h2 className="mt-3 text-2xl font-black tracking-[-0.05em] text-gray-900">What&apos;s in each plan</h2>

        <div className="mt-6 overflow-x-auto rounded-[1.75rem] border border-gray-200 bg-white shadow-sm">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="p-4 text-left font-bold text-gray-900">Feature</th>
                <th className="p-4 text-center font-bold text-gray-500">Free</th>
                <th className="p-4 text-center font-bold text-gray-500">PPSR</th>
                <th className="p-4 text-center font-bold text-gray-500">Contract</th>
                <th className="p-4 text-center font-bold text-gray-500">Dealer</th>
                <th className="p-4 text-center font-bold text-teal-700">Full</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row) => (
                <tr key={row.feature} className="border-b border-gray-50 last:border-none">
                  <td className="p-4 text-gray-700">{row.feature}</td>
                  {[row.free, row.ppsr, row.contract, row.dealer, row.full].map((v, i) => (
                    <td key={i} className="p-4 text-center">
                      {v ? <Check className="mx-auto h-4 w-4 text-teal-600" /> : <X className="mx-auto h-4 w-4 text-gray-300" />}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mt-10 rounded-[2rem] bg-gray-900 p-6 text-center shadow-sm sm:p-10">
        <h2 className="text-2xl font-black tracking-[-0.05em] text-white sm:text-4xl">
          Not sure where to start?
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-gray-400">
          Run the free listing check first. It&apos;ll tell you which paid tools are worth it for that specific car.
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
