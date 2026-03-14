# Phase 1: Authentication and RBAC

## Goal
Deliver role-based access across dashboard routes with Supabase Auth and HealthIQ roles.

## Scope
- Supabase Auth (email/password) + session handling.
- User profiles tied to orgs and roles.
- Route protection for dashboard/admin/profile paths.
- Role-aware navigation and access checks.

## Data Model
- `roles`
- `organizations`
- `user_profiles`

## API Routes
- `GET /api/profile/current`
- `GET /api/users`
- `PATCH /api/users/:id/role`

## UI/UX
- Sign-in / sign-up pages.
- Admin Users page (role assignment).
- Role-aware sidebar navigation.

## Tasks
1. Ensure roles and orgs exist in DB.
2. Verify profile creation trigger on auth signup.
3. Confirm route guards in `middleware.ts` and `requireRole`.
4. Validate role list in Admin -> Users.
5. Verify role-aware nav visibility for each role.
6. Add QA pass for sign-up/sign-in and redirects.

## Exit Criteria
- Users can sign in.
- Users see only allowed routes.
- Admin can change roles successfully.
