export const metadata = {
  title: "Privacy Policy",
  description:
    "How Buying Buddy handles contact details, rego/PPSR enquiries, contract form submissions, support messages, payment records, and buyer-side service records.",
  alternates: { canonical: "https://buyingbuddy.com.au/privacy" },
};

const sections = [
  {
    title: "Information we collect",
    body:
      "We collect the information you submit through the site, including email address, name, phone number, vehicle identifiers, listing URLs, rego/VIN details, enquiry details, contract-form fields, support messages and payment/order references needed to deliver the service.",
  },
  {
    title: "How we use it",
    body:
      "We use this information to run checks, prepare reports, build PDFs, send emails, respond to support requests, detect abuse, improve the product, keep business records and resolve delivery or refund issues.",
  },
  {
    title: "Payments",
    body:
      "Payments are processed by Stripe. Buying Buddy does not store full card numbers or card security codes. Stripe may process payment information according to its own privacy and security terms.",
  },
  {
    title: "Email and service providers",
    body:
      "We use trusted providers to host the website, process payments, send email, store operational records and monitor the service. Those providers only receive the information needed for that purpose.",
  },
  {
    title: "No selling personal information",
    body:
      "We do not sell your personal information. We may use aggregate, non-identifying product data to understand what buyers need and where the product needs improvement.",
  },
  {
    title: "Retention",
    body:
      "We keep basic order, report, support and business records for as long as reasonably needed for delivery, support, accounting, dispute handling, abuse prevention and product improvement. We do not run public user profiles.",
  },
  {
    title: "Security",
    body:
      "We use HTTPS, Stripe checkout, access controls and operational safeguards. No web service can promise perfect security, so avoid sending unnecessary sensitive information through free-text fields.",
  },
  {
    title: "Access, correction and deletion",
    body:
      "To ask what information we hold about you, correct it, or request deletion where we no longer need it for business or legal reasons, email info@buyingbuddy.com.au from the address you used with the service.",
  },
] as const;

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-12 pt-6 sm:px-6 lg:px-8 lg:pt-12">
      <section className="rounded-[2rem] border border-gray-200 bg-gray-50 p-6 shadow-sm sm:p-10">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-600">Privacy</p>
        <h1 className="mt-3 text-3xl font-black tracking-[-0.06em] text-gray-900 sm:text-5xl">
          Plain-English privacy policy.
        </h1>
        <p className="mt-4 text-sm leading-7 text-gray-600 sm:text-base">
          Buying Buddy only asks for information needed to check the car, deliver the product, support you, and keep the service safe.
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
