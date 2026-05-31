export const metadata = {
  title: "Terms",
  description:
    "Buying Buddy terms for used-car buyer tools, QLD rego checks, PPSR guidance, private-sale paperwork, reports, payments, refunds, and website content.",
  alternates: { canonical: "https://buyingbuddy.com.au/terms" },
};

const sections = [
  {
    title: "What Buying Buddy is",
    body:
      "Buying Buddy is a buyer-side information service for Australian used-car shoppers. It provides self-serve checks, guides, templates, report summaries and handover tools to help you slow the deal down and make a more informed decision.",
  },
  {
    title: "What Buying Buddy is not",
    body:
      "Buying Buddy is not a law firm, financial adviser, mechanic, insurer, lender, buyer's agent, escrow service, government agency, PPSR provider, NEVDIS operator or Department of Transport service. The tools are not legal, financial, mechanical or safety advice.",
  },
  {
    title: "Government and PPSR affiliation",
    body:
      "Buying Buddy is not affiliated with, endorsed by, or acting for the PPSR, NEVDIS, TMR, any state transport department, or any Australian government agency. Any PPSR, rego or government-source information is point-in-time information that still needs to be checked against the actual vehicle and seller documents.",
  },
  {
    title: "Customer responsibility",
    body:
      "Before paying a deposit or handing over money, you are responsible for matching the VIN, rego, seller identity, PPSR certificate, safety certificate, odometer, service history, written terms and the physical vehicle. If the deal is serious or something feels wrong, get independent legal, finance or mechanical advice before proceeding.",
  },
  {
    title: "Paid products and delivery",
    body:
      "Prices are shown in Australian dollars before checkout. Stripe processes card payments. PPSR-related report summaries are delivered by email as soon as practical after the required information is available; same business day, usually within 2 hours, is the normal target but not a guaranteed deadline where external services, missing details or manual review slow things down.",
  },
  {
    title: "Refunds and Australian Consumer Law",
    body:
      "Nothing in these terms excludes rights you have under Australian Consumer Law. If Buying Buddy fails to provide a paid digital product or the delivered product is materially wrong because of our error, contact us and we will fix it, redeliver it, or refund it where appropriate. We do not refund because a vehicle is unsafe, unsuitable, financed, written off, sold to someone else, or because you change your mind after receiving the digital product.",
  },
  {
    title: "Accuracy and limits",
    body:
      "We try to keep the site practical, accurate and useful, but listings, seller statements, vehicle condition, government records and third-party services can change or contain errors. Buying Buddy does not promise that every issue will be detected or that a vehicle is safe, legal, finance-free, mechanically sound or worth buying.",
  },
  {
    title: "Contact",
    body:
      "For support, corrections, delivery issues or refund requests, email info@buyingbuddy.com.au and include the email address used at checkout plus any relevant vehicle identifier or order reference.",
  },
] as const;

export default function TermsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-12 pt-6 sm:px-6 lg:px-8 lg:pt-12">
      <section className="rounded-[2rem] border border-gray-200 bg-gray-50 p-6 shadow-sm sm:p-10">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-600">Terms</p>
        <h1 className="mt-3 text-3xl font-black tracking-[-0.06em] text-gray-900 sm:text-5xl">
          Simple terms, plain English.
        </h1>
        <p className="mt-4 text-sm leading-7 text-gray-600 sm:text-base">
          These terms are written for normal humans, not courtroom goblins. They explain what Buying Buddy does, where the limits are, and how to contact us if something goes wrong.
        </p>

        <div className="mt-8 grid gap-4 text-sm leading-7 text-gray-600 sm:text-base">
          {sections.map((section) => (
            <section key={section.title} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <h2 className="text-base font-black text-gray-950">{section.title}</h2>
              <p className="mt-2">{section.body}</p>
            </section>
          ))}
        </div>
      </section>
    </div>
  );
}
