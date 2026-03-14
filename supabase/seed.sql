-- HealthIQ demo seed data (realistic, demo-ready)
-- Safe to re-run: uses deterministic MRNs and avoids duplicate inserts where possible.

begin;

-- ---------------------------------------------------------------------------
-- Orgs + Roles
-- ---------------------------------------------------------------------------
insert into public.organizations (name, slug)
values ('Riverside Health System', 'riverside-health')
on conflict (slug) do nothing;

insert into public.roles (name, description)
values
  ('super_admin','Full system access'),
  ('org_admin','Organization admin'),
  ('care_manager','Care manager'),
  ('physician','Clinical provider'),
  ('analyst','Analytics user')
on conflict (name) do nothing;

-- ---------------------------------------------------------------------------
-- Demo Auth Users (creates if missing)
-- ---------------------------------------------------------------------------
with input_users as (
  select * from (values
    ('superadmin@bacancyhealthsoln.com','Super Admin','HealthIQ!2026'),
    ('orgadmin@bacancyhealthsoln.com','Org Admin','HealthIQ!2026'),
    ('caremanager@bacancyhealthsoln.com','Care Manager','HealthIQ!2026'),
    ('physician@bacancyhealthsoln.com','Physician','HealthIQ!2026'),
    ('analyst@bacancyhealthsoln.com','Analyst','HealthIQ!2026')
  ) as v(email, full_name, password)
),
to_insert as (
  select iu.*, gen_random_uuid() as id
  from input_users iu
  where not exists (select 1 from auth.users u where u.email = iu.email)
),
ins_users as (
  insert into auth.users (
    id, instance_id, aud, role, email,
    encrypted_password, email_confirmed_at,
    confirmation_token, recovery_token,
    email_change, email_change_token_current, email_change_token_new,
    raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at
  )
  select
    id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    email,
    crypt(password, gen_salt('bf')),
    now(),
    '',
    '',
    '',
    '',
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', full_name),
    now(),
    now()
  from to_insert
  returning id, email
)
insert into auth.identities (
  provider_id, user_id, identity_data, provider, created_at, updated_at
)
select
  id::text,
  id,
  jsonb_build_object('sub', id::text, 'email', email),
  'email',
  now(),
  now()
from ins_users
on conflict (provider_id, provider) do nothing;

-- Ensure profiles exist for all auth users (for users created before trigger)
insert into public.user_profiles (id, email, full_name, org_id, role_id)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name'),
  (select id from public.organizations where slug = 'riverside-health' limit 1),
  (select id from public.roles where name = 'care_manager' limit 1)
from auth.users u
left join public.user_profiles up on up.id = u.id
where up.id is null;

-- Assign roles to demo accounts
update public.user_profiles
set org_id = (select id from public.organizations where slug = 'riverside-health' limit 1)
where email in (
  'superadmin@bacancyhealthsoln.com',
  'orgadmin@bacancyhealthsoln.com',
  'caremanager@bacancyhealthsoln.com',
  'physician@bacancyhealthsoln.com',
  'analyst@bacancyhealthsoln.com'
);

update public.user_profiles
set role_id = (select id from public.roles where name = 'super_admin' limit 1)
where email = 'superadmin@bacancyhealthsoln.com';

update public.user_profiles
set role_id = (select id from public.roles where name = 'org_admin' limit 1)
where email = 'orgadmin@bacancyhealthsoln.com';

update public.user_profiles
set role_id = (select id from public.roles where name = 'care_manager' limit 1)
where email = 'caremanager@bacancyhealthsoln.com';

update public.user_profiles
set role_id = (select id from public.roles where name = 'physician' limit 1)
where email = 'physician@bacancyhealthsoln.com';

update public.user_profiles
set role_id = (select id from public.roles where name = 'analyst' limit 1)
where email = 'analyst@bacancyhealthsoln.com';

-- ---------------------------------------------------------------------------
-- Patients (240+ for demo realism)
-- ---------------------------------------------------------------------------
with org as (
  select id as org_id from public.organizations where slug = 'riverside-health' limit 1
),
names as (
  select
    array['Maria','James','Aisha','Daniel','Chen','Sofia','Michael','Priya','Lucas','Isabella','Noah','Ava','Ethan','Maya','Omar','Grace','Liam','Zara','Elena','Mateo','Amir','Hannah','Leo','Nina'] as first_names,
    array['Lopez','Carter','Khan','Nguyen','Patel','Garcia','Hernandez','Smith','Johnson','Brown','Davis','Martinez','Gonzalez','Wilson','Anderson','Thomas','Jackson','White','Lee','Ramirez','Clark','Lewis','Young','Hall'] as last_names,
    array['Oak St','Maple Ave','Cedar Rd','Pine St','Sunset Blvd','Hillcrest Dr','Lakeview Ave','Riverside Dr','Cherry Ln','Highland Ave','Valley Rd','Elm St'] as streets,
    array['Riverside','Moreno Valley','Corona','Perris','Jurupa Valley','Norco'] as cities,
    array['92501','92503','92504','92505','92506','92507','92508','92509'] as zips
),
patient_rows as (
  select
    gs as n,
    (select org_id from org) as org_id,
    'RVH-' || lpad(gs::text, 6, '0') as mrn,
    (names.first_names[(gs % array_length(names.first_names, 1)) + 1]) as first_name,
    (names.last_names[(gs % array_length(names.last_names, 1)) + 1]) as last_name,
    (current_date - ((18 + (gs % 73)) * interval '1 year') - (((gs * 37) % 365) * interval '1 day'))::date as dob,
    case when gs % 2 = 0 then 'female' else 'male' end as gender,
    ('951-' || lpad(((gs * 73) % 1000)::text, 3, '0') || '-' || lpad(((gs * 97) % 10000)::text, 4, '0')) as phone,
    lower(
      (names.first_names[(gs % array_length(names.first_names, 1)) + 1])
      || '.' ||
      (names.last_names[(gs % array_length(names.last_names, 1)) + 1])
      || gs::text
      || '@riversidehealth.org'
    ) as email,
    jsonb_build_object(
      'street', (gs % 999 + 1)::text || ' ' || names.streets[(gs % array_length(names.streets, 1)) + 1],
      'city', names.cities[(gs % array_length(names.cities, 1)) + 1],
      'state', 'CA',
      'zip', names.zips[(gs % array_length(names.zips, 1)) + 1]
    ) as address,
    ('HMO-' || lpad(((gs * 19) % 10000)::text, 4, '0')) as insurance_id
  from generate_series(1, 240) gs
  cross join names
)
insert into public.patients (
  org_id, mrn, first_name, last_name, dob, gender, phone, email, address, insurance_id, pcp_id
)
select
  pr.org_id,
  pr.mrn,
  pr.first_name,
  pr.last_name,
  pr.dob,
  pr.gender,
  pr.phone,
  pr.email,
  pr.address,
  pr.insurance_id,
  coalesce(
    (select up.id from public.user_profiles up join public.roles r on r.id = up.role_id where r.name = 'physician' limit 1),
    (select up.id from public.user_profiles up order by up.created_at asc limit 1)
  )
from patient_rows pr
where not exists (select 1 from public.patients p where p.mrn = pr.mrn);

-- ---------------------------------------------------------------------------
-- Care Team Assignments (care manager + physician)
-- ---------------------------------------------------------------------------
insert into public.care_team_assignments (patient_id, user_id, role)
select
  p.id,
  coalesce(
    (select up.id from public.user_profiles up join public.roles r on r.id = up.role_id where r.name = 'care_manager' limit 1),
    (select up.id from public.user_profiles up order by up.created_at asc limit 1)
  ),
  'care_manager'
from public.patients p
where not exists (
  select 1 from public.care_team_assignments cta
  where cta.patient_id = p.id and cta.role = 'care_manager'
);

insert into public.care_team_assignments (patient_id, user_id, role)
select
  p.id,
  coalesce(
    (select up.id from public.user_profiles up join public.roles r on r.id = up.role_id where r.name = 'physician' limit 1),
    (select up.id from public.user_profiles up order by up.created_at asc limit 1)
  ),
  'physician'
from public.patients p
where not exists (
  select 1 from public.care_team_assignments cta
  where cta.patient_id = p.id and cta.role = 'physician'
);

-- ---------------------------------------------------------------------------
-- Patient Conditions (realistic mix)
-- ---------------------------------------------------------------------------
with condition_catalog as (
  select * from (values
    (1, 'E11', 'Type 2 Diabetes', 0.22),
    (2, 'I10', 'Hypertension', 0.28),
    (3, 'E78', 'Hyperlipidemia', 0.20),
    (4, 'I50', 'Heart Failure', 0.08),
    (5, 'J44', 'COPD', 0.06),
    (6, 'N18', 'Chronic Kidney Disease', 0.07),
    (7, 'J45', 'Asthma', 0.06),
    (8, 'F33', 'Major Depressive Disorder', 0.05)
  ) as v(idx, icd10_code, description, prevalence)
),
base as (
  select
    p.id,
    row_number() over (order by p.created_at, p.id) as rn
  from public.patients p
)
insert into public.patient_conditions (patient_id, icd10_code, description, status)
select
  b.id,
  cc.icd10_code,
  cc.description,
  'chronic'
from base b
join condition_catalog cc
  on ((b.rn % 8) + 1) = cc.idx
where not exists (
  select 1 from public.patient_conditions pc
  where pc.patient_id = b.id and pc.icd10_code = cc.icd10_code
);

with condition_catalog as (
  select * from (values
    (1, 'E11', 'Type 2 Diabetes', 0.22),
    (2, 'I10', 'Hypertension', 0.28),
    (3, 'E78', 'Hyperlipidemia', 0.20),
    (4, 'I50', 'Heart Failure', 0.08),
    (5, 'J44', 'COPD', 0.06),
    (6, 'N18', 'Chronic Kidney Disease', 0.07),
    (7, 'J45', 'Asthma', 0.06),
    (8, 'F33', 'Major Depressive Disorder', 0.05)
  ) as v(idx, icd10_code, description, prevalence)
)
insert into public.patient_conditions (patient_id, icd10_code, description, status)
select
  p.id,
  cc.icd10_code,
  cc.description,
  'active'
from public.patients p
cross join condition_catalog cc
where random() < cc.prevalence
and not exists (
  select 1 from public.patient_conditions pc
  where pc.patient_id = p.id and pc.icd10_code = cc.icd10_code
);

-- ---------------------------------------------------------------------------
-- Risk Scores (AI-like scoring with tiers)
-- ---------------------------------------------------------------------------
with patient_risk as (
  select
    p.id,
    date_part('year', age(p.dob))::int as age,
    bool_or(pc.icd10_code = 'E11') as has_diabetes,
    bool_or(pc.icd10_code = 'I10') as has_htn,
    bool_or(pc.icd10_code in ('I50','N18','J44')) as has_high_risk_cond,
    count(pc.*) as condition_count
  from public.patients p
  left join public.patient_conditions pc on pc.patient_id = p.id
  group by p.id, p.dob
),
score_calc as (
  select
    pr.id,
    greatest(5, least(98,
      15
      + (pr.age / 5) * 1.2
      + (pr.condition_count * 8)
      + case when pr.has_high_risk_cond then 18 else 0 end
      + case when pr.has_diabetes then 10 else 0 end
      + case when pr.has_htn then 6 else 0 end
      + (random() * 8)::int
    )) as score,
    pr.has_diabetes,
    pr.has_htn,
    pr.has_high_risk_cond
  from patient_risk pr
)
insert into public.risk_scores (patient_id, score, risk_tier, risk_factors, model_version, calculated_at)
select
  sc.id,
  sc.score,
  case when sc.score >= 75 then 'high'
       when sc.score >= 45 then 'medium'
       else 'low' end as risk_tier,
  (
    select jsonb_agg(f) from (
      values
        (case when sc.has_diabetes then jsonb_build_object('factor','A1C','weight','high','description','A1C above target') end),
        (case when sc.has_htn then jsonb_build_object('factor','BP','weight','medium','description','BP uncontrolled') end),
        (case when sc.has_high_risk_cond then jsonb_build_object('factor','Comorbidity','weight','high','description','Multiple high-risk conditions') end),
        (jsonb_build_object('factor','Medication Adherence','weight','medium','description','Refill gaps detected'))
    ) v(f) where f is not null
  ) as risk_factors,
  'seed-v2',
  now() - (random() * interval '10 days')
from score_calc sc
where not exists (
  select 1 from public.risk_scores rs
  where rs.patient_id = sc.id and rs.model_version = 'seed-v2'
);

-- ---------------------------------------------------------------------------
-- Care Gaps (realistic mix, includes overdue + closed)
-- ---------------------------------------------------------------------------
with base as (
  select
    p.id,
    p.gender,
    date_part('year', age(p.dob))::int as age,
    row_number() over (order by p.created_at, p.id) as rn,
    exists (select 1 from public.patient_conditions pc where pc.patient_id = p.id and pc.icd10_code = 'E11') as has_diabetes,
    exists (select 1 from public.patient_conditions pc where pc.patient_id = p.id and pc.icd10_code = 'I10') as has_htn
  from public.patients p
),
gap_candidates as (
  select id, rn, 'a1c_test'::text as gap_type, 'A1C test overdue'::text as description,
    (current_date - ((rn % 60)::int * interval '1 day'))::date as due_date
  from base where has_diabetes
  union all
  select id, rn, 'diabetic_eye_exam', 'Diabetic eye exam overdue',
    (current_date + ((rn % 40)::int * interval '1 day') - (20 * interval '1 day'))::date
  from base where has_diabetes
  union all
  select id, rn, 'bp_check', 'Blood pressure check overdue',
    (current_date - ((rn % 45)::int * interval '1 day'))::date
  from base where has_htn
  union all
  select id, rn, 'mammogram', 'Mammogram screening due',
    (current_date + ((rn % 90)::int * interval '1 day') - (30 * interval '1 day'))::date
  from base where gender = 'female' and age between 50 and 74
  union all
  select id, rn, 'colonoscopy', 'Colorectal screening due',
    (current_date + ((rn % 120)::int * interval '1 day') - (60 * interval '1 day'))::date
  from base where age between 45 and 75
  union all
  select id, rn, 'flu_vaccine', 'Annual flu vaccine due',
    (current_date + ((rn % 120)::int * interval '1 day') - (30 * interval '1 day'))::date
  from base
),
gap_rows as (
  select
    gc.*,
    (gc.rn % 9 = 0) as close_it
  from gap_candidates gc
)
insert into public.care_gaps (patient_id, gap_type, description, due_date, status, closed_at, closed_by)
select
  gr.id,
  gr.gap_type,
  gr.description,
  gr.due_date,
  case
    when gr.close_it and gr.due_date < current_date then 'closed'
    when gr.due_date < current_date and gr.rn % 4 = 0 then 'in_progress'
    when gr.due_date < current_date then 'open'
    else 'open'
  end as status,
  case when gr.close_it and gr.due_date < current_date then (gr.due_date + interval '3 days') else null end as closed_at,
  case when gr.close_it and gr.due_date < current_date then
    coalesce(
      (select up.id from public.user_profiles up join public.roles r on r.id = up.role_id where r.name = 'care_manager' limit 1),
      (select up.id from public.user_profiles up order by up.created_at asc limit 1)
    )
  else null end as closed_by
from gap_rows gr
where not exists (
  select 1 from public.care_gaps cg
  where cg.patient_id = gr.id and cg.gap_type = gr.gap_type and cg.due_date = gr.due_date
);

-- ---------------------------------------------------------------------------
-- Tasks (generated from care gaps)
-- ---------------------------------------------------------------------------
insert into public.tasks (
  patient_id, assigned_to, created_by, org_id, title, description,
  task_type, priority, status, due_date, completed_at
)
select
  cg.patient_id,
  case
    when cg.gap_type in ('a1c_test','diabetic_eye_exam','bp_check') then
      coalesce(
        (select up.id from public.user_profiles up join public.roles r on r.id = up.role_id where r.name = 'physician' limit 1),
        (select up.id from public.user_profiles up order by up.created_at asc limit 1)
      )
    else
      coalesce(
        (select up.id from public.user_profiles up join public.roles r on r.id = up.role_id where r.name = 'care_manager' limit 1),
        (select up.id from public.user_profiles up order by up.created_at asc limit 1)
      )
  end as assigned_to,
  coalesce(
    (select up.id from public.user_profiles up join public.roles r on r.id = up.role_id where r.name = 'care_manager' limit 1),
    (select up.id from public.user_profiles up order by up.created_at asc limit 1)
  ) as created_by,
  p.org_id,
  ('Care Gap: ' || replace(initcap(cg.gap_type), '_', ' ')) as title,
  'Follow up to close the care gap and document outcome.' as description,
  'care_gap' as task_type,
  case when cg.gap_type in ('a1c_test','diabetic_eye_exam','bp_check') then 'high' else 'medium' end as priority,
  case
    when cg.status = 'closed' then 'completed'
    when cg.status = 'in_progress' then 'in_progress'
    else 'pending'
  end as status,
  cg.due_date,
  case when cg.status = 'closed' then cg.closed_at else null end as completed_at
from public.care_gaps cg
join public.patients p on p.id = cg.patient_id
where not exists (
  select 1 from public.tasks t
  where t.patient_id = cg.patient_id
    and t.task_type = 'care_gap'
    and t.due_date = cg.due_date
    and t.title = ('Care Gap: ' || replace(initcap(cg.gap_type), '_', ' '))
);

-- ---------------------------------------------------------------------------
-- Outreach Log (for in-progress + completed)
-- ---------------------------------------------------------------------------
insert into public.outreach_log (patient_id, user_id, channel, outcome, notes, contacted_at)
select
  t.patient_id,
  t.assigned_to,
  case when t.status = 'completed' then 'phone' else 'email' end as channel,
  case when t.status = 'completed' then 'reached' else 'voicemail' end as outcome,
  'Followed up regarding ' || t.title as notes,
  now() - (random() * interval '20 days')
from public.tasks t
where t.task_type = 'care_gap'
  and t.status in ('in_progress','completed')
  and not exists (
    select 1 from public.outreach_log ol
    where ol.patient_id = t.patient_id
      and ol.notes = ('Followed up regarding ' || t.title)
  );

-- ---------------------------------------------------------------------------
-- Care Plans (high risk patients)
-- ---------------------------------------------------------------------------
insert into public.care_plans (patient_id, created_by, title, goals, interventions, status, ai_generated)
select
  rs.patient_id,
  coalesce(
    (select up.id from public.user_profiles up join public.roles r on r.id = up.role_id where r.name = 'physician' limit 1),
    (select up.id from public.user_profiles up order by up.created_at asc limit 1)
  ),
  'High Risk Care Plan',
  jsonb_build_array(
    jsonb_build_object('goal','A1C < 7.5','target_date', (current_date + interval '90 days')::date),
    jsonb_build_object('goal','BP < 130/80','target_date', (current_date + interval '60 days')::date)
  ),
  jsonb_build_array(
    jsonb_build_object('intervention','Care manager outreach','frequency','biweekly'),
    jsonb_build_object('intervention','Medication review','frequency','monthly'),
    jsonb_build_object('intervention','Lifestyle coaching','frequency','monthly')
  ),
  'active',
  true
from public.risk_scores rs
where rs.risk_tier = 'high'
and not exists (
  select 1 from public.care_plans cp
  where cp.patient_id = rs.patient_id and cp.title = 'High Risk Care Plan'
);

-- ---------------------------------------------------------------------------
-- Workflows (admin-configured triggers)
-- ---------------------------------------------------------------------------
insert into public.workflows (org_id, name, trigger_type, trigger_config, actions, is_active)
select
  org.id,
  wf.name,
  wf.trigger_type,
  wf.trigger_config,
  wf.actions,
  true
from (select id from public.organizations where slug = 'riverside-health' limit 1) org,
     (values
      ('High Risk Outreach','risk_threshold',
        jsonb_build_object('min_score', 80),
        jsonb_build_array(jsonb_build_object('action','create_task','task_type','care_gap','priority','high'))),
      ('Overdue A1C Follow-up','care_gap_detected',
        jsonb_build_object('gap_type','a1c_test','overdue_days',14),
        jsonb_build_array(jsonb_build_object('action','create_task','task_type','care_gap','priority','high'))),
      ('Annual Wellness Reminder','time_based',
        jsonb_build_object('interval_days',365),
        jsonb_build_array(jsonb_build_object('action','create_task','task_type','outreach','priority','medium')))
     ) as wf(name, trigger_type, trigger_config, actions)
where not exists (
  select 1 from public.workflows w
  where w.org_id = org.id and w.name = wf.name
);

-- ---------------------------------------------------------------------------
-- Quality Measures (last 6 months, trending)
-- ---------------------------------------------------------------------------
with org as (
  select id as org_id from public.organizations where slug = 'riverside-health' limit 1
),
months as (
  select date_trunc('month', current_date) - (gs * interval '1 month') as period_start
  from generate_series(0, 5) gs
),
measures as (
  select * from (values
    ('HEDIS_CDC_HbA1c','Diabetes A1C Control', 120),
    ('HEDIS_CBP','Blood Pressure Control', 110),
    ('HEDIS_BCS','Breast Cancer Screening', 90),
    ('HEDIS_COL','Colorectal Screening', 105)
  ) as v(measure_code, measure_name, denominator)
)
insert into public.quality_measures (
  org_id, measure_code, measure_name, numerator, denominator, rate, period_start, period_end, calculated_at
)
select
  org.org_id,
  m.measure_code,
  m.measure_name,
  greatest(0, (m.denominator * (0.55 + (0.03 * (5 - extract(month from (months.period_start)) % 6))))::int) as numerator,
  m.denominator,
  (greatest(0, (m.denominator * (0.55 + (0.03 * (5 - extract(month from (months.period_start)) % 6))))::int)::numeric / nullif(m.denominator,0)) * 100,
  months.period_start::date,
  (months.period_start + interval '1 month' - interval '1 day')::date,
  now()
from org
cross join months
cross join measures m
where not exists (
  select 1 from public.quality_measures qm
  where qm.org_id = org.org_id
    and qm.measure_code = m.measure_code
    and qm.period_start = months.period_start::date
);

-- ---------------------------------------------------------------------------
-- Cohorts + Membership
-- ---------------------------------------------------------------------------
insert into public.cohorts (org_id, name, description, filter_config, patient_count, created_by)
select
  org.id,
  c.name,
  c.description,
  c.filter_config,
  0,
  (select up.id from public.user_profiles up order by up.created_at asc limit 1)
from (select id from public.organizations where slug = 'riverside-health' limit 1) org,
     (values
      ('High Risk', 'Patients with high risk tier', jsonb_build_object('risk_tier','high')),
      ('Diabetes Cohort', 'Patients with Type 2 Diabetes', jsonb_build_object('conditions', array['E11'])),
      ('Hypertension Cohort', 'Patients with Hypertension', jsonb_build_object('conditions', array['I10'])),
      ('CHF Cohort', 'Patients with Heart Failure', jsonb_build_object('conditions', array['I50']))
     ) as c(name, description, filter_config)
where not exists (
  select 1 from public.cohorts co
  where co.org_id = org.id and co.name = c.name
);

insert into public.cohort_members (cohort_id, patient_id)
select
  (select id from public.cohorts where name = 'High Risk' limit 1),
  p.id
from public.patients p
join public.risk_scores rs on rs.patient_id = p.id
where rs.risk_tier = 'high'
on conflict do nothing;

insert into public.cohort_members (cohort_id, patient_id)
select
  (select id from public.cohorts where name = 'Diabetes Cohort' limit 1),
  p.id
from public.patients p
join public.patient_conditions pc on pc.patient_id = p.id
where pc.icd10_code = 'E11'
on conflict do nothing;

insert into public.cohort_members (cohort_id, patient_id)
select
  (select id from public.cohorts where name = 'Hypertension Cohort' limit 1),
  p.id
from public.patients p
join public.patient_conditions pc on pc.patient_id = p.id
where pc.icd10_code = 'I10'
on conflict do nothing;

insert into public.cohort_members (cohort_id, patient_id)
select
  (select id from public.cohorts where name = 'CHF Cohort' limit 1),
  p.id
from public.patients p
join public.patient_conditions pc on pc.patient_id = p.id
where pc.icd10_code = 'I50'
on conflict do nothing;

-- Update cohort counts
update public.cohorts c
set patient_count = sub.cnt
from (
  select cohort_id, count(*) as cnt
  from public.cohort_members
  group by cohort_id
) sub
where sub.cohort_id = c.id;

commit;
