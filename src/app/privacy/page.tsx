export const metadata = {
  title: "Privacy Policy",
  description: "How Buying Buddy handles contact details and form submissions.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-12 pt-6 sm:px-6 lg:px-8 lg:pt-12">
      <section className="rounded-[2rem] border border-gray-200 bg-gray-50 p-6 shadow-sm sm:p-10">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-600">Privacy</p>
        <h1 className="mt-3 text-3xl font-black tracking-[-0.06em] text-gray-900 sm:text-5xl">
          Plain-English privacy policy.
        </h1>
        <div className="mt-6 grid gap-4 text-sm leading-7 text-gray-600 sm:text-base">
          <p>Buying Buddy only uses the information you type into the site to answer your question, generate your report, or follow up on your enquiry.</p>
          <p>We do not run user accounts or public profiles. If you contact us by email or a form, we use that message to respond and keep the service running.</p>
          <p>We may keep basic business records for support, delivery, and internal improvement. We do not sell your details.</p>
          <p>If you want something removed, email <a className="font-semibold text-teal-700 underline decoration-teal-300 underline-offset-4" href="mailto:info@buyingbuddy.com.au">info@buyingbuddy.com.au</a>.</p>
        </div>
      </section>
    </div>
  );
}
