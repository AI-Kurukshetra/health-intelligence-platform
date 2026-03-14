export const ROLES = {
  SUPER_ADMIN: "super_admin",
  ORG_ADMIN: "org_admin",
  CARE_MANAGER: "care_manager",
  PHYSICIAN: "physician",
  ANALYST: "analyst",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

