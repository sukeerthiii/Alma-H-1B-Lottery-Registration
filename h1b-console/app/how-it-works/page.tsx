"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { AppShell } from "@/components/AppShell";
import { Button, Card, Eyebrow, StatusBadge } from "@/components/ui";
import { FunnelView } from "@/components/Funnel";
import { LedgerView } from "@/components/LedgerView";
import { WageDial } from "@/components/WageDial";
import { seedCampaigns } from "@/lib/data";
import { funnelOf, readinessPct, fmtMoney } from "@/lib/engine";

const nw = seedCampaigns().find((c) => c.id === "northwind-fy2027")!;
const f = funnelOf(nw.registrations);
const pct = readinessPct(nw.registrations);
const priya = nw.registrations.find((r) => r.givenName === "Priya")!;
const rows = [...nw.registrations]
  .sort((a, b) => a.familyName.localeCompare(b.familyName))
  .slice(0, 4);

function Tag({ kind }: { kind: "auto" | "assist" | "manual" }) {
  const map = {
    auto: { label: "Automated", cls: "bg-sage text-pine-deep" },
    assist: { label: "AI-assisted", cls: "bg-gold-soft text-ink" },
    manual: { label: "Manual", cls: "bg-cream-deep text-ink" },
  }[kind];
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${map.cls}`}>
      {map.label}
    </span>
  );
}

function Step({
  n,
  title,
  instruction,
  children,
  read,
  tags,
}: {
  n: number;
  title: string;
  instruction: ReactNode;
  children: ReactNode;
  read?: ReactNode;
  tags?: ReactNode;
}) {
  return (
    <section className="border-t border-line pt-10">
      <Eyebrow>Step {n}</Eyebrow>
      <h2 className="mt-1 text-2xl font-bold text-ink">{title}</h2>
      <p className="mt-2 max-w-2xl text-muted">{instruction}</p>
      <div className="mt-5 rounded-2xl border border-line bg-cream-deep/30 p-4 md:p-6">
        {children}
      </div>
      {read && (
        <div className="mt-3 rounded-xl border border-line bg-card p-4 text-sm text-ink">
          {read}
        </div>
      )}
      {tags && <div className="mt-3 flex flex-wrap gap-2">{tags}</div>}
    </section>
  );
}

function Flow() {
  const Box = ({
    children,
    tone,
  }: {
    children: ReactNode;
    tone?: "sage";
  }) => (
    <div
      className={`rounded-xl border p-3 text-center text-sm ${
        tone === "sage" ? "border-pine/30 bg-sage" : "border-line bg-card"
      }`}
    >
      {children}
    </div>
  );
  const Arrow = () => <div className="text-center text-lg text-muted">↓</div>;
  return (
    <div className="mx-auto max-w-md space-y-1">
      <div className="grid grid-cols-3 gap-2">
        <Box>Beneficiary · passport</Box>
        <Box>Client HR · roster, wage</Box>
        <Box>Alma case graph</Box>
      </div>
      <Arrow />
      <Box>
        <span className="font-semibold text-ink">
          Alma collects and structures the data
        </span>
        <div className="text-xs text-muted">
          intake · normalization · provenance — the backend, upstream of this board
        </div>
      </Box>
      <Arrow />
      <Box tone="sage">
        <span className="font-semibold text-pine-deep">
          This board · Readiness and Control
        </span>
        <div className="text-xs text-pine-deep/80">
          validate · dedup · determine · approve by exception
        </div>
      </Box>
      <Arrow />
      <Box>
        <span className="font-semibold text-ink">USCIS window</span>
        <div className="text-xs text-muted">upload · G-28 signature · pay · confirm</div>
      </Box>
    </div>
  );
}

export default function HowItWorksPage() {
  return (
    <AppShell>
      <main className="mx-auto max-w-[860px] px-6 py-10">
        <Eyebrow>How this works</Eyebrow>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-ink">
          A guided tour of the H-1B console
        </h1>
        <p className="mt-3 max-w-2xl text-muted">
          An overview of what an attorney sees, how to read each screen, and what
          is automated behind it.
        </p>
        <div className="mt-5">
          <Link href="/">
            <Button>Open the console</Button>
          </Link>
        </div>

        {/* Big picture / backend */}
        <section className="mt-10 border-t border-line pt-10">
          <Eyebrow>The big picture</Eyebrow>
          <h2 className="mt-1 text-2xl font-bold text-ink">
            Where this layer sits in the H-1B lottery registration
          </h2>
          <p className="mt-2 max-w-2xl text-muted">
            What you click through is the attorney&apos;s control surface. Behind it,
            Alma already collected and structured the data, and runs validation,
            deduplication, and determination support. The board only surfaces what
            needs a human.
          </p>
          <div className="mt-5 rounded-2xl border border-line bg-cream-deep/30 p-4 md:p-6">
            <Flow />
          </div>
        </section>

        <div className="mt-10 space-y-10">
          <Step
            n={1}
            title="Campaigns"
            instruction="You land here. Each card is one client's H-1B campaign for the year. The percentage is readiness, computed automatically from validation and deduplication during the months-long ramp before USCIS opens."
            read={
              <>
                <span className="font-semibold">How to read it:</span> the bar and
                percentage show how much of the campaign is ready to submit. The
                chips show how many need a fix or attorney judgment. Click a card to
                open that campaign.
              </>
            }
            tags={<Tag kind="auto" />}
          >
            <Link href={`/campaign/${nw.id}`} className="block max-w-md">
              <Card className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-ink">{nw.client}</h3>
                    </div>
                    <p className="text-sm text-muted">{nw.fiscalYear} · closes Mar 19</p>
                  </div>
                  <span className="text-2xl font-bold text-pine">{pct}%</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                  <span className="rounded-full bg-gold-soft px-2.5 py-1 text-ink">
                    {f.needsFix} missing data
                  </span>
                  <span className="rounded-full bg-danger-soft px-2.5 py-1 text-danger">
                    {f.needsAttorney} attorney
                  </span>
                </div>
              </Card>
            </Link>
          </Step>

          <Step
            n={2}
            title="Inside a campaign"
            instruction="Click Northwind Robotics. Every beneficiary is automatically sorted into ready, missing data, or needs attorney. Click a funnel tile to filter the table to that group."
            read={
              <>
                <span className="font-semibold">How to read it:</span> the funnel is
                your worklist triage. The big number on the left, Ready, is the clean
                set you can approve in one action. The table is the rows behind it.
              </>
            }
            tags={<Tag kind="auto" />}
          >
            <FunnelView f={f} active="needs_attorney" />
            <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-xs uppercase tracking-wide text-muted">
                    <th className="px-4 py-3 font-semibold">Beneficiary</th>
                    <th className="px-4 py-3 font-semibold">SOC</th>
                    <th className="px-4 py-3 font-semibold">Wage</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-b border-line/60 last:border-0">
                      <td className="px-4 py-3 font-medium text-ink">
                        {r.familyName}, {r.givenName}
                      </td>
                      <td className="px-4 py-3 text-muted">{r.determination.socCode}</td>
                      <td className="px-4 py-3 text-muted">
                        Lvl{" "}
                        {r.determination.confirmedLevel ?? r.determination.suggestedLevel}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={r.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Step>

          <Step
            n={3}
            title="A beneficiary: the readiness ledger"
            instruction="Click any beneficiary to open their detail. The readiness ledger is the heart of it: one row per check, each with where the data came from."
            read={
              <>
                <span className="font-semibold">How to read it:</span> a check mark is
                passed, a circle is pending a human, an exclamation is a flag. The
                right column is the source. Identity, biographic, SOC, and duplicate
                are checked automatically. Wage level is AI-assisted and waits for the
                attorney. The G-28 signature is the client&apos;s manual step.
              </>
            }
            tags={
              <>
                <Tag kind="auto" />
                <Tag kind="assist" />
                <Tag kind="manual" />
              </>
            }
          >
            <div className="max-w-md">
              <LedgerView reg={priya} />
            </div>
          </Step>

          <Step
            n={4}
            title="The cross-client duplicate check"
            instruction="If the same passport appears elsewhere in the firm, it is flagged. Only Alma can see this, because the data sits in one graph. A single employer or USCIS cannot."
            read={
              <>
                <span className="font-semibold">How to read it:</span> the other client
                is redacted behind an ethical wall. The attorney decides: a bona fide
                separate offer is allowed, anything unclear is escalated to conflicts.
                Detection is automated, the judgment is human.
              </>
            }
            tags={
              <>
                <Tag kind="auto" />
                <Tag kind="manual" />
              </>
            }
          >
            <div className="max-w-md rounded-xl border border-danger/30 bg-danger-soft/50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-danger">
                Cross-client duplicate
              </div>
              <p className="mt-1 text-sm text-ink">{priya.duplicate?.message}</p>
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
                <Button variant="primary">Confirm separate offer</Button>
                <Button variant="outline">Escalate to conflicts</Button>
              </div>
            </div>
          </Step>

          <Step
            n={5}
            title="The wage-level odds dial"
            instruction="Wage level is the one field that changes lottery odds, because selection is now wage-weighted. The dial shows the entries each level earns and what the offered wage supports."
            read={
              <>
                <span className="font-semibold">How to read it:</span> each tile is a
                level with its lottery entries (1x to 4x). Greyed tiles need a higher
                offer. The two-sided call: a higher level raises odds and commits the
                employer to that wage on the LCA and I-129. The AI suggests, the
                attorney confirms.
              </>
            }
            tags={<Tag kind="assist" />}
          >
            <div className="max-w-md">
              <WageDial det={priya.determination} onConfirm={() => {}} />
              <p className="mt-2 text-xs text-muted">
                Read-only preview. In the console, selecting a level confirms it.
              </p>
            </div>
          </Step>

          <Step
            n={6}
            title="Approve by exception"
            instruction="Once the exceptions are cleared, the clean set is approved in a single action. The attorney trusts the checks rather than eyeballing hundreds of rows."
            read={
              <>
                <span className="font-semibold">How to read it:</span> the count is
                every registration that passed all automated checks. One click moves
                them all to approved. The exceptions are the only thing a human spends
                time on.
              </>
            }
            tags={
              <>
                <Tag kind="auto" />
                <Tag kind="manual" />
              </>
            }
          >
            <Button>Approve clean set ({f.ready})</Button>
          </Step>

          <Step
            n={7}
            title="The window opens"
            instruction="In March the toggle flips to Window open and the board switches to submission. Alma generates the exact USCIS template, then the human gates happen."
            read={
              <>
                <span className="font-semibold">How to read it:</span> template
                generation and confirmation capture are automated. The G-28 signature
                and the payment are deliberately manual, because they are legally
                accountable and irreversible.
              </>
            }
            tags={
              <>
                <Tag kind="auto" />
                <Tag kind="manual" />
              </>
            }
          >
            <ol className="max-w-md space-y-2">
              {[
                ["Generate USCIS template (batches of 250)", "auto"],
                ["Upload template to USCIS", "auto"],
                ["G-28 signed by client administrator", "manual"],
                ["Authorize payment and submit", "manual"],
              ].map(([label, kind], i) => (
                <li
                  key={label}
                  className="flex items-center gap-3 rounded-xl border border-line bg-card px-4 py-3 text-sm"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cream-deep text-xs font-bold text-muted">
                    {i + 1}
                  </span>
                  <span className="flex-1 text-ink">{label}</span>
                  <Tag kind={kind as "auto" | "manual"} />
                </li>
              ))}
            </ol>
            <p className="mt-3 max-w-md text-sm text-muted">
              Fee total for the clean set: {fmtMoney(f.ready * 215)}, non-refundable.
              After payment, confirmation numbers are captured to the audit log.
            </p>
          </Step>
        </div>

        {/* Summary */}
        <section className="mt-12 border-t border-line pt-10">
          <Eyebrow>In one view</Eyebrow>
          <h2 className="mt-1 text-2xl font-bold text-ink">
            What is automated, assisted, and kept manual
          </h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <Card className="p-5">
              <Tag kind="auto" />
              <ul className="mt-3 space-y-1 text-sm text-muted">
                <li>Intake and normalization</li>
                <li>Validation and triage</li>
                <li>Duplicate detection</li>
                <li>USCIS template generation</li>
                <li>Status and audit capture</li>
              </ul>
            </Card>
            <Card className="p-5">
              <Tag kind="assist" />
              <ul className="mt-3 space-y-1 text-sm text-muted">
                <li>SOC and wage-level suggestions</li>
                <li>Master&apos;s exemption flag</li>
                <li>Duplicate resolution</li>
              </ul>
            </Card>
            <Card className="p-5">
              <Tag kind="manual" />
              <ul className="mt-3 space-y-1 text-sm text-muted">
                <li>Final approval</li>
                <li>Ambiguous calls</li>
                <li>G-28 signature</li>
                <li>Payment authorization</li>
              </ul>
            </Card>
          </div>
          <div className="mt-6">
            <Link href="/">
              <Button>Open the console</Button>
            </Link>
          </div>
        </section>
      </main>
    </AppShell>
  );
}
