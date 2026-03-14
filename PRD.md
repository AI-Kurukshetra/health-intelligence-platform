# Product Requirements Document (PRD)
# HealthIQ - AI Population Health Management Platform

## 1. Overview
HealthIQ is a web-based, AI-powered Population Health Management (PHM) platform for healthcare organizations (hospitals, clinics, ACOs, payers). It helps teams manage thousands of patients, identify who is at risk of adverse events, close care gaps, coordinate care teams, and demonstrate improved outcomes in value-based care contracts.

This PRD is derived from `docs/definition.pdf` and adapted to the current repository stack and constraints.
The product consists of two primary surfaces:
- A public marketing site (landing page).
- A secure, role-based SaaS dashboard where all core functionality lives.

## 2. Goals
- Proactively identify high-risk patients before costly events occur.
- Enable care teams to close care gaps quickly with clear tasks and workflows.
- Provide a compelling analytics dashboard for population-level KPIs.
- Demonstrate AI-generated risk scoring and care plan support.
- Deliver a demo-ready product that shows role-based workflows and real-time updates.

## 3. Problem Statement
Healthcare delivery is reactive and fragmented. Providers see patients after they become ill, while value-based care contracts reward prevention and penalize poor outcomes. Organizations need tools that:
- Predict who will get sicker.
- Identify missing screenings and medications.
- Coordinate interventions across teams.
- Measure and report outcomes with minimal overhead.

## 4. Target Users
- Accountable Care Organizations (ACOs).
- Health systems with value-based care contracts.
- Managed care organizations.
- Large multi-specialty physician groups.

Primary in-app personas:
- Health System Admin (platform owner).
- Care Manager / Nurse (daily operator).
- Physician / Provider (clinical user).
- Data Analyst (report builder).
- Patient (future, read-only).

## 5. Value Proposition
HealthIQ shifts organizations from reactive care to proactive population management by surfacing AI-powered risk insights and actionable care gaps inside a unified workflow and dashboard.

## 6. Scope

### 6.1 MVP (Hackathon Must-Have)
1. Patient risk stratification (0-100 score with tiers).
2. Population health dashboard with KPI cards.
3. Care gap analysis and prioritization.
4. Patient profile with clinical context.
5. Cohort management by condition or risk tier.
6. Automated workflow engine for high-risk triggers.
7. Care coordination tools (tasks and notes).
8. Outreach logging and follow-up tracking.
9. Quality measure reporting (HEDIS-style).
10. Authentication and RBAC.
11. Public landing page website for product positioning and lead capture.

### 6.2 Important (If Time Permits)
11. Provider performance analytics.
12. Cost analytics and forecasting.
13. Clinical decision support alerts.
14. Social determinants integration (SDOH).
15. Real-time clinical alerting.
16. NLP on clinical notes.
17. Chronic disease workflows.
18. ED utilization analytics.

### 6.3 Optional / Innovative
- Wearables data integration.
- Genomic risk factors.
- Blockchain record sharing.
- AI care plan generation (LLM).
- Digital twin patient modeling.
- Federated learning across orgs.
- AR care guidance.

## 7. User Roles and RBAC
Role hierarchy: super_admin > org_admin > care_manager = physician > analyst > patient.

Key access expectations:
- Super Admin: full cross-org access, global configuration.
- Org Admin: full access within their org; user and workflow management.
- Care Manager: read/write patient data for assigned cohorts; task and care gap management.
- Physician: clinical read/write on patient profiles and care plans.
- Analyst: read-only access to aggregate analytics and reports.
- Patient (future): read-only view of their own record.

Routing and access control:
- Public routes: marketing site only.
- Auth routes: sign-in, sign-up, callback, email verification.
- Protected routes: all dashboard pages gated by session + role.
- Navigation is role-aware; users only see pages they can access.

## 8. Core User Flows
1. Login -> role-based redirect -> dashboard view.
2. Care manager views patient list sorted by risk.
3. Care manager opens patient profile, reviews care gaps and risk factors.
4. Care manager assigns task and logs outreach.
5. Workflow engine triggers auto-task for high-risk patients.
6. Analyst reviews population KPIs and quality measures.
7. Admin configures workflows and user roles.
8. AI risk score generation updates dashboard and alerts.
9. Visitor lands on marketing site and is directed to sign-in or request access.

## 9. Functional Requirements

### 9.0 Public Landing Page
- Clear product positioning (problem, solution, outcomes).
- Feature highlights aligned to core dashboard modules.
- Social proof / credibility section (logos or stats placeholders for demo).
- Call-to-action for sign-in and/or demo request.
- Responsive and fast, with SEO-friendly metadata.

### 9.1 Patient Risk Stratification
- AI generates risk score 0-100 with tiers: high/medium/low.
- Persist risk score, factors, and model version.
- Show top risk factors on patient profile and list.

### 9.2 Population Health Dashboard
- KPI cards: total patients, high risk count, open care gaps, care gap closure rate, tasks due today.
- Charts: risk distribution donut, care gap trend line, quality measures bar chart, cost vs outcome scatter.
- Real-time updates when care gaps or tasks change.
 - Dashboard is the primary surface for all core requirements.

### 9.3 Care Gaps
- Detect gaps (e.g., A1C, BP, mammogram, flu vaccine).
- List gaps by priority and due date.
- Close gaps with attribution and timestamps.

### 9.4 Patient Profile
- Single patient view with demographics, conditions, medications, care gaps, care plans, tasks.
- Tabbed layout: Overview, Conditions, Care Gaps, Care Plan, Tasks, History.

### 9.5 Cohorts
- Group patients by condition, risk tier, or custom filters.
- Show cohort counts and membership.

### 9.6 Tasks and Care Coordination
- Task board with status: pending, in_progress, completed.
- Assign tasks to care team members.
- Outreach log with channel, outcome, and notes.

### 9.7 Workflows
- Rule-based triggers (risk threshold, care gap detected, condition added).
- Actions: create task, assign care manager, send notification.
- Admin-only workflow creation and management.

### 9.8 Quality Measures
- HEDIS-style measures with numerator/denominator and rate.
- Reporting by org and time period.

### 9.9 Authentication and RBAC
- Supabase Auth with user profiles and roles.
- Middleware enforces role-based route access.
- API routes validate sessions and role permissions.
- Role-aware navigation and conditional UI rendering.

## 10. AI Requirements
- Risk scoring prompt returns strict JSON with score, tier, factors, and interventions.
- AI responses persisted; do not re-score unchanged patients within 24 hours.
- Edge function supports batch scoring (cron).
- Error handling includes retries and fallback handling.

## 11. Data Requirements (Core Tables)
- organizations
- roles, permissions, user_profiles
- patients, patient_conditions
- risk_scores
- care_gaps
- care_plans
- tasks
- outreach_log
- quality_measures
- workflows
- cohorts, cohort_members

## 12. System Architecture (Constraints)
- Use existing repo stack: Next.js App Router, TypeScript, Supabase, shadcn/ui, Tailwind, TanStack Query, Axios.
- API routes are Next.js route handlers.
- RLS enforced at the database layer.
- AI services via Supabase Edge Functions.
- Realtime updates via Supabase Realtime.

## 13. Non-Functional Requirements
- Performance: dashboard charts render within 2 seconds; AI risk scoring under 8 seconds per patient.
- Security: RLS on all tables; role-based access in middleware and API handlers.
- Reliability: retries for AI calls; safe fallback on failures.
- Auditability: created_by and timestamps for clinical actions.
- Demo readiness: polished UI, realistic seed data, responsive layouts.
 - Marketing site loads quickly and is mobile-optimized.

## 14. Success Metrics
- Risk score accuracy (demo): aligns with clinical expectation for seed patients.
- Care gap closure demo: detect -> assign -> close -> update quality measure.
- Dashboard impressiveness: KPIs update in real time; charts render fast.
- Role-based access: at least 3 distinct role views.
- AI response time: < 8 seconds for scoring.

## 15. Phased Delivery Plan
Phase 1: Authentication and RBAC (3-4 hours)
- Auth flows, roles, user profiles, middleware.

Phase 2: Core Patient Management (4-5 hours)
- Patients, risk scores, care gaps, patient profiles.

Phase 3: Care Coordination Workflow (3-4 hours)
- Tasks, outreach log, workflows engine, care plans.

Phase 4: Analytics Dashboard (3-4 hours)
- KPI cards, charts, quality measures.

Phase 5: AI Integration (3-4 hours)
- Risk scoring edge function, AI care plan generation, NLP notes.

Phase 6: Polish and Demo (2 hours)
- Seed data, real-time alerts, error handling, responsive UX.

## 16. Risks and Open Questions
- Data availability: realistic seed data required for credible demo.
- AI latency and cost: must meet demo timing constraints.
- Scope creep: optional features should not delay MVP.

## 17. Out of Scope for Hackathon MVP
- Full EHR integrations (HL7/FHIR).
- Mobile app.
- Multi-model AI routing.
- Blockchain integration.
- Production-grade multi-tenant billing.
