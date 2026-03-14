export const ROUTES = {
  HOME: "/",
  SIGN_IN: "/auth/sign-in",
  SIGN_UP: "/auth/sign-up",
  EMAIL_VERIFIED: "/auth/email-verified",
  DASHBOARD: "/dashboard",
  DASHBOARD_PATIENTS: "/dashboard/patients",
  DASHBOARD_CARE_GAPS: "/dashboard/care-gaps",
  DASHBOARD_TASKS: "/dashboard/tasks",
  DASHBOARD_COHORTS: "/dashboard/cohorts",
  DASHBOARD_WORKFLOWS: "/dashboard/workflows",
  DASHBOARD_ANALYTICS: "/dashboard/analytics",
  ADMIN: "/admin",
  PROFILE: "/profile",
} as const;

export type RouteKey = keyof typeof ROUTES;

