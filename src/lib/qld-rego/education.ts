import type { QldRegoClassification, QldRegoData, QldRegoEducation } from "./types";

const PRIVATE: QldRegoEducation = {
  headline: "PRIVATE rego is the normal everyday-use category — but it is not a full history check.",
  whatItMeans:
    "The vehicle is currently registered for private use. That is common and usually what you expect for a daily driver, but it only describes the current registration record.",
  askSeller: [
    "Has it ever been used for business, rideshare, courier, delivery, or fleet work?",
    "Can you send a current odometer photo and service history before I come out?",
    "Does the VIN on the car match the paperwork and PPSR?",
  ],
  commonMistakes: [
    "Assuming PRIVATE means the vehicle was never commercially used.",
    "Skipping the PPSR because the rego is current.",
  ],
  nextStep: "If the car still looks good, the PPSR is the next layer: finance owing, stolen status, and written-off history.",
};

const COMMERCIAL: QldRegoEducation = {
  headline: "COMMERCIAL can be fine — it just means you should ask sharper usage questions.",
  whatItMeans:
    "Commercial registration usually means the vehicle is or was used for business/work purposes. That can mean fleet, trade, courier, towing, or higher-use patterns.",
  askSeller: [
    "What work was the car used for, and how many drivers used it?",
    "Has it towed, carried loads, or done courier/rideshare work?",
    "Are the service intervals documented and up to date?",
  ],
  commonMistakes: [
    "Treating commercial-use kilometres the same as gentle private-use kilometres.",
    "Not adjusting the offer for harder use, tyres, brakes, suspension, or towing wear.",
  ],
  nextStep: "Ask for service proof and consider an inspection before price gets emotional.",
};

const DEALER: QldRegoEducation = {
  headline: "DEALER context needs paperwork clarity before you rely on anything.",
  whatItMeans:
    "Dealer/trade context can be legitimate, but it is not the same as a normal private ownership story. Confirm exactly how the vehicle will be registered and transferred.",
  askSeller: [
    "Is the car being sold with current registration and a safety certificate?",
    "Whose name/entity is on the paperwork?",
    "Will I receive transfer paperwork before money changes hands?",
  ],
  commonMistakes: [
    "Assuming dealer context automatically means the car has been checked properly.",
    "Driving away without understanding registration transfer and paperwork timing.",
  ],
  nextStep: "Use the result as a prompt to verify paperwork, not as permission to skip it.",
};

const DEFAULT: QldRegoEducation = {
  headline: "The rego result is useful — now make sure the story matches the car.",
  whatItMeans:
    "This tells you the current registration record. It does not replace a PPSR, mechanical inspection, or seller identity check.",
  askSeller: [
    "Can you send the VIN, current odometer, and service history?",
    "Does the VIN on the car match the paperwork?",
    "Is there any finance owing, write-off history, or insurance claim history?",
  ],
  commonMistakes: [
    "Treating a current rego as proof the car is clear of finance or history issues.",
    "Not asking why the seller's story differs from the registration result.",
  ],
  nextStep: "Use this result to ask better questions, then run PPSR before sending money.",
};

export function getPurposeEducation(purpose?: string): QldRegoEducation {
  const key = (purpose ?? "").toUpperCase();
  if (key.includes("PRIVATE")) return PRIVATE;
  if (key.includes("COMMERCIAL")) return COMMERCIAL;
  if (key.includes("DEALER")) return DEALER;
  return DEFAULT;
}

const TEXT_MONTH_INDEX: Record<string, number> = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
};

function parseQldDate(input?: string) {
  const slashMatch = input?.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    return new Date(Number(slashMatch[3]), Number(slashMatch[2]) - 1, Number(slashMatch[1]));
  }

  const textMonthMatch = input?.match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/);
  if (!textMonthMatch) return null;

  const monthIndex = TEXT_MONTH_INDEX[textMonthMatch[2].toLowerCase()];
  if (monthIndex === undefined) return null;

  return new Date(Number(textMonthMatch[3]), monthIndex, Number(textMonthMatch[1]));
}

export function classifyQldRego(data: QldRegoData): QldRegoClassification {
  const status = (data.registrationStatus ?? "").toUpperCase();
  if (!status.includes("CURRENT")) return "stop";

  const expiry = parseQldDate(data.expiry);
  if (!expiry) return "stop";

  const days = Math.ceil((expiry.getTime() - Date.now()) / 86_400_000);
  if (days < 0) return "stop";
  if (days <= 30) return "watch";

  const purpose = (data.purpose ?? "").toUpperCase();
  if (purpose.includes("COMMERCIAL") || purpose.includes("DEALER") || purpose.includes("CONDITIONAL")) {
    return "watch";
  }

  return "pass";
}
