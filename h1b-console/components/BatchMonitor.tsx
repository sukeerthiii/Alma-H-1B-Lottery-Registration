"use client";

import { Campaign } from "@/lib/types";
import { useStore } from "@/lib/store";
import { Button, Card } from "./ui";
import { fmtMoney, buildUscisCsv } from "@/lib/engine";

const STEPS = [
  "Generate USCIS template (batches of 250)",
  "Upload template to USCIS",
  "G-28 signed by client administrator",
  "Authorize payment and submit",
];

export function BatchMonitor({ campaign }: { campaign: Campaign }) {
  const { state, dispatch } = useStore();
  const step = state.batchStep[campaign.id] ?? 0;

  const approved = campaign.registrations.filter(
    (r) => r.status === "approved"
  ).length;
  const confirmed = campaign.registrations.filter(
    (r) => r.status === "confirmed"
  ).length;
  const selected = campaign.registrations.filter(
    (r) => r.status === "selected"
  ).length;
  const inBatch = approved + confirmed + selected;
  const fee = inBatch * 215;

  const batchRegs = campaign.registrations.filter((r) =>
    ["approved", "confirmed", "selected"].includes(r.status)
  );
  const download = (filename: string, csv: string) => {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };
  const exportEntity = (entityId: string, entityName: string) => {
    const regs = batchRegs.filter((r) => r.entityId === entityId);
    download(
      `${entityName.replace(/[^A-Za-z0-9]+/g, "-")}-uscis.csv`,
      buildUscisCsv(regs)
    );
  };

  if (inBatch === 0) {
    return (
      <Card className="p-6">
        <p className="text-muted">
          No approved registrations yet. Switch to Prepare mode, clear exceptions,
          and approve the clean set first.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-ink">
              Batch 1 · {inBatch} registrations
            </h3>
            <p className="text-sm text-muted">
              Fee total {fmtMoney(fee)} · non-refundable · closes Mar 19
            </p>
          </div>
          {step < STEPS.length && (
            <Button onClick={() => dispatch({ type: "ADVANCE_BATCH", campaignId: campaign.id })}>
              {step === 3 ? "Authorize payment" : "Advance"}
            </Button>
          )}
        </div>

        <ol className="mt-5 space-y-2">
          {STEPS.map((label, i) => {
            const done = step > i;
            const active = step === i;
            const manual = i === 2 || i === 3;
            return (
              <li
                key={label}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${
                  done
                    ? "border-pine/30 bg-sage-soft"
                    : active
                      ? "border-pine bg-card"
                      : "border-line bg-card opacity-60"
                }`}
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                    done ? "bg-pine text-cream" : "bg-cream-deep text-muted"
                  }`}
                >
                  {done ? "✓" : i + 1}
                </span>
                <span className="flex-1 text-ink">{label}</span>
                {manual && (
                  <span className="rounded-full bg-gold-soft px-2 py-0.5 text-[11px] font-semibold text-ink">
                    manual gate
                  </span>
                )}
              </li>
            );
          })}
        </ol>

        {step >= 1 && (
          <div className="mt-4 border-t border-line pt-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted">
              USCIS template export
            </div>
            <p className="mt-1 text-xs text-muted">
              USCIS requires a separate file per petitioner entity, up to 250 rows
              each. Columns match the USCIS bulk-upload template.
            </p>
            <div className="mt-3 space-y-2">
              {campaign.entities.map((e) => {
                const n = batchRegs.filter((r) => r.entityId === e.id).length;
                if (n === 0) return null;
                return (
                  <div
                    key={e.id}
                    className="flex items-center justify-between rounded-xl border border-line bg-cream/60 px-3 py-2"
                  >
                    <div className="text-sm">
                      <span className="font-medium text-ink">{e.name}</span>
                      <span className="text-muted">
                        {" "}
                        · EIN {e.ein} · {n} rows
                      </span>
                    </div>
                    <Button variant="outline" onClick={() => exportEntity(e.id, e.name)}>
                      Export CSV
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      {confirmed + selected > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-bold text-ink">Confirmations captured</h3>
          <p className="mt-1 text-sm text-muted">
            {confirmed + selected} confirmation numbers captured to the audit
            trail.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {selected === 0 ? (
              <Button
                variant="outline"
                onClick={() => dispatch({ type: "MARK_SELECTED", campaignId: campaign.id })}
              >
                Simulate selection results
              </Button>
            ) : (
              <div className="rounded-xl bg-gold-soft px-4 py-3 text-sm text-ink">
                <span className="font-semibold">{selected} selected.</span> Their
                wage level, SOC, and worksite are captured and ready to carry into
                the I-129 petition (out of scope here, but the data is staged).
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
