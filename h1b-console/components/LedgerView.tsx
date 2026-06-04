"use client";

import { Registration } from "@/lib/types";
import { ledgerOf } from "@/lib/engine";

export function LedgerView({ reg }: { reg: Registration }) {
  const ledger = ledgerOf(reg);
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-card">
      {ledger.map((c) => (
        <div
          key={c.key}
          className="flex items-center justify-between border-b border-line/60 px-4 py-2.5 text-sm last:border-0"
        >
          <div className="flex items-center gap-2">
            <StateDot state={c.state} />
            <span className="font-medium text-ink">{c.label}</span>
          </div>
          <div className="text-right">
            <div className="text-ink">{c.value}</div>
            <div className="text-[11px] text-muted">{c.source}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function StateDot({ state }: { state: "ok" | "pending" | "flag" }) {
  if (state === "ok") return <span className="text-pine">✓</span>;
  if (state === "flag") return <span className="text-danger">!</span>;
  return <span className="text-muted">○</span>;
}
