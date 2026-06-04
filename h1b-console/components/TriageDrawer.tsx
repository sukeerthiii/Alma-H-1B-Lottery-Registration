"use client";

import { useState } from "react";
import { Campaign, Registration, WageLevel } from "@/lib/types";
import { useStore } from "@/lib/store";
import { fmtMoney } from "@/lib/engine";
import { Button, StatusBadge } from "./ui";
import { WageDial } from "./WageDial";
import { LedgerView } from "./LedgerView";

export function TriageDrawer({ campaign }: { campaign: Campaign }) {
  const { state, dispatch } = useStore();
  const reg = campaign.registrations.find((r) => r.id === state.selectedRegId);
  if (!reg) return null;

  const det = reg.determination;
  const dupOpen = reg.duplicate && !reg.duplicate.resolved;
  const expirySoon = reg.passportExpiry < "2027-01-01";

  const confirmWage = (level: WageLevel) =>
    dispatch({ type: "CONFIRM_WAGE", campaignId: campaign.id, regId: reg.id, level });

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-pine-deep/20"
        onClick={() => dispatch({ type: "CLOSE_DRAWER" })}
      />
      <aside className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[480px] flex-col overflow-y-auto border-l border-line bg-cream shadow-xl">
        <div className="flex items-start justify-between border-b border-line px-5 py-4">
          <div>
            <h2 className="text-xl font-bold text-ink">
              {reg.givenName} {reg.familyName}
            </h2>
            <div className="mt-1 flex items-center gap-2">
              <StatusBadge status={reg.status} />
              <span className="text-xs text-muted">{det.worksite}</span>
            </div>
          </div>
          <button
            onClick={() => dispatch({ type: "CLOSE_DRAWER" })}
            className="rounded-full px-2 text-2xl leading-none text-muted hover:text-pine"
          >
            ×
          </button>
        </div>

        <div className="space-y-5 px-5 py-5">
          {reg.status === "ready" && (
            <div className="rounded-xl bg-sage px-4 py-3 text-sm font-semibold text-pine-deep">
              All checks pass. Ready for approval.
            </div>
          )}

          {/* Readiness ledger */}
          <section>
            <SectionLabel>Readiness ledger</SectionLabel>
            <div className="mt-1">
              <LedgerView reg={reg} />
            </div>
            {expirySoon && (
              <p className="mt-2 text-xs text-danger">
                Note: passport expires {reg.passportExpiry}. Valid at registration,
                flag for the petition.
              </p>
            )}
          </section>

          {/* Edit beneficiary data, full attorney control */}
          <EditSection key={reg.id} reg={reg} campaignId={campaign.id} />

          {/* Cross-client duplicate */}
          {dupOpen && (
            <section className="rounded-xl border border-danger/30 bg-danger-soft/50 p-4">
              <SectionLabel tone="danger">Cross-client duplicate</SectionLabel>
              <p className="mt-1 text-sm text-ink">{reg.duplicate!.message}</p>
              <div className="mt-3 rounded-lg border border-dashed border-danger/40 bg-cream/60 px-3 py-2 text-xs text-muted">
                <div className="flex items-center gap-2">
                  <span className="select-none rounded bg-ink/80 px-6 py-0.5 text-ink/80">
                    ████████
                  </span>
                  <span className="font-semibold text-ink">Other client hidden</span>
                </div>
                <p className="mt-1">
                  Alma sees the passport match across the firm, but not which client
                  or case. Confidentiality is preserved by the ethical wall.
                </p>
              </div>
              <div className="mt-3 flex gap-2">
                <Button
                  variant="primary"
                  onClick={() =>
                    dispatch({
                      type: "RESOLVE_DUP",
                      campaignId: campaign.id,
                      regId: reg.id,
                      resolution: "bona_fide",
                    })
                  }
                >
                  Confirm separate offer
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    dispatch({
                      type: "RESOLVE_DUP",
                      campaignId: campaign.id,
                      regId: reg.id,
                      resolution: "escalated",
                    })
                  }
                >
                  Escalate to conflicts
                </Button>
              </div>
            </section>
          )}

          {/* Wage level / odds dial */}
          <section>
            <SectionLabel>Wage level · odds dial</SectionLabel>
            <p className="mb-3 text-xs text-muted">
              AI suggests Level {det.suggestedLevel} ·{" "}
              {(det.confidence * 100).toFixed(0)}% confidence. {det.rationale}{" "}
              <span className="text-ink">({det.source})</span>
            </p>
            <WageDial det={det} onConfirm={confirmWage} />
          </section>

          {/* Downstream capture */}
          <section className="rounded-xl border border-line bg-card p-4">
            <SectionLabel>Captured for the petition</SectionLabel>
            <ul className="mt-2 space-y-1 text-sm text-muted">
              <li>Min degree: {det.minDegree} in {det.field}</li>
              <li>Experience: {det.experienceMonths} months · supervises {det.supervises}</li>
              <li>Wage basis: {fmtMoney(det.offeredWage)}, OEWS snapshot dated at registration</li>
            </ul>
            <p className="mt-2 text-xs text-muted">
              These feed the LCA and the I-129, where wage level, SOC, and worksite
              must stay consistent.
            </p>
          </section>

          {/* Footer actions */}
          <div className="flex gap-2 pb-4">
            <Button variant="ghost" onClick={() => dispatch({ type: "CLOSE_DRAWER" })}>
              Close
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}

function EditSection({
  reg,
  campaignId,
}: {
  reg: Registration;
  campaignId: string;
}) {
  const { dispatch } = useStore();
  const [editing, setEditing] = useState(Boolean(reg.missingFields));
  const [f, setF] = useState({
    givenName: reg.givenName,
    middleName: reg.middleName ?? "",
    familyName: reg.familyName,
    sex: reg.sex ?? "",
    dob: reg.dob,
    mastersUS: reg.mastersUS ? "Yes" : "No",
    countryOfBirth: reg.countryOfBirth,
    citizenship: reg.citizenship,
    passportNumber: reg.passportNumber,
    passportCountry: reg.passportCountry,
    passportExpiry: reg.passportExpiry,
    socCode: reg.determination.socCode,
    wageLevel: (reg.determination.confirmedLevel ??
      reg.determination.suggestedLevel) as string,
    worksite: reg.determination.worksite,
  });
  const set = (k: keyof typeof f, v: string) =>
    setF((s) => ({ ...s, [k]: v }));

  const save = () => {
    dispatch({
      type: "APPLY_EDITS",
      campaignId,
      regId: reg.id,
      patch: {
        givenName: f.givenName,
        middleName: f.middleName,
        familyName: f.familyName,
        sex: (f.sex || undefined) as "Female" | "Male" | undefined,
        dob: f.dob,
        mastersUS: f.mastersUS === "Yes",
        countryOfBirth: f.countryOfBirth,
        citizenship: f.citizenship,
        passportNumber: f.passportNumber,
        passportCountry: f.passportCountry,
        passportExpiry: f.passportExpiry,
      },
      detPatch: {
        socCode: f.socCode,
        confirmedLevel: f.wageLevel as WageLevel,
        worksite: f.worksite,
      },
    });
    setEditing(false);
  };

  return (
    <section className="rounded-xl border border-line bg-card p-4">
      <div className="flex items-center justify-between">
        <SectionLabel>Beneficiary data</SectionLabel>
        <button
          onClick={() => setEditing((e) => !e)}
          className="text-xs font-semibold text-pine"
        >
          {editing ? "Cancel" : "Edit all fields"}
        </button>
      </div>
      <p className="mt-1 text-xs text-muted">
        Pre-filled from Alma&apos;s data. You can override every field that goes to
        USCIS.
      </p>
      {reg.missingFields && !editing && (
        <p className="mt-2 text-xs text-danger">
          Missing or invalid: {reg.missingFields.join(", ")}. Click Edit to fix.
        </p>
      )}
      {editing && (
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Field label="Given name" value={f.givenName} onChange={(v) => set("givenName", v)} />
          <Field label="Middle name" value={f.middleName} onChange={(v) => set("middleName", v)} />
          <Field label="Family name" value={f.familyName} onChange={(v) => set("familyName", v)} />
          <Select label="Sex" value={f.sex} onChange={(v) => set("sex", v)} options={["", "Female", "Male"]} />
          <Field label="Date of birth" value={f.dob} onChange={(v) => set("dob", v)} placeholder="MM/DD/YYYY" />
          <Select label="U.S. master's or higher" value={f.mastersUS} onChange={(v) => set("mastersUS", v)} options={["Yes", "No"]} />
          <Field label="Country of birth" value={f.countryOfBirth} onChange={(v) => set("countryOfBirth", v)} />
          <Field label="Country of citizenship" value={f.citizenship} onChange={(v) => set("citizenship", v)} />
          <Field label="Passport number" value={f.passportNumber} onChange={(v) => set("passportNumber", v)} />
          <Field label="Passport country" value={f.passportCountry} onChange={(v) => set("passportCountry", v)} />
          <Field label="Passport expiry" value={f.passportExpiry} onChange={(v) => set("passportExpiry", v)} placeholder="YYYY-MM-DD" />
          <Select label="OEWS wage level" value={f.wageLevel} onChange={(v) => set("wageLevel", v)} options={["I", "II", "III", "IV"]} />
          <Field label="SOC code" value={f.socCode} onChange={(v) => set("socCode", v)} />
          <Field label="Area of employment" value={f.worksite} onChange={(v) => set("worksite", v)} />
          <div className="col-span-2">
            <Button variant="primary" onClick={save}>
              Save changes
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted">{label}</span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm text-ink outline-none focus:border-pine"
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm text-ink outline-none focus:border-pine"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o === "" ? "—" : o}
          </option>
        ))}
      </select>
    </label>
  );
}

function SectionLabel({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone?: "danger";
}) {
  return (
    <div
      className={`text-xs font-semibold uppercase tracking-wider ${
        tone === "danger" ? "text-danger" : "text-muted"
      }`}
    >
      {children}
    </div>
  );
}
