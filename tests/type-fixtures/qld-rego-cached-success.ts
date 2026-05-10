import type { QldRegoCheckResponse, QldRegoCheckSuccess } from "../../src/lib/qld-rego/types";

export const cachedSuccessResponse = {
  ok: true,
  status: "success",
  classification: "pass",
  data: {
    rego: "123ABC",
    vin: "6FPAAAJGSW6P12345",
    description: "2020 Toyota Corolla",
    purpose: "PRIVATE",
    registrationStatus: "CURRENT",
    expiry: "2026-12-31",
  },
  education: {
    headline: "Registration looks current.",
    whatItMeans: "The QLD registration lookup returned a current private-use registration.",
    askSeller: ["Can you confirm the VIN matches the vehicle?"],
    commonMistakes: ["Do not treat rego status as a PPSR finance check."],
    nextStep: "Run a PPSR before paying the seller.",
  },
  checkedAt: "2026-05-11T00:00:00.000Z",
  durationMs: 4,
  source: "qld-transport-check-rego",
  cached: true,
} satisfies QldRegoCheckSuccess;

export const assignableCachedSuccessResponse: QldRegoCheckResponse = cachedSuccessResponse;

export function readCachedFlag(response: QldRegoCheckResponse) {
  if (response.ok) {
    return response.cached;
  }

  return undefined;
}
