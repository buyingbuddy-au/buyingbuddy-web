import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { get_order_by_stripe_session_id } from "@/lib/db";
import { build_vehicle_summary, format_product, format_status } from "@/lib/display";

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const params = await searchParams;
  const session_id = params.session_id ?? "";
  const order = session_id ? get_order_by_stripe_session_id(session_id) : null;
  const is_ppsr = order?.product === "ppsr";

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-12 pt-10 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-gray-200 bg-white p-6 text-center shadow-sm sm:p-10">
        <div className="mx-auto inline-flex rounded-full bg-teal-50 p-4">
          <CheckCircle2 className="h-10 w-10 text-teal-600" />
        </div>

        <h1 className="mt-6 text-3xl font-black tracking-[-0.05em] text-gray-900">
          {is_ppsr ? "Your PPSR report is being prepared" : "Your order is in the queue"}
        </h1>

        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-gray-500">
          {is_ppsr
            ? "Your PPSR report is being prepared by our team. You'll receive it by email within 2 hours."
            : "Payment succeeded. Buying Buddy will process the order and send the report once it clears review."}
        </p>

        {order ? (
          <div className="mx-auto mt-6 max-w-sm rounded-2xl bg-gray-50 p-5 text-left">
            <p className="text-sm font-black text-gray-900">{format_product(order.product)}</p>
            <p className="mt-1 text-sm text-gray-500">{build_vehicle_summary(order)}</p>
            <p className="mt-1 text-xs font-bold text-teal-600">Status: {format_status(order.status)}</p>
          </div>
        ) : session_id ? (
          <p className="mt-4 text-xs text-gray-400">Session: {session_id}</p>
        ) : null}

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex min-h-[3rem] w-full items-center justify-center rounded-2xl bg-teal-600 px-6 text-sm font-bold text-white transition hover:bg-teal-700 sm:w-auto"
          >
            Back to home
          </Link>
          <Link
            href="/blog"
            className="inline-flex min-h-[3rem] w-full items-center justify-center rounded-2xl border border-gray-300 px-6 text-sm font-bold text-gray-900 transition hover:bg-gray-50 sm:w-auto"
          >
            Read guides
          </Link>
        </div>
      </div>
    </div>
  );
}
