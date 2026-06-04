"use client";

import { Determination, WageLevel, WAGE_ORDER, WAGE_ENTRIES } from "@/lib/types";
import { fmtMoney, levelForWage } from "@/lib/engine";

export function WageDial({
  det,
  onConfirm,
}: {
  det: Determination;
  onConfirm: (level: WageLevel) => void;
}) {
  const supportedMax = levelForWage(det.offeredWage, det.thresholds);
  const current = det.confirmedLevel ?? det.suggestedLevel;

  return (
    <div>
      <div className="grid grid-cols-4 gap-2">
        {WAGE_ORDER.map((lvl) => {
          const supported = det.offeredWage >= det.thresholds[lvl];
          const isCurrent = lvl === current;
          return (
            <button
              key={lvl}
              disabled={!supported}
              onClick={() => onConfirm(lvl)}
              className={`rounded-xl border p-3 text-center transition-colors ${
                isCurrent
                  ? "border-pine bg-pine text-cream"
                  : supported
                    ? "border-line bg-card hover:bg-sage-soft"
                    : "border-line bg-cream-deep/40 text-muted"
              }`}
            >
              <div className="text-xs font-semibold uppercase tracking-wide opacity-70">
                Level {lvl}
              </div>
              <div className="text-xl font-bold">{WAGE_ENTRIES[lvl]}x</div>
              <div className="text-[11px] opacity-70">
                {fmtMoney(det.thresholds[lvl])}+
              </div>
              {!supported && (
                <div className="mt-1 text-[10px] leading-tight text-muted">
                  needs higher offer
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-3 text-xs text-muted">
        <p>
          Offered wage {fmtMoney(det.offeredWage)} supports up to{" "}
          <span className="font-semibold text-ink">Level {supportedMax}</span> (
          {WAGE_ENTRIES[supportedMax]} lottery entries).
        </p>
      </div>
    </div>
  );
}
