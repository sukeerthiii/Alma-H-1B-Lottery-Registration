"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Eyebrow, StatusBadge } from "@/components/ui";
import { useStore } from "@/lib/store";
import { bucketOf } from "@/lib/engine";

const VIEWS = [
  { key: "all", label: "All beneficiaries" },
  { key: "ready", label: "Ready" },
  { key: "exceptions", label: "Exceptions" },
];

function AllInner() {
  const params = useSearchParams();
  const router = useRouter();
  const { state, dispatch } = useStore();
  const [view, setView] = useState(params.get("view") ?? "all");

  const rows = state.campaigns
    .flatMap((c) =>
      c.registrations.map((r) => ({ r, client: c.client, campaignId: c.id }))
    )
    .filter(({ r }) => {
      if (view === "ready") return r.status === "ready";
      if (view === "exceptions") {
        const b = bucketOf(r.status);
        return b === "needs_fix" || b === "needs_attorney";
      }
      return true;
    })
    .sort((a, b) => a.r.familyName.localeCompare(b.r.familyName));

  const open = (campaignId: string, regId: string) => {
    dispatch({ type: "OPEN_DRAWER", regId });
    router.push(`/campaign/${campaignId}`);
  };

  return (
    <main className="mx-auto max-w-[1180px] px-6 py-8">
      <Link href="/" className="text-sm text-muted hover:text-pine">
        ← Campaigns
      </Link>
      <Eyebrow>Across all clients</Eyebrow>
      <h1 className="mt-1 text-3xl font-bold tracking-tight text-ink">
        All beneficiaries
      </h1>
      <p className="text-sm text-muted">
        Every beneficiary across every client campaign, in one table.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {VIEWS.map((v) => (
          <button
            key={v.key}
            onClick={() => setView(v.key)}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
              view === v.key
                ? "bg-pine text-cream"
                : "border border-line bg-card text-muted hover:bg-sage-soft"
            }`}
          >
            {v.label}
          </button>
        ))}
        <span className="ml-auto self-center text-sm text-muted">
          {rows.length} shown
        </span>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-card">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-semibold">Beneficiary</th>
              <th className="px-4 py-3 font-semibold">Client</th>
              <th className="px-4 py-3 font-semibold">SOC</th>
              <th className="px-4 py-3 font-semibold">Wage</th>
              <th className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 100).map(({ r, client, campaignId }) => (
              <tr
                key={r.id}
                onClick={() => open(campaignId, r.id)}
                className="cursor-pointer border-b border-line/60 last:border-0 hover:bg-sage-soft/60"
              >
                <td className="px-4 py-3 font-medium text-ink">
                  {r.familyName}, {r.givenName}
                </td>
                <td className="px-4 py-3 text-muted">{client}</td>
                <td className="px-4 py-3 text-muted">{r.determination.socCode}</td>
                <td className="px-4 py-3 text-muted">
                  Lvl {r.determination.confirmedLevel ?? r.determination.suggestedLevel}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={r.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted">
        {rows.length > 100 ? `Showing first 100 of ${rows.length}. ` : ""}
        Click a row to open that beneficiary in their campaign.
      </p>
    </main>
  );
}

export default function AllPage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="px-6 py-8 text-muted">Loading…</div>}>
        <AllInner />
      </Suspense>
    </AppShell>
  );
}
