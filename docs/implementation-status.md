# Implementation Status vs Planning
_Last reviewed: 2026-03-14_

## Summary
The core dashboard experience is largely implemented: authentication, role-aware navigation, patient directory and profiles, care gaps, tasks, workflows, cohorts, and analytics all exist in the UI and have API support. The main gaps are AI-based risk scoring, outreach logging, workflow automation beyond manual creation, and demo polish items like richer seed data and real-time updates.

## Phase Status (Planning Folder)
| Phase | Status | Evidence | Gaps |
| --- | --- | --- | --- |
| Phase 1: Authentication and RBAC | Mostly done | `src/app/auth/*`, `src/lib/auth.ts`, `src/app/admin/*`, `src/app/profile/*`, `src/config/nav.ts` | DB triggers for profile creation and org/role seeding not verifiable in code |
| Phase 2: Core Patient Management | Mostly done | `src/app/dashboard/patients/page.tsx`, `src/app/dashboard/patients/[id]/page.tsx`, `src/app/api/patients/*`, `src/app/api/risk-scores/*` | No patient create/edit UI, seed data not included |
| Phase 3: Care Coordination Workflow | Partial | `src/app/dashboard/tasks/page.tsx`, `src/app/dashboard/workflows/page.tsx`, `src/app/api/tasks/*`, `src/app/api/workflows/*` | Outreach log UI/API missing, automation triggers not implemented |
| Phase 4: Analytics Dashboard | Mostly done | `src/app/dashboard/page.tsx`, `src/app/dashboard/analytics/page.tsx`, `src/app/api/analytics/*` | Recharts-based visuals not used, trends are static |
| Phase 5: AI Integration | Not started | `src/app/api/risk-scores/score/route.ts` | Deterministic scoring only, no edge function or AI prompts |
| Phase 6: Polish and Demo Readiness | Partial | Loading and empty states across pages | No large seed data set, no real-time updates, limited domain copy review |

## Feature-Level Status (MVP List)
| Feature | Status | Evidence | Notes |
| --- | --- | --- | --- |
| Authentication and RBAC | Done | `src/app/auth/*`, `src/app/admin/*`, `src/config/nav.ts`, `src/lib/auth.ts` | Role-based nav and admin route guard are implemented |
| Landing page | Done | `src/app/page.tsx` | Marketing site with CTAs |
| Population dashboard | Done | `src/app/dashboard/page.tsx` | KPI cards and quality measures |
| Patient list and profile | Done | `src/app/dashboard/patients/page.tsx`, `src/app/dashboard/patients/[id]/page.tsx` | Read-only profile |
| Risk stratification | Partial | `src/app/api/risk-scores/score/route.ts` | Deterministic scoring with caching |
| Care gaps | Partial | `src/app/dashboard/care-gaps/page.tsx`, `src/app/api/care-gaps/*` | UI is read-only |
| Tasks and outreach | Partial | `src/app/dashboard/tasks/page.tsx`, `src/app/api/tasks/*` | Task creation and list exist; outreach log missing |
| Workflows | Done | `src/app/dashboard/workflows/page.tsx`, `src/app/api/workflows/*` | Admin-only creation and activation toggle |
| Cohorts | Partial | `src/app/dashboard/cohorts/page.tsx`, `src/app/api/cohorts/route.ts` | List-only UI |
| Quality measures | Done | `src/app/dashboard/page.tsx`, `src/app/api/analytics/quality-measures/route.ts` | Displayed on dashboard overview |

## Remaining Work (High Impact)
1. AI risk scoring edge function, prompt validation, caching, and fallback logic beyond deterministic scoring.
2. Outreach log capture and UI to record contact attempts.
3. Workflow automation execution logic, beyond manual creation and activation toggles.
4. Care gap status updates from UI and a close-gap flow.
5. Patient create and edit UI with validation.
6. Cohort create/edit UI with filter configuration.
7. Demo polish items: large seed data set, real-time updates, copy review, and additional empty states where missing.
