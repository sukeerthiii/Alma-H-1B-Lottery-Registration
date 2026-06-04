"use client";

import { RegistrationStatus } from "@/lib/types";
import { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-line bg-card shadow-[0_1px_2px_rgba(35,58,46,0.04)] ${className}`}
    >
      {children}
    </div>
  );
}

type BtnVariant = "primary" | "outline" | "ghost" | "danger";

export function Button({
  children,
  onClick,
  variant = "primary",
  disabled,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: BtnVariant;
  disabled?: boolean;
  className?: string;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed";
  const styles: Record<BtnVariant, string> = {
    primary: "bg-pine text-cream hover:bg-pine-deep",
    outline: "border border-pine/30 text-pine hover:bg-sage-soft",
    ghost: "text-pine hover:bg-sage-soft",
    danger: "bg-danger text-white hover:opacity-90",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

const STATUS_META: Record<
  RegistrationStatus,
  { label: string; cls: string }
> = {
  ready: { label: "Ready", cls: "bg-sage text-pine-deep" },
  missing_data: { label: "Missing data", cls: "bg-gold-soft text-ink" },
  validation_issue: { label: "Validation", cls: "bg-gold-soft text-ink" },
  duplicate_risk: { label: "Duplicate risk", cls: "bg-danger-soft text-danger" },
  needs_attorney: { label: "Needs attorney", cls: "bg-danger-soft text-danger" },
  approved: { label: "Approved", cls: "bg-pine text-cream" },
  pending_signature: { label: "Pending signature", cls: "bg-gold-soft text-ink" },
  ready_to_submit: { label: "Ready to submit", cls: "bg-pine text-cream" },
  submitted: { label: "Submitted", cls: "bg-pine text-cream" },
  confirmed: { label: "Confirmed", cls: "bg-sage text-pine-deep" },
  selected: { label: "Selected", cls: "bg-gold text-ink" },
};

export function StatusBadge({ status }: { status: RegistrationStatus }) {
  const m = STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${m.cls}`}
    >
      {m.label}
    </span>
  );
}

export function Bar({ pct, tone = "pine" }: { pct: number; tone?: string }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-cream-deep">
      <div
        className={`h-full rounded-full bg-${tone}`}
        style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
      />
    </div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
      <span className="h-1.5 w-1.5 rounded-full bg-pine" />
      {children}
    </div>
  );
}
