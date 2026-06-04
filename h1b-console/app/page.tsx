"use client";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Bar, Button, Card, Eyebrow } from "@/components/ui";
import { useStore } from "@/lib/store";
import { funnelOf, readinessPct } from "@/lib/engine";

export default function PortfolioPage() {
  const { state } = useStore();
  const campaigns = state.campaigns;

  const all = campaigns.flatMap((c) => c.registrations);
  const firm = funnelOf(all);
  const exceptions = firm.needsFix + firm.needsAttorney;

  return (
    <AppShell>
      <main className="mx-auto max-w-[1180px] px-6 py-10">
        <div className="flex items-start justify-between">
          <div>
            <Eyebrow>FY2027 H-1B lottery</Eyebrow>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-ink">
              Campaigns
            </h1>
          </div>
          <Link href="/how-it-works">
            <Button variant="outline">How this works</Button>
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <Stat label="Beneficiaries" value={firm.total} href="/all?view=all" />
          <Stat label="Ready" value={firm.ready} tone="text-pine" href="/all?view=ready" />
          <Stat
            label="Exceptions"
            value={exceptions}
            tone="text-danger"
            href="/all?view=exceptions"
          />
          <Stat label="Days to window" value={9} />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {campaigns.map((c) => {
            const f = funnelOf(c.registrations);
            const pct = readinessPct(c.registrations);
            const card = (
              <Card
                key={c.id}
                className="group p-6 transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-ink">{c.client}</h2>
                    </div>
                    <p className="text-sm text-muted">
                      {c.fiscalYear} · closes Mar 19
                    </p>
                  </div>
                  <span className="text-2xl font-bold text-pine">{pct}%</span>
                </div>

                <div className="mt-4">
                  <Bar pct={pct} />
                  <p className="mt-2 text-sm text-muted">
                    {f.ready} ready of {f.total}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                  <Chip label={`${f.needsFix} missing data`} tone="gold" />
                  <Chip label={`${f.needsAttorney} attorney`} tone="danger" />
                </div>
              </Card>
            );
            return (
              <Link key={c.id} href={`/campaign/${c.id}`}>
                {card}
              </Link>
            );
          })}
        </div>
      </main>
    </AppShell>
  );
}

function Stat({
  label,
  value,
  tone = "text-ink",
  href,
}: {
  label: string;
  value: number;
  tone?: string;
  href?: string;
}) {
  const card = (
    <Card className={`p-4 ${href ? "transition-shadow hover:shadow-md" : ""}`}>
      <div className={`text-3xl font-bold ${tone}`}>{value}</div>
      <div className="text-sm text-muted">{label}</div>
    </Card>
  );
  return href ? <Link href={href}>{card}</Link> : card;
}

function Chip({ label, tone }: { label: string; tone: "gold" | "danger" }) {
  const cls =
    tone === "gold" ? "bg-gold-soft text-ink" : "bg-danger-soft text-danger";
  return <span className={`rounded-full px-2.5 py-1 ${cls}`}>{label}</span>;
}
