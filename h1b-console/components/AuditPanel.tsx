"use client";

import { useStore } from "@/lib/store";

export function AuditPanel({
  onClose,
  campaignId,
}: {
  onClose: () => void;
  campaignId: string;
}) {
  const { state } = useStore();
  const events = state.audit.filter((e) => e.campaignId === campaignId);
  return (
    <>
      <div className="fixed inset-0 z-40 bg-pine-deep/20" onClick={onClose} />
      <aside className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[380px] flex-col overflow-y-auto border-l border-line bg-cream shadow-xl">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-ink">Audit log</h2>
            <p className="text-xs text-muted">Every action, who and when</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full px-2 text-2xl leading-none text-muted hover:text-pine"
          >
            ×
          </button>
        </div>
        <div className="space-y-2 px-5 py-4">
          {events.length === 0 && (
            <p className="text-sm text-muted">
              No actions yet for this campaign. Resolve an exception or approve the
              clean set and it will appear here.
            </p>
          )}
          {events.map((ev) => (
            <div
              key={ev.id}
              className="rounded-xl border border-line bg-card p-3 text-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-ink">{ev.action}</span>
                <span className="text-xs text-muted">{ev.ts}</span>
              </div>
              <p className="mt-0.5 text-muted">{ev.detail}</p>
              <p className="mt-1 text-[11px] text-muted">{ev.actor}</p>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}
