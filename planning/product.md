# Product

HealthIQ is an AI-powered Population Health Management (PHM) platform that helps healthcare organizations identify at-risk patients, close care gaps, and coordinate care teams while proving outcomes in value-based care contracts.

---

## Problem

Healthcare is reactive and fragmented. Organizations need to predict who will get sicker, find missing screenings and medications, coordinate interventions across care teams, and report quality outcomes with minimal overhead.

---

## Target Users

- Accountable Care Organizations (ACOs)
- Health systems in value-based care contracts
- Managed care organizations
- Multi-specialty physician groups

Primary personas:
- Health System Admin
- Care Manager / Nurse
- Physician / Provider
- Data Analyst
- Patient (future, read-only)

---

## Value Proposition

HealthIQ surfaces AI risk insights and care gaps inside a unified workflow and analytics dashboard, enabling proactive interventions and measurable quality improvements.

---

## Core User Flows

1. User signs in and is routed to a role-appropriate dashboard.
2. Care manager reviews high-risk patients and open care gaps.
3. Care manager assigns tasks and logs outreach.
4. Admin configures workflows and roles.
5. Analyst reviews population KPIs and quality measures.
6. Visitor lands on the marketing site and proceeds to sign-in or demo request.

---

## Out of Scope (MVP)

- Full EHR integrations (HL7/FHIR).
- Mobile app.
- Production-grade billing or multi-model AI routing.

---

## Success Metrics

| Metric | Target |
| --- | --- |
| AI risk score response time | < 8 seconds per patient |
| Care gap demo | Detect -> assign -> close -> update measure |
| Dashboard responsiveness | Charts render within 2 seconds |
| Role-based access | 3 distinct role views |

---

## Notes

- Schemas live in `src/types/schemas/`. API contracts in `docs/api-contracts.md`.
- Dashboard pages use TanStack Query hooks with the shared Axios client.
