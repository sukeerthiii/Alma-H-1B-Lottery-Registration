"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";

const NAV = [
  { href: "/", label: "Campaigns" },
  { href: "/all", label: "All beneficiaries" },
  { href: "/how-it-works", label: "How this works" },
];

function PhaseToggle({ compact }: { compact?: boolean }) {
  const { state, dispatch } = useStore();
  const phase = state.phase;
  return (
    <div
      className={`flex gap-1 rounded-full border border-line bg-card p-1 text-xs ${
        compact ? "" : "w-full"
      }`}
    >
      {(["prepare", "window"] as const).map((p) => (
        <button
          key={p}
          onClick={() => dispatch({ type: "SET_PHASE", phase: p })}
          className={`rounded-full px-3 py-1 font-semibold capitalize ${
            compact ? "" : "flex-1"
          } ${phase === p ? "bg-pine text-cream" : "text-muted"}`}
        >
          {p === "window" ? "Window" : "Prepare"}
        </button>
      ))}
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { state, dispatch } = useStore();
  const phase = state.phase;
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <div className="flex min-h-full">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-line bg-cream-deep/40 px-4 py-6 md:flex">
        <Link href="/" className="px-2">
          <div className="text-2xl font-bold lowercase text-pine">alma</div>
          <div className="text-xs text-muted">H-1B registration</div>
        </Link>

        <nav className="mt-8 space-y-1">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`block rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                isActive(n.href)
                  ? "bg-pine text-cream"
                  : "text-ink hover:bg-sage-soft"
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="mt-8 px-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted">
            Phase
          </div>
          <div className="mt-2">
            <PhaseToggle />
          </div>
          <p className="mt-2 px-1 text-xs text-muted">
            {phase === "prepare"
              ? "9 days to window · opens Mar 4"
              : "Window open · closes Mar 19"}
          </p>
        </div>

        <div className="mt-auto px-1">
          <button
            onClick={() => dispatch({ type: "RESET" })}
            className="mb-3 text-xs font-semibold text-muted hover:text-pine"
          >
            Reset demo
          </button>
          <div className="flex items-center gap-2 rounded-xl border border-line bg-card px-3 py-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-pine text-xs font-bold text-cream">
              SA
            </span>
            <div className="text-xs">
              <div className="font-semibold text-ink">Sukeerthi Adi</div>
              <div className="text-muted">Attorney</div>
            </div>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="flex items-center justify-between border-b border-line px-5 py-3 md:hidden">
          <Link href="/" className="text-xl font-bold lowercase text-pine">
            alma
          </Link>
          <PhaseToggle compact />
        </header>
        {children}
      </div>
    </div>
  );
}
