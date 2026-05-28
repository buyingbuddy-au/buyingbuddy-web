import type { PPSRExtractedData, PPSRVerdict } from "@/lib/types";

export type PPSRGuideStatusTone = "clear" | "caution" | "alert";

export interface PPSRCustomerGuideSection {
  id: "finance" | "stolen" | "writeoff" | "registration";
  title: string;
  kicker: string;
  status_label: string;
  status_tone: PPSRGuideStatusTone;
  summary: string;
  why_it_matters: string;
  actions: string[];
  proof_label: string;
}

export interface PPSRCustomerGuide {
  verdict: PPSRVerdict;
  headline: string;
  subheadline: string;
  vehicle_label: string;
  certificate_note: string;
  sections: PPSRCustomerGuideSection[];
  next_steps: string[];
  deal_pack_prompt: string;
}

function vehicle_label(data: PPSRExtractedData): string {
  const parts = [data.make, data.model, data.year ? String(data.year) : null]
    .filter((part): part is string => Boolean(part));

  return parts.join(" ") || data.rego || data.vin || "This vehicle";
}

function registration_summary(data: PPSRExtractedData): string {
  const status = data.registration_status?.trim();
  const expiry = data.registration_expiry?.trim();

  if (status && expiry) {
    return `${status}; expiry shown as ${expiry}.`;
  }

  if (status) {
    return status;
  }

  if (expiry) {
    return `Expiry shown as ${expiry}.`;
  }

  return "Registration details were not clear in the parsed PPSR text.";
}

function headline_for_verdict(data: PPSRExtractedData): string {
  if (data.finance_owing) {
    return "Do not pay the seller until the finance is safely cleared.";
  }

  if (data.stolen) {
    return "Do not proceed while a stolen-vehicle flag is showing.";
  }

  if (data.writeoff) {
    return data.verdict === "ALERT"
      ? "Stop and verify the write-off history before you go further."
      : "Proceed carefully — this car has write-off history.";
  }

  if (data.verdict === "CAUTION") {
    return "Good signs, but one detail needs checking before you pay.";
  }

  return "PPSR looks clear — now match the car and paperwork.";
}

function subheadline_for_verdict(data: PPSRExtractedData): string {
  if (data.verdict === "ALERT") {
    return "This is the point where a calm process saves expensive pain. Resolve the issue in writing before money changes hands.";
  }

  if (data.verdict === "CAUTION") {
    return "The PPSR is not a hard no, but it changes how you inspect, negotiate, and document the deal.";
  }

  return "No finance, stolen, or write-off flags were found in the parsed certificate. Keep going, but still verify the basics in person.";
}

function build_finance_section(data: PPSRExtractedData): PPSRCustomerGuideSection {
  if (data.finance_owing) {
    return {
      id: "finance",
      title: "Money owing",
      kicker: "Security interest",
      status_label: "Action required",
      status_tone: "alert",
      summary: "A security interest is registered against this vehicle. Treat it as finance owing until proven otherwise.",
      why_it_matters:
        "If the loan is not discharged properly, the lender may still have rights over the car after you buy it.",
      actions: [
        "Ask the seller for a current payout letter from the lender.",
        "Do not hand money to the seller and trust them to pay it out later.",
        "At settlement, pay the lender directly first, then pay the seller any balance.",
        "Get written discharge confirmation and keep it with the PPSR certificate.",
      ],
      proof_label: data.finance_details ?? "Security interest registered on the PPSR certificate.",
    };
  }

  return {
    id: "finance",
    title: "Money owing",
    kicker: "Security interest",
    status_label: "No security interest found",
    status_tone: "clear",
    summary: "No finance/security interest was found in the parsed PPSR text.",
    why_it_matters:
      "This lowers repossession risk, but you still need to match the VIN and seller paperwork before paying.",
    actions: [
      "Match the VIN on the certificate to the car itself.",
      "Keep the certificate with your purchase records.",
    ],
    proof_label: "No security interest found in the parsed certificate text.",
  };
}

function build_stolen_section(data: PPSRExtractedData): PPSRCustomerGuideSection {
  if (data.stolen) {
    return {
      id: "stolen",
      title: "Stolen status",
      kicker: "NEVDIS / police data",
      status_label: "Stolen flag",
      status_tone: "alert",
      summary: "A stolen notification appears in the PPSR/NEVDIS data. Do not buy this car.",
      why_it_matters:
        "A stolen-vehicle flag can expose you to losing the vehicle and the money you paid for it.",
      actions: [
        "Walk away from the deal until the flag is formally resolved.",
        "Verify the notification with the relevant police or road authority.",
        "Do not send a deposit while the stolen status is unresolved.",
      ],
      proof_label: data.stolen_details ?? "Stolen notification recorded in the PPSR/NEVDIS section.",
    };
  }

  return {
    id: "stolen",
    title: "Stolen status",
    kicker: "NEVDIS / police data",
    status_label: "Not recorded",
    status_tone: "clear",
    summary: "The certificate says the vehicle is not recorded as stolen.",
    why_it_matters:
      "This is a positive sign, but PPSR still tells you to match identifiers and treat official data as a point-in-time check.",
    actions: [
      "Confirm the VIN and plate on the car match the certificate.",
      "Check seller ID and registration paperwork before settlement.",
    ],
    proof_label: data.stolen_details ?? "Not recorded as stolen in the parsed certificate text.",
  };
}

function build_writeoff_section(data: PPSRExtractedData): PPSRCustomerGuideSection {
  if (data.writeoff) {
    const statutory = /statutory/i.test(data.writeoff_details ?? "");
    return {
      id: "writeoff",
      title: "Write-off history",
      kicker: "Damage history",
      status_label: statutory ? "Statutory write-off" : "Write-off recorded",
      status_tone: statutory ? "alert" : "caution",
      summary: statutory
        ? "A statutory write-off record means this car may not be road-registerable. Stop and verify before proceeding."
        : "A write-off record exists. It may be repairable, but it should change the inspection and price.",
      why_it_matters:
        "Write-off history can affect safety, insurance, finance approval, resale value, and whether the car can be registered.",
      actions: [
        "Get a proper pre-purchase inspection before making an offer.",
        "Ask for repair invoices, photos, and inspection/roadworthy records.",
        "Price it below an equivalent clean-title car or walk away.",
      ],
      proof_label: data.writeoff_details ?? "Write-off record present in the parsed certificate text.",
    };
  }

  return {
    id: "writeoff",
    title: "Write-off history",
    kicker: "Damage history",
    status_label: "Not recorded",
    status_tone: "clear",
    summary: "No written-off vehicle notification was found in the parsed certificate text.",
    why_it_matters:
      "This is another positive sign, but it does not replace a physical inspection for accident or flood damage.",
    actions: [
      "Still inspect paint, panels, tyres, underbody, and warning lights.",
      "Use the Buying Buddy inspection checklist before committing.",
    ],
    proof_label: data.writeoff_details ?? "Not recorded as written-off in the parsed certificate text.",
  };
}

function build_registration_section(data: PPSRExtractedData): PPSRCustomerGuideSection {
  const status_text = registration_summary(data);
  const has_issue = /expired|unregistered|not recorded/i.test(status_text);

  return {
    id: "registration",
    title: "Registration",
    kicker: "Road-use basics",
    status_label: has_issue ? "Check before driving" : "Check expiry",
    status_tone: has_issue ? "caution" : "clear",
    summary: status_text,
    why_it_matters:
      "Registration and transfer rules are separate from PPSR finance/stolen/write-off data, especially for QLD private sales.",
    actions: has_issue
      ? [
          "Confirm current registration with the state road authority.",
          "Do not assume you can legally drive it home.",
          "For QLD, check safety certificate and transfer requirements before settlement.",
        ]
      : [
          "Confirm the expiry date with the state road authority.",
          "For QLD, make sure the seller has the required safety certificate before transfer.",
        ],
    proof_label: status_text,
  };
}

function next_steps_for(data: PPSRExtractedData): string[] {
  if (data.finance_owing) {
    return [
      "Do not hand money to the seller to ‘pay the loan later’. That is how buyers get burned.",
      "Get the lender payout figure in writing and pay the lender directly at settlement.",
      "Only release the remaining balance to the seller after the finance payout path is documented.",
      "Keep the PPSR certificate, payout letter, receipt, and discharge confirmation together.",
    ];
  }

  if (data.stolen) {
    return [
      "Do not send a deposit or continue settlement.",
      "Verify the stolen notification with the relevant authority.",
      "Choose another car unless the issue is formally cleared in writing.",
    ];
  }

  if (data.writeoff) {
    return [
      "Book a proper pre-purchase inspection before negotiating.",
      "Ask for repair history and registration evidence.",
      "Negotiate against clean-title market value, not the seller’s story.",
    ];
  }

  return [
    "Match the VIN, plate, make, model, and year to the car in person.",
    "Check seller ID, registration papers, and QLD safety certificate requirements.",
    "Use the inspection checklist before sending a deposit.",
    "Keep the official PPSR certificate with your purchase paperwork.",
  ];
}

export function build_ppsr_customer_guide(data: PPSRExtractedData): PPSRCustomerGuide {
  const vehicle = vehicle_label(data);

  return {
    verdict: data.verdict,
    headline: headline_for_verdict(data),
    subheadline: subheadline_for_verdict(data),
    vehicle_label: vehicle,
    certificate_note:
      "This guide explains the official PPSR certificate in plain English. Keep the official PPSR certificate attached to the Buying Buddy email as the source document.",
    sections: [
      build_finance_section(data),
      build_stolen_section(data),
      build_writeoff_section(data),
      build_registration_section(data),
    ],
    next_steps: next_steps_for(data),
    deal_pack_prompt:
      data.verdict === "CLEAR"
        ? "If you are still interested in the car, the next useful step is inspection + paperwork so the clean PPSR does not become a messy handover."
        : "If you keep negotiating, use the PDF workspace to document settlement, payout steps, and handover instead of relying on seller promises.",
  };
}
