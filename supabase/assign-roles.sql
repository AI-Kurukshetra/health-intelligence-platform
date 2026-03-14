-- Assign roles to demo accounts
-- Update the emails below if you used different addresses.

-- Ensure profiles exist for auth users (if trigger did not run)
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

-- Ensure users are scoped to the default org
update public.user_profiles
set org_id = (select id from public.organizations where slug = 'riverside-health' limit 1)
where email in (
  'superadmin@bacancyhealthsoln.com',
  'orgadmin@bacancyhealthsoln.com',
  'caremanager@bacancyhealthsoln.com',
  'physician@bacancyhealthsoln.com',
  'analyst@bacancyhealthsoln.com'
);

-- Assign roles
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
