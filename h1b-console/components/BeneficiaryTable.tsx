"use client";

import { Campaign, Registration } from "@/lib/types";
import { StatusBadge } from "./ui";
import { useStore } from "@/lib/store";
import { bucketOf } from "@/lib/engine";

function matches(filter: string, r: Registration): boolean {
  if (filter === "all") return true;
  if (filter === "ready") return r.status === "ready";
  if (filter === "needs_fix") return bucketOf(r.status) === "needs_fix";
  if (filter === "needs_attorney") return bucketOf(r.status) === "needs_attorney";
  if (filter === "approved") return bucketOf(r.status) === "done";
  return true;
}

export function BeneficiaryTable({
  campaign,
  entityFilter = "all",
}: {
  campaign: Campaign;
  entityFilter?: string;
}) {
  const { state, dispatch } = useStore();
  const entityName = (id: string) =>
    campaign.entities.find((e) => e.id === id)?.name ?? id;

  const filtered = [...campaign.registrations]
    .filter((r) => matches(state.filter, r))
    .filter((r) => entityFilter === "all" || r.entityId === entityFilter)
    .sort((a, b) => a.familyName.localeCompare(b.familyName));
  const rows = filtered.slice(0, 60);

  return (
    <div>
      <div className="overflow-hidden rounded-2xl border border-line bg-card">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-line text-xs uppercase tracking-wide text-muted">
            <th className="px-4 py-3 font-semibold">Beneficiary</th>
            <th className="px-4 py-3 font-semibold">Entity</th>
            <th className="px-4 py-3 font-semibold">SOC</th>
            <th className="px-4 py-3 font-semibold">Wage</th>
            <th className="px-4 py-3 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.id}
              onClick={() => dispatch({ type: "OPEN_DRAWER", regId: r.id })}
              className="cursor-pointer border-b border-line/60 last:border-0 hover:bg-sage-soft/60"
            >
              <td className="px-4 py-3 font-medium text-ink">
                {r.familyName}, {r.givenName}
              </td>
              <td className="px-4 py-3 text-muted">{entityName(r.entityId)}</td>
              <td className="px-4 py-3 text-muted">{r.determination.socCode}</td>
              <td className="px-4 py-3 text-muted">
                Lvl {r.determination.confirmedLevel ?? r.determination.suggestedLevel}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={r.status} />
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-muted">
                Nothing in this view.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
      {filtered.length > rows.length && (
        <p className="mt-2 text-xs text-muted">
          Showing first {rows.length} of {filtered.length}.
        </p>
      )}
    </div>
  );
}
