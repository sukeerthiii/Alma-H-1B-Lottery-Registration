import {
  Bucket,
  LedgerCheck,
  Registration,
  RegistrationStatus,
  WageLevel,
  WageThresholds,
  WAGE_ENTRIES,
  WAGE_ORDER,
} from "./types";

export function bucketOf(status: RegistrationStatus): Bucket {
  switch (status) {
    case "ready":
      return "clean";
    case "missing_data":
    case "validation_issue":
      return "needs_fix";
    case "duplicate_risk":
    case "needs_attorney":
      return "needs_attorney";
    case "pending_signature":
      return "blocked";
    default:
      return "done";
  }
}

function hasBadPassport(reg: Registration): boolean {
  if (!reg.passportNumber) return true;
  return (reg.missingFields ?? []).some((f) =>
    f.toLowerCase().includes("passport")
  );
}

function hasMissingBiographic(reg: Registration): boolean {
  return (reg.missingFields ?? []).some((f) =>
    f.toLowerCase().includes("date of birth")
  );
}

export function ledgerOf(reg: Registration): LedgerCheck[] {
  const done = ["submitted", "confirmed", "selected"].includes(reg.status);
  const dupOk = !reg.duplicate || reg.duplicate.resolved;
  return [
    {
      key: "identity",
      label: "Identity",
      state: hasBadPassport(reg) ? "flag" : "ok",
      value: reg.passportNumber
        ? `Passport ${reg.passportNumber} (${reg.passportCountry})`
        : "Passport number missing",
      source: "Passport scan",
    },
    {
      key: "biographic",
      label: "Biographic",
      state: hasMissingBiographic(reg) ? "flag" : "ok",
      value: hasMissingBiographic(reg)
        ? "Date of birth missing"
        : `${reg.countryOfBirth} · born ${reg.dob}`,
      source: "HRIS",
    },
    {
      key: "soc",
      label: "SOC code",
      state: "ok",
      value: `${reg.determination.socCode} ${reg.determination.socTitle}`,
      source: "Attorney",
    },
    {
      key: "wage",
      label: "Wage level",
      state: reg.determination.confirmedLevel ? "ok" : "pending",
      value: reg.determination.confirmedLevel
        ? `Level ${reg.determination.confirmedLevel}`
        : `Level ${reg.determination.suggestedLevel} suggested`,
      source: `AI ${(reg.determination.confidence * 100).toFixed(0)}% · OEWS`,
    },
    {
      key: "duplicate",
      label: "Duplicate",
      state: dupOk ? "ok" : "flag",
      value: dupOk ? "No unresolved match in firm" : "Match elsewhere in firm",
      source: "Firm-wide dedup",
    },
    {
      key: "signature",
      label: "G-28 signature",
      state: done ? "ok" : "pending",
      value: done ? "Signed" : "Pending client admin",
      source: "Client",
    },
  ];
}

export function recomputeStatus(reg: Registration): RegistrationStatus {
  // Only recompute pre-approval rows.
  const preApproval: RegistrationStatus[] = [
    "missing_data",
    "validation_issue",
    "duplicate_risk",
    "needs_attorney",
    "ready",
  ];
  if (!preApproval.includes(reg.status)) return reg.status;

  const missing = reg.missingFields ?? [];
  if (missing.some((f) => f.toLowerCase().includes("invalid")))
    return "validation_issue";
  if (missing.length > 0) return "missing_data";
  if (reg.duplicate && !reg.duplicate.resolved) return "duplicate_risk";
  if (!reg.determination.confirmedLevel) return "needs_attorney";
  return "ready";
}

export interface Funnel {
  total: number;
  ready: number;
  needsFix: number;
  needsAttorney: number;
  approved: number;
  submitted: number;
  confirmed: number;
  selected: number;
}

export function funnelOf(regs: Registration[]): Funnel {
  const f: Funnel = {
    total: regs.length,
    ready: 0,
    needsFix: 0,
    needsAttorney: 0,
    approved: 0,
    submitted: 0,
    confirmed: 0,
    selected: 0,
  };
  for (const r of regs) {
    const b = bucketOf(r.status);
    if (b === "clean") f.ready++;
    else if (b === "needs_fix") f.needsFix++;
    else if (b === "needs_attorney") f.needsAttorney++;
    if (r.status === "approved" || r.status === "ready_to_submit") f.approved++;
    if (r.status === "submitted") f.submitted++;
    if (r.status === "confirmed") f.confirmed++;
    if (r.status === "selected") f.selected++;
  }
  return f;
}

export function readinessPct(regs: Registration[]): number {
  if (regs.length === 0) return 0;
  const done = regs.filter((r) => {
    const b = bucketOf(r.status);
    return b === "clean" || b === "done";
  }).length;
  return Math.round((done / regs.length) * 100);
}

export function levelForWage(
  offered: number,
  t: WageThresholds
): WageLevel {
  let level: WageLevel = "I";
  for (const l of WAGE_ORDER) {
    if (offered >= t[l]) level = l;
  }
  return level;
}

export function entriesForLevel(level: WageLevel): number {
  return WAGE_ENTRIES[level];
}

export function fmtMoney(n: number): string {
  return `$${n.toLocaleString("en-US")}`;
}

export function daysUntil(dateIso: string, fromIso = "2026-02-20"): number {
  const ms = new Date(dateIso).getTime() - new Date(fromIso).getTime();
  return Math.max(0, Math.round(ms / 86400000));
}

const USCIS_COLUMNS = [
  "Given name",
  "Middle name",
  "Family name",
  "Sex",
  "Date of birth",
  "Beneficiary earned or will earn a master's or higher degree from a U.S. institution",
  "Country of birth",
  "Country of citizenship",
  "Passport or travel document number",
  "Passport or travel document country",
  "Passport or travel document expiration date",
  "OEWS wage level",
  "Standard Occupational Classification (SOC) code",
  "Area of intended employment",
];

function csvCell(v: string): string {
  return `"${String(v).replace(/"/g, '""')}"`;
}

function toUsDate(iso: string): string {
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(iso);
  if (!m) return iso;
  const [, y, mo, d] = m;
  return `${mo.padStart(2, "0")}/${d.padStart(2, "0")}/${y}`;
}

export function buildUscisCsv(regs: Registration[]): string {
  const header = USCIS_COLUMNS.map(csvCell).join(",");
  const lines = regs.map((r) => {
    const d = r.determination;
    return [
      r.givenName,
      r.middleName ?? "",
      r.familyName,
      r.sex ?? "",
      toUsDate(r.dob),
      r.mastersUS ? "Yes" : "No",
      r.countryOfBirth,
      r.citizenship,
      r.passportNumber,
      r.passportCountry,
      toUsDate(r.passportExpiry),
      `Wage Level ${d.confirmedLevel ?? d.suggestedLevel}`,
      d.socCode,
      d.worksite,
    ]
      .map(csvCell)
      .join(",");
  });
  return [header, ...lines].join("\n");
}
