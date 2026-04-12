export const metadata = {
  title: "Terms",
  description: "Buying Buddy terms of use for reports, tools, and site content.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-12 pt-6 sm:px-6 lg:px-8 lg:pt-12">
      <section className="rounded-[2rem] border border-gray-200 bg-gray-50 p-6 shadow-sm sm:p-10">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-600">Terms</p>
        <h1 className="mt-3 text-3xl font-black tracking-[-0.06em] text-gray-900 sm:text-5xl">
          Simple terms, no fluff.
        </h1>
        <div className="mt-6 grid gap-4 text-sm leading-7 text-gray-600 sm:text-base">
          <p>The tools and guides are for information only. They help you make a better car-buying call, but they are not legal, financial, or mechanical advice.</p>
          <p>Always check the car yourself, run the PPSR where relevant, and get independent advice if the deal is serious.</p>
          <p>We try to keep the site accurate and useful, but we do not promise every listing or report will be perfect. Use your own judgment before handing over money.</p>
          <p>If something looks wrong, tell us via <a className="font-semibold text-teal-700 underline decoration-teal-300 underline-offset-4" href="mailto:info@buyingbuddy.com.au">info@buyingbuddy.com.au</a>.</p>
        </div>
      </section>
    </div>
  );
}
