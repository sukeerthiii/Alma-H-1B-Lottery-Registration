export type WageLevel = "I" | "II" | "III" | "IV";

export type RegistrationStatus =
  | "missing_data"
  | "validation_issue"
  | "duplicate_risk"
  | "needs_attorney"
  | "ready"
  | "approved"
  | "pending_signature"
  | "ready_to_submit"
  | "submitted"
  | "confirmed"
  | "selected";

export type Bucket = "clean" | "needs_fix" | "needs_attorney" | "blocked" | "done";

export type CheckState = "ok" | "pending" | "flag";

export interface LedgerCheck {
  key: string;
  label: string;
  state: CheckState;
  value: string;
  source: string;
}

export interface WageThresholds {
  I: number;
  II: number;
  III: number;
  IV: number;
}

export interface Determination {
  socCode: string;
  socTitle: string;
  suggestedLevel: WageLevel;
  confirmedLevel: WageLevel | null;
  confidence: number;
  rationale: string;
  source: string;
  offeredWage: number;
  worksite: string;
  thresholds: WageThresholds;
  // I-129 downstream justification fields, captured at registration
  minDegree: string;
  field: string;
  experienceMonths: number;
  supervises: number;
}

export interface DuplicateFlag {
  kind: "cross_client" | "true_duplicate";
  message: string;
  resolved: boolean;
  resolution?: "bona_fide" | "escalated";
}

export interface Registration {
  id: string;
  givenName: string;
  middleName?: string;
  familyName: string;
  sex?: "Female" | "Male";
  dob: string;
  countryOfBirth: string;
  citizenship: string;
  passportNumber: string;
  passportCountry: string;
  passportExpiry: string;
  mastersUS: boolean;
  entityId: string;
  status: RegistrationStatus;
  determination: Determination;
  duplicate?: DuplicateFlag;
  missingFields?: string[];
  confirmationNumber?: string;
}

export interface PetitionerEntity {
  id: string;
  name: string;
  ein: string;
}

export interface Campaign {
  id: string;
  client: string;
  fiscalYear: string;
  deadline: string;
  windowOpens: string;
  entities: PetitionerEntity[];
  registrations: Registration[];
  focus?: boolean;
}

export interface AuditEvent {
  id: string;
  campaignId: string;
  ts: string;
  actor: string;
  action: string;
  detail: string;
}

export type Phase = "prepare" | "window";

export const WAGE_ENTRIES: Record<WageLevel, number> = {
  I: 1,
  II: 2,
  III: 3,
  IV: 4,
};

export const WAGE_ORDER: WageLevel[] = ["I", "II", "III", "IV"];
