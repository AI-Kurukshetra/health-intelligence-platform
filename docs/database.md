# Database

## Stack

- Postgres hosted on Supabase
- Migrations in `supabase/migrations/`
- RLS enabled on every table
- TypeScript types in `src/types/database.ts`

---

## Migration Conventions

- File naming: `YYYYMMDDHHMMSS_<description>.sql`
- All tables in `public` schema
- `id` columns use `uuid` with `gen_random_uuid()`
- `created_at` and `updated_at` are `timestamptz` with `now()`
- Enum-like fields are `text` with `check` constraints

---

## Core Schema (HealthIQ MVP)

### organizations
- `id`, `name`, `slug`, `settings`, `created_at`

### roles
- `id`, `name` (super_admin, org_admin, care_manager, physician, analyst), `description`, `created_at`

### user_profiles
- `id` (FK auth.users), `org_id`, `role_id`, `full_name`, `email`, `avatar_url`, `is_active`, `created_at`

### patients
- `id`, `org_id`, `mrn`, `first_name`, `last_name`, `dob`, `gender`, `phone`, `email`, `address`, `pcp_id`, `is_active`, `created_at`, `updated_at`

### patient_conditions
- `id`, `patient_id`, `icd10_code`, `description`, `onset_date`, `status`, `created_at`

### risk_scores
- `id`, `patient_id`, `score`, `risk_tier`, `risk_factors`, `model_version`, `calculated_at`

### care_gaps
- `id`, `patient_id`, `gap_type`, `description`, `due_date`, `status`, `closed_at`, `closed_by`, `created_at`

### care_plans
- `id`, `patient_id`, `created_by`, `title`, `goals`, `interventions`, `status`, `ai_generated`, `created_at`, `updated_at`

### tasks
- `id`, `patient_id`, `assigned_to`, `created_by`, `org_id`, `title`, `description`, `task_type`, `priority`, `status`, `due_date`, `completed_at`, `created_at`

### outreach_log
- `id`, `patient_id`, `user_id`, `channel`, `outcome`, `notes`, `contacted_at`

### quality_measures
- `id`, `org_id`, `measure_code`, `measure_name`, `numerator`, `denominator`, `rate`, `period_start`, `period_end`, `calculated_at`

### workflows
- `id`, `org_id`, `name`, `trigger_type`, `trigger_config`, `actions`, `is_active`, `created_at`

### cohorts
- `id`, `org_id`, `name`, `description`, `filter_config`, `patient_count`, `created_by`, `created_at`

### cohort_members
- `cohort_id`, `patient_id`, `added_at` (PK: cohort_id + patient_id)

---

## Row Level Security (Summary)

- `user_profiles`: users can read own profile; admins can read org profiles.
- `patients`, `risk_scores`, `care_gaps`, `care_plans`, `tasks`: org-scoped access with role-based filters.
- `workflows`, `cohorts`, `quality_measures`: org-scoped access; write operations restricted to admins.

---

## Useful Queries

```sql
select tablename, rowsecurity
from pg_tables
where schemaname = 'public';

select tablename, policyname, cmd, qual
from pg_policies
where schemaname = 'public';
```
