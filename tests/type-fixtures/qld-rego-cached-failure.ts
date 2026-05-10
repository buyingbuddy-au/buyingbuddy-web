import type { QldRegoCheckResponse } from "../../src/lib/qld-rego/types";

export const cachedNoResultResponse = {
  ok: false,
  status: "no_result",
  error: "no_official_result",
  userMessage: "QLD Transport did not return a registration record for that plate.",
  checkedAt: "2026-05-11T00:00:00.000Z",
  durationMs: 4,
  retryable: false,
  cached: true,
} satisfies QldRegoCheckResponse;

export function readCachedFlag(response: QldRegoCheckResponse) {
  if (!response.ok && response.status === "no_result") {
    return response.cached;
  }

  return undefined;
}
