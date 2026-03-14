# HealthIQ Project Explanation
_Last updated: 2026-03-14_

## Overview
HealthIQ is an AI-powered Population Health Management (PHM) platform that helps healthcare organizations identify at-risk patients, close care gaps, coordinate care teams, and report quality outcomes in value-based care programs.

The MVP focuses on a unified dashboard experience with risk stratification, care gaps, tasks, workflows, cohorts, and analytics, plus role-based access to keep each persona in the right workspace.

## Target Users And Personas
| Persona | Primary goals | Typical usage |
| --- | --- | --- |
| Health System Admin | Manage users, roles, workflows | Admin and workflow management |
| Care Manager / Nurse | Prioritize outreach, close gaps | Tasks, care gaps, patient profiles |
| Physician / Provider | Review risk and patient context | Patient profiles, care gaps |
| Data Analyst | Track KPIs and measures | Analytics and cohorts |
| Patient (future) | Read-only access | Not in MVP |

## Core User Flows
1. User signs in and is routed to a role-appropriate dashboard.
2. Dashboard overview shows KPIs, quality measures, and quick actions.
3. Care team reviews high-risk patients and open care gaps.
4. Tasks are created to drive outreach and follow-up.
5. Admin configures workflows and roles.
6. Analyst reviews population KPIs and quality measures.

## Modules And Features
| Module | What it does | Where in product | Usage notes |
| --- | --- | --- | --- |
| Authentication and RBAC | Supabase email/password auth with role-based access | `/auth/*`, protected layouts | Roles drive nav visibility and admin-only actions |
| Marketing site | Public landing page with CTA | `/` | Routes users to sign-in or sign-up |
| Dashboard overview | KPI cards, quality measures, quick actions | `/dashboard` | Uses KPIs and measures APIs |
| Patients | Patient directory with risk tiers and filters | `/dashboard/patients` | Filters by risk tier, condition, search |
| Patient profile | Demographics, risk, conditions, care gaps, care plans | `/dashboard/patients/:id` | Read-only data views |
| Risk stratification | Deterministic scoring with caching | `/api/risk-scores/score` | AI integration planned for future |
| Care gaps | Organization-wide care gap queue | `/dashboard/care-gaps` | Read-only list in UI |
| Tasks | Task list with filters and task creation | `/dashboard/tasks` | Create task modal available |
| Workflows | Workflow list and automation rules | `/dashboard/workflows` | Admins can create and activate workflows |
| Cohorts | Cohort intelligence and summary | `/dashboard/cohorts` | Read-only list in UI |
| Analytics | Risk distribution and care gap trends | `/dashboard/analytics` | Uses risk scores and care gaps data |
| Admin users | Role management and user directory | `/admin/users` | Admin-only |
| Profile | Current user profile details | `/profile` | Read-only |

## Role-Based Access
| Role | Key access | Notes |
| --- | --- | --- |
| `super_admin` | All areas | Full access |
| `org_admin` | All areas + admin tools | Can manage users and workflows |
| `care_manager` | Patients, care gaps, tasks, profile | No admin area |
| `physician` | Patients, care gaps, tasks, profile | No cohorts, workflows, admin |
| `analyst` | Patients, cohorts, analytics, profile | No tasks, care gaps, workflows |

## Data Model Summary
HealthIQ centers around organizations, user profiles, and patient records. Supporting tables include risk scores, care gaps, tasks, workflows, cohorts, and quality measures. The data model is documented in `docs/database.md` and is enforced with RLS in Supabase.

## How To Use (Walkthrough)
1. Open the landing page and sign up or sign in.
2. Navigate the dashboard overview to review KPIs and quality measures.
3. Open the patient directory to filter by risk tier or condition.
4. Select a patient to review risk score, conditions, and care gaps.
5. Check the care gap queue to prioritize overdue screenings.
6. Create a task to assign follow-up work to the care team.
7. As an admin, create and activate workflows for automated task creation.
8. Review analytics for risk distribution and care gap trends.

## Out Of Scope For MVP
Full EHR integrations, mobile app, production-grade billing, and advanced AI pipelines are explicitly out of scope for the MVP. The current AI risk scoring endpoint uses deterministic logic and will be upgraded later.
