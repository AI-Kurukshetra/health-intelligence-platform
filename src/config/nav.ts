import type { Role } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";
import {
  LayoutDashboard,
  Shield,
  Users,
  ListChecks,
  Layers,
  GitBranch,
  LineChart,
  User,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  /** Roles that can see this item. Empty = all authenticated. */
  roles?: Role[];
}

/**
 * Sidebar navigation config. Items are shown when user's role is in `roles`.
 * Omit `roles` to show to everyone (authenticated).
 */
export const sidebarNav: NavItem[] = [
  {
    label: "Overview",
    href: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    label: "Patients",
    href: ROUTES.DASHBOARD_PATIENTS,
    icon: Users,
    roles: ["org_admin", "care_manager", "physician", "analyst", "super_admin"],
  },
  {
    label: "Care Gaps",
    href: ROUTES.DASHBOARD_CARE_GAPS,
    icon: ListChecks,
    roles: ["org_admin", "care_manager", "physician", "super_admin"],
  },
  {
    label: "Tasks",
    href: ROUTES.DASHBOARD_TASKS,
    icon: ListChecks,
    roles: ["org_admin", "care_manager", "physician", "super_admin"],
  },
  {
    label: "Cohorts",
    href: ROUTES.DASHBOARD_COHORTS,
    icon: Layers,
    roles: ["org_admin", "analyst", "super_admin"],
  },
  {
    label: "Workflows",
    href: ROUTES.DASHBOARD_WORKFLOWS,
    icon: GitBranch,
    roles: ["org_admin", "super_admin"],
  },
  {
    label: "Analytics",
    href: ROUTES.DASHBOARD_ANALYTICS,
    icon: LineChart,
    roles: ["org_admin", "analyst", "super_admin"],
  },
  {
    label: "Admin",
    href: ROUTES.ADMIN,
    icon: Shield,
    roles: ["org_admin", "super_admin"],
  },
  {
    label: "Users",
    href: `${ROUTES.ADMIN}/users`,
    icon: Shield,
    roles: ["org_admin", "super_admin"],
  },
];

export const sidebarNavFooter: NavItem[] = [
  {
    label: "Profile",
    href: ROUTES.PROFILE,
    icon: User,
    roles: ["org_admin", "care_manager", "physician", "analyst", "super_admin"],
  },
];

export function getVisibleNavItems(
  items: NavItem[],
  userRole: Role
): NavItem[] {
  return items.filter(
    (item) => !item.roles || item.roles.length === 0 || item.roles.includes(userRole)
  );
}
