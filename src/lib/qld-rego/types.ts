export type QldRegoPurpose = "PRIVATE" | "COMMERCIAL" | "DEALER" | string;

export type QldRegoClassification = "pass" | "watch" | "stop";

export interface QldRegoData {
  rego: string;
  vin?: string;
  description?: string;
  purpose?: QldRegoPurpose;
  registrationStatus?: string;
  expiry?: string;
}

export interface QldRegoEducation {
  headline: string;
  whatItMeans: string;
  askSeller: string[];
  commonMistakes: string[];
  nextStep: string;
}

export interface QldRegoCheckSuccess {
  ok: true;
  status: "success";
  classification: QldRegoClassification;
  data: QldRegoData;
  education: QldRegoEducation;
  checkedAt: string;
  durationMs: number;
  source: "qld-transport-check-rego";
  cached?: boolean;
}

export interface QldRegoCheckFailure {
  ok: false;
  status:
    | "input_error"
    | "no_result"
    | "not_qld"
    | "busy"
    | "timeout"
    | "official_unavailable"
    | "parse_error"
    | "blocked"
    | "error";
  error: string;
  userMessage: string;
  checkedAt: string;
  durationMs?: number;
  retryable: boolean;
}

export type QldRegoCheckResponse = QldRegoCheckSuccess | QldRegoCheckFailure;
