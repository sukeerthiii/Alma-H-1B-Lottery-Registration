"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Funnel } from "@/components/Funnel";
import { BeneficiaryTable } from "@/components/BeneficiaryTable";
import { TriageDrawer } from "@/components/TriageDrawer";
import { BatchMonitor } from "@/components/BatchMonitor";
import { AuditPanel } from "@/components/AuditPanel";
import { Button, Eyebrow } from "@/components/ui";
import { useStore } from "@/lib/store";
import { funnelOf } from "@/lib/engine";

const FILTER_LABELS: Record<string, string> = {
  ready: "Ready",
  needs_fix: "Missing data",
  needs_attorney: "Needs attorney",
  approved: "Approved",
};

export default function CampaignPage() {
  const params = useParams();
  const id = String(params.id);
  const { state, dispatch } = useStore();
  const [auditOpen, setAuditOpen] = useState(false);
  const [entityFilter, setEntityFilter] = useState("all");

  const campaign = state.campaigns.find((c) => c.id === id);

  if (!campaign) {
    return (
      <AppShell>
        <main className="mx-auto max-w-[1180px] px-6 py-16 text-center">
          <p className="text-muted">Campaign not found.</p>
          <Link href="/" className="text-pine underline">
            Back to campaigns
          </Link>
        </main>
      </AppShell>
    );
  }

  const f = funnelOf(campaign.registrations);
  const phase = state.phase;

  return (
    <AppShell>
      <main className="mx-auto max-w-[1180px] px-6 py-8">
        <div className="flex items-start justify-between">
          <div>
            <Link href="/" className="text-sm text-muted hover:text-pine">
              ← Campaigns
            </Link>
            <Eyebrow>{campaign.fiscalYear} · H-1B lottery</Eyebrow>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-ink">
              {campaign.client}
            </h1>
            <p className="text-sm text-muted">
              {campaign.entities.length} petitioner{" "}
              {campaign.entities.length > 1 ? "entities" : "entity"} ·{" "}
              {campaign.registrations.length} beneficiaries
            </p>
          </div>
          <Button variant="outline" onClick={() => setAuditOpen(true)}>
            Audit log
          </Button>
        </div>

        <div className="mt-6">
          <Funnel regs={campaign.registrations} />
          <p className="mt-2 text-xs text-muted">
            Click any tile to filter the list below.
          </p>
        </div>

        {phase === "prepare" ? (
          <>
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-muted">
                Clear the exceptions, then approve the clean set in one action.
              </p>
              <Button
                disabled={f.ready === 0}
                onClick={() => dispatch({ type: "BULK_APPROVE", campaignId: campaign.id })}
              >
                Approve clean set ({f.ready})
              </Button>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {campaign.entities.length > 1 && (
                <select
                  value={entityFilter}
                  onChange={(e) => setEntityFilter(e.target.value)}
                  className="rounded-full border border-line bg-card px-3 py-1.5 text-sm text-ink outline-none focus:border-pine"
                >
                  <option value="all">All entities</option>
                  {campaign.entities.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </select>
              )}
              {state.filter !== "all" && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted">Filtered to</span>
                  <span className="rounded-full bg-pine px-2.5 py-0.5 text-xs font-semibold text-cream">
                    {FILTER_LABELS[state.filter] ?? state.filter}
                  </span>
                  <button
                    onClick={() => dispatch({ type: "SET_FILTER", filter: "all" })}
                    className="text-xs font-semibold text-pine underline"
                  >
                    clear
                  </button>
                </div>
              )}
            </div>
            <div className="mt-4">
              <BeneficiaryTable campaign={campaign} entityFilter={entityFilter} />
            </div>
          </>
        ) : (
          <div className="mt-6">
            <BatchMonitor campaign={campaign} />
          </div>
        )}

        {state.selectedRegId && <TriageDrawer campaign={campaign} />}
      </main>

      {auditOpen && (
        <AuditPanel campaignId={campaign.id} onClose={() => setAuditOpen(false)} />
      )}
    </AppShell>
  );
}
