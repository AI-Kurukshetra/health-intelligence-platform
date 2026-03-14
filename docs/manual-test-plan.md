# HealthIQ Manual Test Plan (MVP)
_Last updated: 2026-03-14_

## Scope
Manual testing for the HealthIQ MVP including authentication, role-based access, dashboard workflows, patient views, care coordination, cohorts, analytics, and admin user management.

## Test Environment
- Deployment: local or staging build connected to Supabase.
- Browser: Chrome latest, Edge latest, Safari latest (for Mac), plus one mobile browser.
- Network: normal and throttled (Fast 3G) for loading-state validation.

## Test Data Requirements
- At least 1 organization, 5 roles, and 5 test users across roles.
- At least 20 patients with risk scores, conditions, care gaps, and care plans.
- At least 10 tasks across statuses and priorities.
- At least 5 workflows (active and paused).
- At least 3 cohorts with patient_count.
- At least 3 quality measures with numerator, denominator, rate, and dates.

## Roles And Accounts
| Role | Purpose |
| --- | --- |
| `super_admin` | Full access, validate admin tools and workflows |
| `org_admin` | Admin features without global privileges |
| `care_manager` | Tasks, care gaps, patient workflows |
| `physician` | Patient-focused read-only access |
| `analyst` | Analytics and cohort reporting |

## Test Cases
| ID | Area | Role | Steps | Expected Result |
| --- | --- | --- | --- | --- |
| AUTH-01 | Sign Up | Any | 1. Open `/auth/sign-up`.<br>2. Submit valid email and password. | Sign-up success message or email verification flow triggers. |
| AUTH-02 | Sign In | Any | 1. Open `/auth/sign-in`.<br>2. Submit valid credentials. | User lands on `/dashboard`. |
| AUTH-03 | Invalid Sign In | Any | 1. Open `/auth/sign-in`.<br>2. Submit invalid credentials. | Error message shown. |
| AUTH-04 | Sign Out | Any | 1. Sign in.<br>2. Click avatar menu.<br>3. Click Sign out. | User returns to `/`. |
| AUTH-05 | Email Verified Page | Any | 1. Open `/auth/email-verified`. | Page renders and confirms verification state. |
| RBAC-01 | Dashboard Protection | Any | 1. Sign out.<br>2. Navigate to `/dashboard`. | Redirect to `/auth/sign-in`. |
| RBAC-02 | Admin Protection | Non-admin | 1. Sign in as non-admin.<br>2. Navigate to `/admin`. | Redirect to `/dashboard`. |
| RBAC-03 | Admin Access | Admin | 1. Sign in as admin.<br>2. Navigate to `/admin`. | Admin page loads. |
| RBAC-04 | Role-Based Nav | All roles | 1. Sign in with each role.<br>2. Observe sidebar links. | Only permitted links are visible per role. |
| ADM-01 | User List | Admin | 1. Open `/admin/users`. | User table loads with roles and joined dates. |
| ADM-02 | Update Role | Admin | 1. Open `/admin/users`.<br>2. Change a user role.<br>3. Refresh page. | Role updates and persists. |
| DASH-01 | KPI Load | Any | 1. Open `/dashboard`. | Skeletons appear then KPI values load. |
| DASH-02 | Quality Measures | Any | 1. Open `/dashboard`.<br>2. Review Quality Measures card. | Measures render with rates and counts. |
| DASH-03 | Export Report | Any | 1. Open `/dashboard`.<br>2. Click Export Report. | JSON file downloads when data is ready. |
| PAT-01 | Patient List | Any | 1. Open `/dashboard/patients`. | Table renders with patients. |
| PAT-02 | Patient Filters | Any | 1. Set Risk Tier filter.<br>2. Set Condition filter. | List updates to reflect filters. |
| PAT-03 | Patient Search | Any | 1. Enter name in search.<br>2. Clear search. | Results filter and restore. |
| PAT-04 | Patient Profile | Any | 1. Click a patient name. | Profile page loads with demographics, risk, gaps. |
| RISK-01 | Risk Scoring API | Admin | 1. Call `POST /api/risk-scores/score` with a patient id.<br>2. Call again within 24h. | First call creates score, second call returns cached score. |
| GAP-01 | Care Gap List | Any | 1. Open `/dashboard/care-gaps`. | Care gaps render with status and due dates. |
| GAP-02 | Care Gap Empty State | Any | 1. Use org with no gaps. | Empty state message appears. |
| TASK-01 | Task List | Any | 1. Open `/dashboard/tasks`. | Task list renders with statuses. |
| TASK-02 | Create Task | Any | 1. Click Create Task.<br>2. Submit valid form. | Task appears in list. |
| TASK-03 | Task Filters | Any | 1. Set Status filter.<br>2. Set Priority filter. | Task list updates. |
| TASK-04 | Task Validation | Any | 1. Open Create Task.<br>2. Submit empty form. | Validation errors shown. |
| WF-01 | Workflow List | Admin | 1. Open `/dashboard/workflows`. | Workflow cards render. |
| WF-02 | Create Workflow | Admin | 1. Click Create Workflow.<br>2. Submit valid form. | Workflow appears and is active. |
| WF-03 | Toggle Workflow | Admin | 1. Toggle Active/Pause on a workflow. | Status updates to Active or Paused. |
| WF-04 | Workflow Access | Non-admin | 1. Sign in as non-admin.<br>2. Open `/dashboard/workflows`. | Create button is hidden. |
| COH-01 | Cohort List | Admin/Analyst | 1. Open `/dashboard/cohorts`. | Cohort cards and stats render. |
| ANA-01 | Analytics Overview | Admin/Analyst | 1. Open `/dashboard/analytics`. | Risk distribution and care gap mix render. |
| ANA-02 | Analytics Loading | Admin/Analyst | 1. Throttle network.<br>2. Open analytics page. | Skeletons render then data loads. |
| PROF-01 | Profile Page | Any | 1. Open `/profile`. | Email and display name show. |
| LAND-01 | Landing CTA | Any | 1. Open `/`.<br>2. Click Explore Dashboard. | Signed-out users route to sign-in. |

## Non-Functional Checks
- Performance: dashboard KPIs and analytics load within 2 seconds on normal network.
- Responsiveness: layouts are usable on mobile widths.
- Accessibility: keyboard navigation works for forms and menus.
- Security: unauthenticated or unauthorized users are redirected appropriately.

## Out Of Scope
AI edge function scoring, outreach log UI, automated workflow execution, and production-grade integrations are not part of MVP manual testing until implemented.
