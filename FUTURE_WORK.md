# With more time: future extensions

Companion to the H-1B Registration PRD. These are the honest next steps beyond the
current prototype, in rough priority. Several depend on what happens before the
console, in the intake and collection layer, so they would be sequenced accordingly.

- A queryable data layer, grounded in the readiness ledger and the audit log, with data integrity as the first concern. An attorney could ask "which registrations are blocked, which have duplicate risk, which are missing passports, which are pending client signature" and get answers that trace back to source. The catch is that this is only as trustworthy as the data going in, so it depends on the pre-console intake being clean. Data integrity first, query second.
- The pre-console intake and collection layer itself, which most of this depends on. Deeper HRIS integration (Workday, Rippling), a low-friction beneficiary self-serve intake, and passport extraction, so the case graph is populated and validated before the board ever shows a row.
- A beneficiary and HR notification loop. Automated requests and reminders for missing or unconfirmed data, with status (requested, reminded, escalated) visible on the board and tied to the missing-data and blocked states. This closes the chase that today happens over email, and it lives in the collection layer rather than the attorney console.
- Hardening the determination engine. A real SOC and wage-level model grounded in O*NET, OEWS, and DOL guidance, with confidence calibration and an evaluation set, so the suggestions are defensible and the low-confidence routing is principled rather than a placeholder.
- Realizing the petition on-ramp. Generate the LCA draft and prefill the I-129 from the data captured at registration, and enforce the consistency lock on wage level, SOC, and worksite so selected cases convert without RFEs.
- A real conflicts-review workflow behind the ethical wall, with roles and permissions, so cross-client duplicate resolution is auditable and access-controlled.
- Generalizing the readiness-ledger pattern to other programs (O-1, L-1, PERM), since the primitive is not H-1B specific.
- Security and access foundations: role-based permissions, PII handling, and audit retention appropriate to a regulated domain.
