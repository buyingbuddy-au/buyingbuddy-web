"use client";

import { track } from "@vercel/analytics";

type AnalyticsProperties = Record<string, string | number | boolean | null | undefined>;

export function trackBuyingBuddyEvent(eventName: string, properties: AnalyticsProperties = {}) {
  const cleaned = Object.fromEntries(
    Object.entries(properties).filter(([, value]) => value !== undefined && value !== null),
  ) as Record<string, string | number | boolean>;

  try {
    track(eventName, cleaned);
  } catch {
    // Analytics must never break buyer-facing flows.
  }
}

export const buyingBuddyEvents = {
  regoCheckStarted: "rego_check_started",
  regoCheckSuccess: "rego_check_success",
  regoCheckFailed: "rego_check_failed",
  regoLeadCaptured: "rego_lead_captured",
  sellerQuestionsCopied: "seller_questions_copied",
} as const;
