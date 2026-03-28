import { NextResponse } from "next/server";
import { readFileSync } from "node:fs";
import { OrderRecord } from "@/lib/types";
import { generate_order_report } from "@/lib/pdf";

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    const order: OrderRecord = {
      id: payload.id || "test-pdf-1234",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: "complete",
      product: "full_pack",
      price_cents: 14900,
      customer_email: payload.customer_email || "test@example.com",
      customer_name: payload.customer_name || "Jordan Ladsbury",
      stripe_session_id: null,
      stripe_payment_intent: null,
      listing_url: payload.listing_url || "https://example.com/car-listing",
      vehicle_make: payload.vehicle_make || "Toyota",
      vehicle_model: payload.vehicle_model || "Hilux",
      vehicle_year: payload.vehicle_year || 2018,
      vehicle_rego: payload.vehicle_rego || "123ABC",
      vehicle_vin: payload.vehicle_vin || "JTD1234567890ABCDE",
      vehicle_mileage: payload.vehicle_mileage || 145000,
      vehicle_price_listed: payload.vehicle_price_listed || 38500,
      market_value_low: payload.market_value_low || 36000,
      market_value_high: payload.market_value_high || 41000,
      days_listed: payload.days_listed || 14,
      red_flags: payload.red_flags || [
        "Listed price is slightly above market average.",
        "High mileage for the year.",
      ],
      listing_verdict: payload.listing_verdict || "Proceed with caution. The vehicle looks okay but you should negotiate on price given the mileage.",
      ppsr_result: payload.ppsr_result || {
        finance_owing: false,
        stolen: false,
        writeoff: false,
        security_interests: "None",
        checked_at: new Date().toISOString(),
        notes: "Clear title, no financial interests recorded.",
      },
      ppsr_checked_at: new Date().toISOString(),
      dealer_verdict: payload.dealer_verdict || "Dealer has a good reputation but try to get them to include a 12-month warranty given the high mileage.",
      dealer_reviewed_at: new Date().toISOString(),
      report_pdf_path: null,
      report_sent_at: null,
      negotiation_script: null,
      contract_included: 0,
    };

    const { absolute_path } = await generate_order_report(order);
    const pdfBuffer = readFileSync(absolute_path);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="buyingbuddy-report-${order.id}.pdf"`,
      },
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
