import { writeFileSync } from "node:fs";
import { generate_order_report } from "../src/lib/pdf";
import { OrderRecord } from "../src/lib/types";

async function main() {
  const order: OrderRecord = {
    id: "sample-report-jordan",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status: "complete",
    product: "full_pack",
    price_cents: 14900,
    customer_email: "test@example.com",
    customer_name: "Jordan Ladsbury",
    stripe_session_id: null,
    stripe_payment_intent: null,
    listing_url: "https://example.com/car-listing",
    vehicle_identifier: "888XYZ",
    vehicle_make: "Toyota",
    vehicle_model: "Hilux",
    vehicle_year: 2019,
    vehicle_rego: "888XYZ",
    vehicle_vin: "JTD1234567890ABCDE",
    vehicle_mileage: 145000,
    vehicle_price_listed: 38500,
    market_value_low: 36000,
    market_value_high: 41000,
    days_listed: 14,
    red_flags: [
      "Listed price is slightly above market average.",
      "High mileage for the year."
    ],
    listing_verdict: "Proceed with caution. The vehicle looks okay but you should negotiate on price given the mileage.",
    ppsr_result: {
      finance_owing: false,
      stolen: false,
      writeoff: false,
      security_interests: "None",
      checked_at: new Date().toISOString(),
      notes: "Clear title, no financial interests recorded."
    },
    ppsr_checked_at: new Date().toISOString(),
    dealer_verdict: "Dealer has a good reputation but try to get them to include a 12-month warranty given the high mileage.",
    dealer_reviewed_at: new Date().toISOString(),
    report_pdf_path: null,
    report_sent_at: null,
    negotiation_script: null,
    contract_included: 0,
  };

  try {
    const { absolute_path } = await generate_order_report(order);
    console.log(`Test PDF successfully saved to: ${absolute_path}`);
    
    // Also copy it to the root of buyingbuddy-web so it's easy to find.
    const fs = await import('fs');
    fs.copyFileSync(absolute_path, './test-report.pdf');
    console.log("Copied to ./test-report.pdf for easy access");

  } catch (error) {
    console.error("Failed to generate PDF:", error);
  }
}

main();