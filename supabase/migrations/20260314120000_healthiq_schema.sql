begin;

-- Remove starter tables
drop table if exists public.items cascade;
drop table if exists public.profiles cascade;

-- Helper function for updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Organizations
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  settings jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Roles
create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (name in ('super_admin','org_admin','care_manager','physician','analyst')),
  description text,
  created_at timestamptz not null default now()
);

-- User profiles
create table if not exists public.user_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  org_id uuid references public.organizations (id),
  role_id uuid references public.roles (id),
  full_name text,
  email text,
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Patients
create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id),
  mrn text,
  first_name text not null,
  last_name text not null,
  dob date,
  gender text,
  phone text,
  email text,
  address jsonb,
  insurance_id text,
  pcp_id uuid references public.user_profiles (id),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_patients_org on public.patients (org_id);
create index if not exists idx_patients_pcp on public.patients (pcp_id);

-- Patient conditions
create table if not exists public.patient_conditions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  icd10_code text not null,
  description text,
  onset_date date,
  status text not null default 'active' check (status in ('active','resolved','chronic')),
  created_at timestamptz not null default now()
);

-- Risk scores
create table if not exists public.risk_scores (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  score numeric(5,2) not null check (score >= 0 and score <= 100),
  risk_tier text not null check (risk_tier in ('high','medium','low')),
  risk_factors jsonb,
  model_version text,
  calculated_at timestamptz not null default now()
);

create index if not exists idx_risk_patient on public.risk_scores (patient_id);
create index if not exists idx_risk_tier on public.risk_scores (risk_tier);

-- Care gaps
create table if not exists public.care_gaps (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  gap_type text not null,
  description text,
  due_date date,
  status text not null default 'open' check (status in ('open','in_progress','closed')),
  closed_at timestamptz,
  closed_by uuid references public.user_profiles (id),
  created_at timestamptz not null default now()
);

-- Care plans
create table if not exists public.care_plans (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  created_by uuid references public.user_profiles (id),
  title text not null,
  goals jsonb,
  interventions jsonb,
  status text not null default 'active' check (status in ('active','completed','archived')),
  ai_generated boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Tasks
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references public.patients (id) on delete set null,
  assigned_to uuid references public.user_profiles (id),
  created_by uuid references public.user_profiles (id),
  org_id uuid not null references public.organizations (id),
  title text not null,
  description text,
  task_type text,
  priority text not null default 'medium' check (priority in ('low','medium','high','urgent')),
  status text not null default 'pending' check (status in ('pending','in_progress','completed','cancelled')),
  due_date date,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

-- Outreach log
create table if not exists public.outreach_log (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  user_id uuid references public.user_profiles (id),
  channel text,
  outcome text,
  notes text,
  contacted_at timestamptz not null default now()
);

-- Quality measures
create table if not exists public.quality_measures (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id),
  measure_code text not null,
  measure_name text,
  numerator integer not null default 0,
  denominator integer not null default 0,
  rate numeric(5,2),
  period_start date,
  period_end date,
  calculated_at timestamptz not null default now()
);

-- Workflows
create table if not exists public.workflows (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id),
  name text not null,
  trigger_type text not null,
  trigger_config jsonb,
  actions jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Cohorts
create table if not exists public.cohorts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id),
  name text not null,
  description text,
  filter_config jsonb,
  patient_count integer,
  created_by uuid references public.user_profiles (id),
  created_at timestamptz not null default now()
);

create table if not exists public.cohort_members (
  cohort_id uuid references public.cohorts (id) on delete cascade,
  patient_id uuid references public.patients (id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (cohort_id, patient_id)
);

-- Care team assignments
create table if not exists public.care_team_assignments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  user_id uuid not null references public.user_profiles (id) on delete cascade,
  role text,
  created_at timestamptz not null default now()
);

create index if not exists idx_assignments_patient on public.care_team_assignments (patient_id);
create index if not exists idx_assignments_user on public.care_team_assignments (user_id);

-- updated_at triggers
drop trigger if exists set_user_profiles_updated_at on public.user_profiles;
create trigger set_user_profiles_updated_at
  before update on public.user_profiles
  for each row execute function public.set_updated_at();

drop trigger if exists set_patients_updated_at on public.patients;
create trigger set_patients_updated_at
  before update on public.patients
  for each row execute function public.set_updated_at();

drop trigger if exists set_care_plans_updated_at on public.care_plans;
create trigger set_care_plans_updated_at
  before update on public.care_plans
  for each row execute function public.set_updated_at();

-- Helper functions for RLS
create or replace function public.current_user_role()
returns text
stable
language sql
security definer
set search_path = public
set row_security = off
as $$
  select r.name
  from public.user_profiles up
  join public.roles r on r.id = up.role_id
  where up.id = auth.uid()
$$;

create or replace function public.current_org_id()
returns uuid
stable
language sql
security definer
set search_path = public
set row_security = off
as $$
  select org_id from public.user_profiles where id = auth.uid()
$$;

-- Seed role records
insert into public.roles (name, description)
values
  ('super_admin','Full system access'),
  ('org_admin','Organization admin'),
  ('care_manager','Care manager'),
  ('physician','Clinical provider'),
  ('analyst','Analytics user')
on conflict (name) do nothing;

-- Trigger: create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  default_org uuid;
  default_role uuid;
begin
  select id into default_org from public.organizations order by created_at asc limit 1;
  select id into default_role from public.roles where name = 'care_manager' limit 1;

  insert into public.user_profiles (id, email, full_name, avatar_url, org_id, role_id)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url',
    default_org,
    default_role
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS
alter table public.organizations enable row level security;
alter table public.roles enable row level security;
alter table public.user_profiles enable row level security;
alter table public.patients enable row level security;
alter table public.patient_conditions enable row level security;
alter table public.risk_scores enable row level security;
alter table public.care_gaps enable row level security;
alter table public.care_plans enable row level security;
alter table public.tasks enable row level security;
alter table public.outreach_log enable row level security;
alter table public.quality_measures enable row level security;
alter table public.workflows enable row level security;
alter table public.cohorts enable row level security;
alter table public.cohort_members enable row level security;
alter table public.care_team_assignments enable row level security;

-- RLS policies
create policy "Roles readable by authenticated users"
  on public.roles for select
  to authenticated
  using (true);

create policy "Organizations readable by org members"
  on public.organizations for select
  to authenticated
  using (
    id = public.current_org_id()
    or public.current_user_role() = 'super_admin'
  );

create policy "User profiles readable by org admins and self"
  on public.user_profiles for select
  to authenticated
  using (
    id = auth.uid()
    or (
      org_id = public.current_org_id()
      and public.current_user_role() in ('org_admin','super_admin')
    )
  );

create policy "Users can update own profile"
  on public.user_profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "Org admins can update org profiles"
  on public.user_profiles for update
  to authenticated
  using (
    org_id = public.current_org_id()
    and public.current_user_role() in ('org_admin','super_admin')
  );

create policy "Patients readable by org members with access"
  on public.patients for select
  to authenticated
  using (
    org_id = public.current_org_id()
    and (
      public.current_user_role() in ('org_admin','analyst','super_admin')
      or id in (select patient_id from public.care_team_assignments where user_id = auth.uid())
      or pcp_id = auth.uid()
    )
  );

create policy "Org admins manage patients"
  on public.patients for all
  to authenticated
  using (
    org_id = public.current_org_id()
    and public.current_user_role() in ('org_admin','super_admin')
  )
  with check (
    org_id = public.current_org_id()
    and public.current_user_role() in ('org_admin','super_admin')
  );

create policy "Conditions readable by org members"
  on public.patient_conditions for select
  to authenticated
  using (
    patient_id in (select id from public.patients where org_id = public.current_org_id())
  );

create policy "Risk scores readable by org members"
  on public.risk_scores for select
  to authenticated
  using (
    patient_id in (select id from public.patients where org_id = public.current_org_id())
  );

create policy "Care gaps readable by org members"
  on public.care_gaps for select
  to authenticated
  using (
    patient_id in (select id from public.patients where org_id = public.current_org_id())
  );

create policy "Care gaps update by care team"
  on public.care_gaps for update
  to authenticated
  using (
    patient_id in (
      select patient_id from public.care_team_assignments where user_id = auth.uid()
    )
    or public.current_user_role() in ('org_admin','super_admin')
  );

create policy "Tasks readable by org members"
  on public.tasks for select
  to authenticated
  using (org_id = public.current_org_id());

create policy "Tasks managed by care team"
  on public.tasks for all
  to authenticated
  using (
    org_id = public.current_org_id()
    and public.current_user_role() in ('org_admin','care_manager','physician','super_admin')
  )
  with check (
    org_id = public.current_org_id()
    and public.current_user_role() in ('org_admin','care_manager','physician','super_admin')
  );

create policy "Workflows org admin only"
  on public.workflows for all
  to authenticated
  using (
    org_id = public.current_org_id()
    and public.current_user_role() in ('org_admin','super_admin')
  )
  with check (
    org_id = public.current_org_id()
    and public.current_user_role() in ('org_admin','super_admin')
  );

create policy "Cohorts org members read"
  on public.cohorts for select
  to authenticated
  using (org_id = public.current_org_id());

create policy "Cohorts org admin manage"
  on public.cohorts for all
  to authenticated
  using (
    org_id = public.current_org_id()
    and public.current_user_role() in ('org_admin','super_admin')
  )
  with check (
    org_id = public.current_org_id()
    and public.current_user_role() in ('org_admin','super_admin')
  );

create policy "Cohort members org access"
  on public.cohort_members for select
  to authenticated
  using (
    cohort_id in (select id from public.cohorts where org_id = public.current_org_id())
  );

create policy "Care team assignments org access"
  on public.care_team_assignments for select
  to authenticated
  using (
    patient_id in (select id from public.patients where org_id = public.current_org_id())
  );

commit;
