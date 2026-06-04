import {
  Campaign,
  Determination,
  Registration,
  RegistrationStatus,
  WageLevel,
} from "./types";

const THRESHOLDS = { I: 120000, II: 145000, III: 170000, IV: 200000 };

function rng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const GIVEN = [
  "Aarav", "Mei", "Diego", "Fatima", "Yuki", "Omar", "Lucia", "Chen",
  "Ananya", "Tomas", "Sofia", "Hiroshi", "Nadia", "Pablo", "Ingrid", "Rahul",
  "Lin", "Carlos", "Amara", "Viktor", "Elena", "Kenji", "Zara", "Mateo",
  "Priti", "Noah", "Sara", "Ivan", "Leila", "Andre",
];
const FAMILY = [
  "Sharma", "Wang", "Garcia", "Khan", "Tanaka", "Hassan", "Rossi", "Liu",
  "Patel", "Silva", "Marino", "Sato", "Haddad", "Gomez", "Larsson", "Nair",
  "Chen", "Mendez", "Okafor", "Petrov", "Costa", "Ito", "Ali", "Ramirez",
  "Iyer", "Becker", "Haas", "Novak", "Aziz", "Moreau",
];
const COUNTRIES = [
  "India", "China", "Brazil", "Nigeria", "Canada", "Mexico", "Philippines",
  "South Korea", "Germany", "Vietnam", "Pakistan", "Colombia", "Egypt",
  "Spain", "Japan",
];
const CITIES = [
  "Austin, TX", "San Jose, CA", "Seattle, WA", "Denver, CO", "Boston, MA",
  "Chicago, IL", "Atlanta, GA", "Raleigh, NC",
];
const SOCS: [string, string][] = [
  ["15-1252", "Software Developers"],
  ["15-1211", "Computer Systems Analysts"],
  ["15-2051", "Data Scientists"],
  ["17-2061", "Computer Hardware Engineers"],
  ["13-2011", "Accountants and Auditors"],
];
const DEGREES: [string, string][] = [
  ["Bachelor's", "Computer Science"],
  ["Master's", "Computer Science"],
  ["Bachelor's", "Electrical Engineering"],
  ["Master's", "Data Science"],
  ["Bachelor's", "Accounting"],
];

function wageForLevel(level: WageLevel, r: () => number): number {
  const base = THRESHOLDS[level];
  const next =
    level === "IV" ? THRESHOLDS.IV + 40000 : THRESHOLDS[nextLevel(level)];
  return Math.round((base + r() * (next - base - 1000)) / 1000) * 1000;
}

function nextLevel(level: WageLevel): WageLevel {
  return { I: "II", II: "III", III: "IV", IV: "IV" }[level] as WageLevel;
}

function makeDetermination(
  r: () => number,
  opts: Partial<Determination> & { level: WageLevel }
): Determination {
  const soc = SOCS[Math.floor(r() * SOCS.length)];
  const deg = DEGREES[Math.floor(r() * DEGREES.length)];
  const worksite = CITIES[Math.floor(r() * CITIES.length)];
  const offered = opts.offeredWage ?? wageForLevel(opts.level, r);
  return {
    socCode: opts.socCode ?? soc[0],
    socTitle: opts.socTitle ?? soc[1],
    suggestedLevel: opts.level,
    confirmedLevel: opts.confirmedLevel ?? null,
    confidence: opts.confidence ?? 0.8 + r() * 0.18,
    rationale:
      opts.rationale ??
      `Offered wage equals or exceeds the OEWS Level ${opts.level} threshold for this SOC in ${worksite}.`,
    source: opts.source ?? "DOL OEWS, snapshot at registration",
    offeredWage: offered,
    worksite: opts.worksite ?? worksite,
    thresholds: THRESHOLDS,
    minDegree: opts.minDegree ?? deg[0],
    field: opts.field ?? deg[1],
    experienceMonths: opts.experienceMonths ?? Math.floor(r() * 60),
    supervises: opts.supervises ?? 0,
  };
}

function uid(n: number) {
  return `nw-${String(n).padStart(3, "0")}`;
}

const ENTITY_US = "ent-us";
const ENTITY_LABS = "ent-labs";

// Curated hero registrations that the reviewer is meant to open.
function heroes(): Registration[] {
  const r = rng(7);
  return [
    {
      id: uid(1),
      givenName: "Priya",
      familyName: "Nair",
      sex: "Female",
      dob: "1994-04-12",
      countryOfBirth: "India",
      citizenship: "India",
      passportNumber: "AB1234567",
      passportCountry: "India",
      passportExpiry: "2026-10-15",
      mastersUS: false,
      entityId: ENTITY_US,
      status: "duplicate_risk",
      determination: makeDetermination(r, {
        level: "II",
        socCode: "15-1252",
        socTitle: "Software Developers",
        worksite: "Austin, TX",
        offeredWage: 150000,
        confidence: 0.93,
        confirmedLevel: null,
        minDegree: "Bachelor's",
        field: "Computer Science",
        experienceMonths: 24,
        supervises: 0,
      }),
      duplicate: {
        kind: "cross_client",
        message:
          "This passport already exists elsewhere in the firm. A beneficiary may be registered by multiple employers only if each holds a bona fide offer.",
        resolved: false,
      },
    },
    {
      id: uid(2),
      givenName: "Daniel",
      familyName: "Okafor",
      sex: "Male",
      dob: "1991-09-02",
      countryOfBirth: "Nigeria",
      citizenship: "Nigeria",
      passportNumber: "",
      passportCountry: "Nigeria",
      passportExpiry: "2031-03-01",
      mastersUS: true,
      entityId: ENTITY_US,
      status: "missing_data",
      determination: makeDetermination(r, {
        level: "III",
        socCode: "15-2051",
        socTitle: "Data Scientists",
        worksite: "Seattle, WA",
        offeredWage: 178000,
        confirmedLevel: "III",
      }),
      missingFields: ["Passport number"],
    },
    {
      id: uid(3),
      givenName: "Sofia",
      familyName: "Marino",
      sex: "Female",
      dob: "1993-01-22",
      countryOfBirth: "Brazil",
      citizenship: "Brazil",
      passportNumber: "BR9087123",
      passportCountry: "Brazil",
      passportExpiry: "2032-07-19",
      mastersUS: false,
      entityId: ENTITY_LABS,
      status: "needs_attorney",
      determination: makeDetermination(r, {
        level: "II",
        socCode: "15-1211",
        socTitle: "Computer Systems Analysts",
        worksite: "Denver, CO",
        offeredWage: 168000,
        confidence: 0.71,
        confirmedLevel: null,
        rationale:
          "Offered wage of $168,000 is just below the Level III threshold of $170,000. A small raise would move from 2 entries to 3, but commits the employer to the Level III wage on the LCA and petition.",
        minDegree: "Master's",
        field: "Data Science",
        experienceMonths: 36,
        supervises: 2,
      }),
    },
    {
      id: uid(4),
      givenName: "Arjun",
      familyName: "Mehta",
      sex: "Male",
      dob: "1990-11-30",
      countryOfBirth: "India",
      citizenship: "India",
      passportNumber: "IN5523109",
      passportCountry: "Indea",
      passportExpiry: "2030-05-05",
      mastersUS: false,
      entityId: ENTITY_US,
      status: "validation_issue",
      determination: makeDetermination(r, {
        level: "II",
        confirmedLevel: "II",
      }),
      missingFields: ["Passport country (invalid: Indea)"],
    },
    {
      id: uid(5),
      givenName: "Lucas",
      familyName: "Almeida",
      sex: "Male",
      dob: "1995-06-14",
      countryOfBirth: "Brazil",
      citizenship: "Brazil",
      passportNumber: "BR4471890",
      passportCountry: "Brazil",
      passportExpiry: "2033-08-26",
      mastersUS: true,
      entityId: ENTITY_US,
      status: "ready",
      determination: makeDetermination(r, {
        level: "III",
        confirmedLevel: "III",
      }),
    },
  ];
}

function generate(
  startId: number,
  count: number,
  status: RegistrationStatus,
  seed: number
): Registration[] {
  const r = rng(seed);
  const out: Registration[] = [];
  for (let i = 0; i < count; i++) {
    const level = (["I", "II", "III", "IV"] as WageLevel[])[
      Math.floor(r() * 4)
    ];
    const confirmable =
      status !== "duplicate_risk" && status !== "needs_attorney";
    out.push({
      id: uid(startId + i),
      givenName: GIVEN[Math.floor(r() * GIVEN.length)],
      sex: r() > 0.5 ? "Female" : "Male",
      familyName: FAMILY[Math.floor(r() * FAMILY.length)],
      dob: `19${80 + Math.floor(r() * 18)}-0${1 + Math.floor(r() * 9)}-1${Math.floor(
        r() * 9
      )}`,
      countryOfBirth: COUNTRIES[Math.floor(r() * COUNTRIES.length)],
      citizenship: COUNTRIES[Math.floor(r() * COUNTRIES.length)],
      passportNumber: `P${Math.floor(r() * 9000000 + 1000000)}`,
      passportCountry: COUNTRIES[Math.floor(r() * COUNTRIES.length)],
      passportExpiry: `203${Math.floor(r() * 5)}-0${1 + Math.floor(r() * 8)}-15`,
      mastersUS: r() > 0.6,
      entityId: r() > 0.7 ? ENTITY_LABS : ENTITY_US,
      status,
      determination: makeDetermination(r, {
        level,
        confirmedLevel: confirmable ? level : null,
      }),
      duplicate:
        status === "duplicate_risk"
          ? {
              kind: "cross_client",
              message:
                "This passport already exists elsewhere in the firm. Confirm a bona fide separate offer or escalate to conflicts review.",
              resolved: false,
            }
          : undefined,
      missingFields: status === "missing_data" ? ["Date of birth"] : undefined,
    });
  }
  return out;
}

function buildNorthwind(): Registration[] {
  const h = heroes();
  // Remaining counts so the funnel totals 128.
  const rest: Registration[] = [
    ...generate(6, 103, "ready", 11),
    ...generate(109, 8, "missing_data", 23),
    ...generate(117, 5, "duplicate_risk", 31),
    ...generate(122, 4, "needs_attorney", 41),
    ...generate(126, 3, "validation_issue", 53),
  ];
  return [...h, ...rest];
}

export function seedCampaigns(): Campaign[] {
  return [
    {
      id: "northwind-fy2027",
      client: "Northwind Robotics",
      fiscalYear: "FY2027",
      deadline: "2026-03-19",
      windowOpens: "2026-03-04",
      focus: true,
      entities: [
        { id: ENTITY_US, name: "Northwind US Inc.", ein: "84-1234567" },
        { id: ENTITY_LABS, name: "Northwind Labs LLC", ein: "84-7654321" },
      ],
      registrations: buildNorthwind(),
    },
    {
      id: "acme-fy2027",
      client: "Acme Cloud",
      fiscalYear: "FY2027",
      deadline: "2026-03-19",
      windowOpens: "2026-03-04",
      entities: [{ id: "acme-1", name: "Acme Cloud Inc.", ein: "12-3456789" }],
      registrations: [
        ...generate(200, 78, "ready", 61),
        ...generate(278, 14, "missing_data", 67),
        ...generate(292, 9, "duplicate_risk", 71),
        ...generate(301, 9, "needs_attorney", 73),
      ],
    },
    {
      id: "vela-fy2027",
      client: "Vela Health",
      fiscalYear: "FY2027",
      deadline: "2026-03-19",
      windowOpens: "2026-03-04",
      entities: [{ id: "vela-1", name: "Vela Health Inc.", ein: "33-2211009" }],
      registrations: [
        ...generate(400, 52, "ready", 81),
        ...generate(452, 6, "missing_data", 83),
        ...generate(458, 4, "needs_attorney", 87),
        ...generate(462, 2, "duplicate_risk", 89),
      ],
    },
    {
      id: "orbit-fy2027",
      client: "Orbit Mobility",
      fiscalYear: "FY2027",
      deadline: "2026-03-19",
      windowOpens: "2026-03-04",
      entities: [{ id: "orbit-1", name: "Orbit Mobility Inc.", ein: "55-9988776" }],
      registrations: [
        ...generate(500, 31, "ready", 97),
        ...generate(531, 5, "missing_data", 101),
        ...generate(536, 2, "needs_attorney", 103),
      ],
    },
  ];
}
