# Features

---

## Feature Status Legend

| Status | Meaning |
| --- | --- |
| planned | In the backlog, not yet started |
| specced | Spec and design written, ready to implement |
| in progress | Currently being built |
| done | Shipped |
| paused | Started but deprioritized |

---

## MVP Feature List

| Feature | Status | Priority | Notes |
| --- | --- | --- | --- |
| Authentication and RBAC | in progress | P0 | Supabase Auth, role-based access |
| Landing page | planned | P0 | Marketing site with CTA |
| Population dashboard | planned | P0 | KPI cards and core charts |
| Patient list and profile | planned | P0 | Risk badge, tabs, care gaps |
| Risk stratification | planned | P0 | AI-generated scores, tiers |
| Care gaps | planned | P0 | Detect and close gaps |
| Tasks and outreach | planned | P0 | Task board + outreach log |
| Workflows | planned | P1 | Rule-based triggers |
| Cohorts | planned | P1 | Filtered patient groups |
| Quality measures | planned | P1 | HEDIS-style reporting |

---

## Post-MVP Features

| Feature | Priority | Notes |
| --- | --- | --- |
| Provider performance analytics | P1 | Benchmark quality scores |
| Cost analytics and forecasting | P1 | Cohort spend trends |
| Clinical decision support | P1 | Evidence-based alerts |
| SDOH integration | P1 | Zip code and risk factors |
| Real-time clinical alerting | P2 | Push notifications |
| NLP on clinical notes | P2 | Extract diagnoses and risk |
| Chronic disease workflows | P2 | Condition-specific care |
| ED analytics | P2 | Frequent ED utilization |

---

## Adding a Feature

1. Add a row to the table above
2. Create `features/<feature-name>/`
3. Write `spec.md`, `design.md`, `tasks.md` using the template
4. Update status to `specced`
