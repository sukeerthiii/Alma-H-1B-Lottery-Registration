# H-1B Attorney Console (prototype)

Interactive prototype of the attorney-facing interface for H-1B cap registration.

Live: https://h1b-console.vercel.app

The data is mock and illustrative. There is no backend; everything runs
client-side, so the prototype is easy to open and click through. The point is the
thinking and the flow, not production code.

## Stack

Next.js (App Router), TypeScript, Tailwind CSS. Deployed on Vercel.

## Where the logic lives

- `lib/` - the mock data (`data.ts`), the readiness engine (`engine.ts`: status, funnel, ledger, and USCIS CSV logic), the types (`types.ts`), and the client state store (`store.tsx`).
- `components/` - the UI: app shell, funnel, beneficiary table, triage drawer, wage dial, ledger view, batch monitor, audit panel.
- `app/` - the routes: portfolio (`/`), all beneficiaries (`/all`), campaign (`/campaign/[id]`), and the guide (`/how-it-works`).
