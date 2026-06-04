"use client";

import { Registration } from "@/lib/types";
import { funnelOf, Funnel as FunnelData } from "@/lib/engine";
import { useStore } from "@/lib/store";

const TILES: { key: string; label: string; pick: (f: FunnelData) => number }[] = [
  { key: "all", label: "All", pick: (f) => f.total },
  { key: "ready", label: "Ready", pick: (f) => f.ready },
  { key: "needs_fix", label: "Missing data", pick: (f) => f.needsFix },
  { key: "needs_attorney", label: "Needs attorney", pick: (f) => f.needsAttorney },
  {
    key: "approved",
    label: "Approved",
    pick: (f) => f.approved + f.submitted + f.confirmed + f.selected,
  },
];

export function FunnelView({
  f,
  active,
  onPick,
}: {
  f: FunnelData;
  active?: string;
  onPick?: (key: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
      {TILES.map((t) => {
        const isActive = active === t.key;
        const cls = `rounded-2xl border p-4 text-left transition-colors ${
          isActive
            ? "border-pine bg-pine text-cream"
            : "border-line bg-card" + (onPick ? " hover:bg-sage-soft" : "")
        }`;
        const inner = (
          <>
            <div className="text-3xl font-bold">{t.pick(f)}</div>
            <div className={`text-sm ${isActive ? "text-cream/80" : "text-muted"}`}>
              {t.label}
            </div>
          </>
        );
        return onPick ? (
          <button key={t.key} onClick={() => onPick(t.key)} className={cls}>
            {inner}
          </button>
        ) : (
          <div key={t.key} className={cls}>
            {inner}
          </div>
        );
      })}
    </div>
  );
}

export function Funnel({ regs }: { regs: Registration[] }) {
  const { state, dispatch } = useStore();
  const f = funnelOf(regs);
  return (
    <FunnelView
      f={f}
      active={state.filter}
      onPick={(key) => dispatch({ type: "SET_FILTER", filter: key })}
    />
  );
}
