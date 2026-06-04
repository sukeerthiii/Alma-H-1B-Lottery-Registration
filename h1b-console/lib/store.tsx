"use client";

import {
  createContext,
  useContext,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";
import { seedCampaigns } from "./data";
import { recomputeStatus } from "./engine";
import {
  AuditEvent,
  Campaign,
  Determination,
  Phase,
  Registration,
  WageLevel,
} from "./types";

interface State {
  campaigns: Campaign[];
  phase: Phase;
  selectedRegId: string | null;
  filter: string;
  batchStep: Record<string, number>;
  audit: AuditEvent[];
}

type Action =
  | { type: "RESET" }
  | { type: "SET_PHASE"; phase: Phase }
  | { type: "OPEN_DRAWER"; regId: string }
  | { type: "CLOSE_DRAWER" }
  | { type: "SET_FILTER"; filter: string }
  | { type: "CONFIRM_WAGE"; campaignId: string; regId: string; level: WageLevel }
  | {
      type: "RESOLVE_DUP";
      campaignId: string;
      regId: string;
      resolution: "bona_fide" | "escalated";
    }
  | {
      type: "APPLY_EDITS";
      campaignId: string;
      regId: string;
      patch: Partial<Registration>;
      detPatch?: Partial<Determination>;
    }
  | { type: "BULK_APPROVE"; campaignId: string }
  | { type: "ADVANCE_BATCH"; campaignId: string }
  | { type: "MARK_SELECTED"; campaignId: string };

function initial(): State {
  return {
    campaigns: seedCampaigns(),
    phase: "prepare",
    selectedRegId: null,
    filter: "all",
    batchStep: {},
    audit: [],
  };
}

function logEvent(
  audit: AuditEvent[],
  campaignId: string,
  action: string,
  detail: string
) {
  const ev: AuditEvent = {
    id: `ev-${audit.length + 1}`,
    campaignId,
    ts: new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    actor: "Sukeerthi Adi (attorney)",
    action,
    detail,
  };
  return [ev, ...audit];
}

function mapReg(
  campaigns: Campaign[],
  campaignId: string,
  regId: string,
  fn: (r: Registration) => Registration
): Campaign[] {
  return campaigns.map((c) =>
    c.id !== campaignId
      ? c
      : {
          ...c,
          registrations: c.registrations.map((r) =>
            r.id === regId ? fn(r) : r
          ),
        }
  );
}

function nameOf(campaigns: Campaign[], campaignId: string, regId: string) {
  const c = campaigns.find((x) => x.id === campaignId);
  const r = c?.registrations.find((x) => x.id === regId);
  return r ? `${r.givenName} ${r.familyName}` : regId;
}

function confNumber(regId: string): string {
  let h = 0;
  for (let i = 0; i < regId.length; i++) h = (h * 31 + regId.charCodeAt(i)) >>> 0;
  return `2027-${(h % 9000 + 1000).toString()}-${(h % 9000).toString(16)}`;
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "RESET":
      return initial();
    case "SET_PHASE":
      return { ...state, phase: action.phase };
    case "OPEN_DRAWER":
      return { ...state, selectedRegId: action.regId };
    case "CLOSE_DRAWER":
      return { ...state, selectedRegId: null };
    case "SET_FILTER":
      return { ...state, filter: action.filter };
    case "CONFIRM_WAGE": {
      const campaigns = mapReg(
        state.campaigns,
        action.campaignId,
        action.regId,
        (r) => {
          const det = { ...r.determination, confirmedLevel: action.level };
          const next = { ...r, determination: det };
          return { ...next, status: recomputeStatus(next) };
        }
      );
      return {
        ...state,
        campaigns,
        audit: logEvent(
          state.audit,
          action.campaignId,
          "Confirmed wage level",
          `${nameOf(state.campaigns, action.campaignId, action.regId)} set to Level ${action.level}`
        ),
      };
    }
    case "RESOLVE_DUP": {
      const campaigns = mapReg(
        state.campaigns,
        action.campaignId,
        action.regId,
        (r) => {
          if (!r.duplicate) return r;
          const dup = {
            ...r.duplicate,
            resolved: true,
            resolution: action.resolution,
          };
          const next = { ...r, duplicate: dup };
          return { ...next, status: recomputeStatus(next) };
        }
      );
      return {
        ...state,
        campaigns,
        audit: logEvent(
          state.audit,
          action.campaignId,
          action.resolution === "bona_fide"
            ? "Cleared duplicate (bona fide offer)"
            : "Escalated to conflicts review",
          nameOf(state.campaigns, action.campaignId, action.regId)
        ),
      };
    }
    case "APPLY_EDITS": {
      const campaigns = mapReg(
        state.campaigns,
        action.campaignId,
        action.regId,
        (r) => {
          const next = {
            ...r,
            ...action.patch,
            determination: { ...r.determination, ...(action.detPatch ?? {}) },
            missingFields: undefined,
          };
          return { ...next, status: recomputeStatus(next) };
        }
      );
      return {
        ...state,
        campaigns,
        audit: logEvent(
          state.audit,
          action.campaignId,
          "Edited beneficiary data",
          nameOf(state.campaigns, action.campaignId, action.regId)
        ),
      };
    }
    case "BULK_APPROVE": {
      let count = 0;
      const campaigns = state.campaigns.map((c) => {
        if (c.id !== action.campaignId) return c;
        return {
          ...c,
          registrations: c.registrations.map((r) => {
            if (r.status === "ready") {
              count++;
              return { ...r, status: "approved" as const };
            }
            return r;
          }),
        };
      });
      return {
        ...state,
        campaigns,
        audit: logEvent(
          state.audit,
          action.campaignId,
          "Approved clean set",
          `${count} registrations approved by exception`
        ),
      };
    }
    case "ADVANCE_BATCH": {
      const step = (state.batchStep[action.campaignId] ?? 0) + 1;
      let campaigns = state.campaigns;
      let detail = "";
      if (step === 1) detail = "Generated USCIS template (batches of 250)";
      else if (step === 2) detail = "Uploaded template to USCIS";
      else if (step === 3) detail = "G-28 signed by client administrator";
      else if (step === 4) {
        detail = "Payment authorized, registrations submitted";
        campaigns = state.campaigns.map((c) =>
          c.id !== action.campaignId
            ? c
            : {
                ...c,
                registrations: c.registrations.map((r) =>
                  r.status === "approved"
                    ? {
                        ...r,
                        status: "confirmed" as const,
                        confirmationNumber: confNumber(r.id),
                      }
                    : r
                ),
              }
        );
      }
      return {
        ...state,
        campaigns,
        batchStep: { ...state.batchStep, [action.campaignId]: step },
        audit: detail
          ? logEvent(state.audit, action.campaignId, "Batch submission", detail)
          : state.audit,
      };
    }
    case "MARK_SELECTED": {
      let i = 0;
      let count = 0;
      const campaigns = state.campaigns.map((c) => {
        if (c.id !== action.campaignId) return c;
        return {
          ...c,
          registrations: c.registrations.map((r) => {
            if (r.status === "confirmed") {
              i++;
              if (i % 3 === 0) {
                count++;
                return { ...r, status: "selected" as const };
              }
            }
            return r;
          }),
        };
      });
      return {
        ...state,
        campaigns,
        audit: logEvent(
          state.audit,
          action.campaignId,
          "Selection results",
          `${count} beneficiaries selected, data ready to carry to the I-129 petition`
        ),
      };
    }
    default:
      return state;
  }
}

const StoreContext = createContext<{
  state: State;
  dispatch: Dispatch<Action>;
} | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initial);
  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export function useCampaign(id: string) {
  const { state } = useStore();
  return state.campaigns.find((c) => c.id === id) ?? null;
}
