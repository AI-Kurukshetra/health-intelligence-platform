"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { Role } from "@/constants/roles";
import { getVisibleNavItems, sidebarNav, sidebarNavFooter } from "@/config/nav";

type TourStep = {
  id: string;
  title: string;
  description: string;
  selector?: string;
  route?: string;
  roles?: Role[];
};

type ProductTourProps = {
  role: Role;
};

const STORAGE_DISMISSED_KEY = "healthiq-tour-dismissed";
const STORAGE_ACTIVE_KEY = "healthiq-tour-active";
const STORAGE_STEP_KEY = "healthiq-tour-step";

const baseSteps: TourStep[] = [
  {
    id: "sidebar",
    title: "Navigation",
    description: "Use the sidebar to jump across core workflows in seconds.",
    selector: "[data-tour=\"sidebar\"]",
    route: "/dashboard",
  },
  {
    id: "kpis",
    title: "Population Overview",
    description: "Live KPIs summarize risk, care gaps, and task volume.",
    selector: "[data-tour=\"dashboard-kpis\"]",
    route: "/dashboard",
  },
  {
    id: "patients",
    title: "Patient Directory",
    description: "Review risk tiers, demographics, and clinical context.",
    selector: "[data-tour=\"patients-table\"]",
    route: "/dashboard/patients",
    roles: ["org_admin", "care_manager", "physician", "analyst", "super_admin"],
  },
  {
    id: "care-gaps",
    title: "Care Gaps",
    description: "Track overdue screenings and close gaps faster.",
    selector: "[data-tour=\"care-gaps-table\"]",
    route: "/dashboard/care-gaps",
    roles: ["org_admin", "care_manager", "physician", "super_admin"],
  },
  {
    id: "tasks",
    title: "Tasks",
    description: "Manage outreach and follow-up work for your team.",
    selector: "[data-tour=\"tasks-table\"]",
    route: "/dashboard/tasks",
    roles: ["org_admin", "care_manager", "physician", "super_admin"],
  },
  {
    id: "tasks-create",
    title: "Create Tasks",
    description: "Quickly add a new task when a gap needs action.",
    selector: "[data-tour=\"tasks-create\"]",
    route: "/dashboard/tasks",
    roles: ["org_admin", "care_manager", "physician", "super_admin"],
  },
  {
    id: "analytics",
    title: "Analytics",
    description: "Measure performance across risk tiers and care gaps.",
    selector: "[data-tour=\"analytics-summary\"]",
    route: "/dashboard/analytics",
    roles: ["org_admin", "analyst", "super_admin"],
  },
  {
    id: "workflows",
    title: "Automation Studio",
    description: "Configure workflows that trigger care tasks automatically.",
    selector: "[data-tour=\"workflows-list\"]",
    route: "/dashboard/workflows",
    roles: ["org_admin", "super_admin"],
  },
  {
    id: "admin-users",
    title: "Admin Users",
    description: "Manage roles and access for your organization.",
    selector: "[data-tour=\"admin-users\"]",
    route: "/admin/users",
    roles: ["org_admin", "super_admin"],
  },
  {
    id: "profile",
    title: "Profile",
    description: "Review your account details and assigned role.",
    selector: "[data-tour=\"profile-cards\"]",
    route: "/profile",
  },
];

const navStepCopy: Record<string, { title: string; description: string }> = {
  overview: {
    title: "Overview",
    description: "Monitor live KPIs and overall population health activity.",
  },
  patients: {
    title: "Patients",
    description: "Drill into patient profiles, risk tiers, and care history.",
  },
  "care-gaps": {
    title: "Care Gaps",
    description: "Prioritize overdue screenings and closure workflows.",
  },
  tasks: {
    title: "Tasks",
    description: "Coordinate outreach, follow-ups, and care actions.",
  },
  cohorts: {
    title: "Cohorts",
    description: "Group patients by risk and condition for targeted outreach.",
  },
  workflows: {
    title: "Workflows",
    description: "Automate care actions based on risk and gap triggers.",
  },
  analytics: {
    title: "Analytics",
    description: "Track performance trends and population insights.",
  },
  admin: {
    title: "Admin",
    description: "Manage organization settings and access controls.",
  },
  users: {
    title: "Users",
    description: "Review roles and permissions for your care team.",
  },
  profile: {
    title: "Profile",
    description: "Confirm your account details and assigned role.",
  },
};

const tourNavKeysByRole: Partial<Record<Role, string[]>> = {
  care_manager: ["overview", "care-gaps", "tasks", "profile"],
  physician: ["overview", "patients", "care-gaps", "tasks", "profile"],
  analyst: ["overview", "patients", "cohorts", "analytics", "profile"],
  org_admin: [
    "overview",
    "patients",
    "care-gaps",
    "tasks",
    "cohorts",
    "workflows",
    "analytics",
    "admin",
    "users",
    "profile",
  ],
  super_admin: [
    "overview",
    "patients",
    "care-gaps",
    "tasks",
    "cohorts",
    "workflows",
    "analytics",
    "admin",
    "users",
    "profile",
  ],
};

function waitForTarget(selector: string, timeoutMs: number) {
  return new Promise<HTMLElement | null>((resolve) => {
    const start = performance.now();

    const check = () => {
      const target = document.querySelector<HTMLElement>(selector);
      if (target) {
        const rect = target.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          resolve(target);
          return;
        }
      }
      if (performance.now() - start >= timeoutMs) {
        resolve(null);
        return;
      }
      requestAnimationFrame(check);
    };

    check();
  });
}

export function ProductTour({ role }: ProductTourProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const targetRef = useRef<HTMLElement | null>(null);
  const lastPushedRoute = useRef<string | null>(null);
  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties | null>(null);

  const steps = useMemo(() => {
    const contentSteps = baseSteps.filter(
      (step) => !step.roles || step.roles.includes(role)
    );
    const contentByRoute = new Map<string, TourStep>();
    contentSteps.forEach((step) => {
      if (step.route && !contentByRoute.has(step.route)) {
        contentByRoute.set(step.route, step);
      }
    });

    const navItems = getVisibleNavItems(
      [...sidebarNav, ...sidebarNavFooter],
      role
    );
    const allowedNavKeys = tourNavKeysByRole[role];
    const navSteps: TourStep[] = navItems
      .map((item) => {
        const key = item.label
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
        return { item, key };
      })
      .filter(({ key }) => !allowedNavKeys || allowedNavKeys.includes(key))
      .map(({ item, key }) => {
      const copy = navStepCopy[key] ?? {
        title: item.label,
        description: "Navigate to this area to continue the tour.",
      };
      return {
        id: `nav-${key}`,
        title: copy.title,
        description: copy.description,
        selector: `[data-tour=\"nav-${key}\"]`,
        route: item.href,
      };
    });

    const usedRoutes = new Set<string>();
    const ordered: TourStep[] = [];

    const intro = contentSteps.find((step) => step.id === "sidebar");
    if (intro) {
      ordered.push(intro);
      if (intro.route) usedRoutes.add(intro.route);
    }

    navSteps.forEach((navStep) => {
      ordered.push(navStep);
      if (navStep.route) usedRoutes.add(navStep.route);
      const contentStep = navStep.route
        ? contentByRoute.get(navStep.route)
        : undefined;
      if (contentStep && contentStep.id !== "sidebar") {
        ordered.push(contentStep);
      }
    });

    contentSteps.forEach((step) => {
      if (step.id === "sidebar") return;
      if (step.route && usedRoutes.has(step.route)) return;
      if (ordered.some((existing) => existing.id === step.id)) return;
      ordered.push(step);
    });

    return ordered;
  }, [role]);

  const start = useCallback(() => {
    if (steps.length === 0) return;
    if (active) return;
    let nextIndex = 0;
    try {
      const stored = sessionStorage.getItem(STORAGE_STEP_KEY);
      if (stored) {
        const parsed = Number.parseInt(stored, 10);
        if (!Number.isNaN(parsed) && parsed >= 0 && parsed < steps.length) {
          nextIndex = parsed;
        }
      }
    } catch {
      // ignore
    }
    setStepIndex(nextIndex);
    setActive(true);
    try {
      localStorage.setItem(STORAGE_ACTIVE_KEY, "true");
      localStorage.removeItem(STORAGE_DISMISSED_KEY);
    } catch {
      // ignore
    }
  }, [steps.length, active]);

  const stop = useCallback((dismissed: boolean) => {
    setActive(false);
    setTargetRect(null);
    targetRef.current = null;
    try {
      localStorage.removeItem(STORAGE_ACTIVE_KEY);
      sessionStorage.removeItem(STORAGE_STEP_KEY);
      if (dismissed) {
        localStorage.setItem(STORAGE_DISMISSED_KEY, "true");
      }
    } catch {
      // ignore
    }
  }, []);

  const goNext = useCallback(() => {
    setStepIndex((current) => {
      if (current + 1 >= steps.length) {
        stop(true);
        return current;
      }
      return current + 1;
    });
  }, [steps.length, stop]);

  const goBack = useCallback(() => {
    setStepIndex((current) => Math.max(0, current - 1));
  }, []);

  useEffect(() => {
    const handler = () => start();
    window.addEventListener("product-tour:start", handler);
    return () => window.removeEventListener("product-tour:start", handler);
  }, [start]);

  useEffect(() => {
    if (!active) return;
    const step = steps[stepIndex];
    if (!step) {
      stop(true);
      return;
    }

    if (step.route && pathname !== step.route) {
      if (lastPushedRoute.current !== step.route) {
        lastPushedRoute.current = step.route;
        router.push(step.route);
      }
      return;
    }

    lastPushedRoute.current = null;
    if (!step.selector) {
      targetRef.current = null;
      setTargetRect(null);
      return;
    }

    let cancelled = false;
    void waitForTarget(step.selector, 2500).then((target) => {
      if (cancelled) return;
      if (!target) {
        goNext();
        return;
      }
      targetRef.current = target;
      setTargetRect(target.getBoundingClientRect());
    });

    return () => {
      cancelled = true;
    };
  }, [active, stepIndex, steps, pathname, router, goNext, stop]);

  useEffect(() => {
    if (!active) return;
    const update = () => {
      if (targetRef.current) {
        setTargetRect(targetRef.current.getBoundingClientRect());
      }
    };
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [active]);

  useLayoutEffect(() => {
    if (!active || !tooltipRef.current) {
      setTooltipStyle(null);
      return;
    }

    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const padding = 12;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (!targetRect) {
      const left = Math.max(padding, (viewportWidth - tooltipRect.width) / 2);
      const top = Math.max(padding, (viewportHeight - tooltipRect.height) / 2);
      setTooltipStyle({ left, top });
      return;
    }

    const centerX = targetRect.left + targetRect.width / 2;
    let left = centerX - tooltipRect.width / 2;
    left = Math.max(padding, Math.min(left, viewportWidth - tooltipRect.width - padding));

    let top = targetRect.bottom + 12;
    if (top + tooltipRect.height > viewportHeight - padding) {
      top = targetRect.top - tooltipRect.height - 12;
    }
    top = Math.max(padding, Math.min(top, viewportHeight - tooltipRect.height - padding));

    setTooltipStyle({ left, top });
  }, [active, targetRect, stepIndex]);

  useEffect(() => {
    if (searchParams.get("tour") === "1") {
      start();
    } else {
      try {
        const dismissed = localStorage.getItem(STORAGE_DISMISSED_KEY) === "true";
        const shouldResume = localStorage.getItem(STORAGE_ACTIVE_KEY) === "true";
        if (shouldResume && !dismissed) {
          start();
        }
      } catch {
        // ignore
      }
    }
  }, [searchParams, start]);

  useEffect(() => {
    if (!active) return;
    try {
      sessionStorage.setItem(STORAGE_STEP_KEY, String(stepIndex));
    } catch {
      // ignore
    }
  }, [active, stepIndex]);

  useEffect(() => {
    if (!active) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        stop(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [active, stop]);

  if (!active || steps.length === 0) {
    return null;
  }

  const step = steps[stepIndex];
  const highlightStyle: React.CSSProperties | null = targetRect
    ? {
        top: Math.max(0, targetRect.top - 8),
        left: Math.max(0, targetRect.left - 8),
        width: Math.min(window.innerWidth, targetRect.width + 16),
        height: Math.min(window.innerHeight, targetRect.height + 16),
      }
    : null;

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-slate-950/40" />
      {highlightStyle && (
        <div
          className="absolute rounded-xl border border-white/60 bg-transparent shadow-[0_0_0_9999px_rgba(15,23,42,0.55)]"
          style={highlightStyle}
        />
      )}
      <div
        ref={tooltipRef}
        className="fixed z-[101] w-[320px] rounded-xl border border-border bg-background p-4 shadow-xl"
        style={tooltipStyle ?? undefined}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Step {stepIndex + 1} of {steps.length}
            </p>
            <h3 className="mt-2 text-base font-semibold text-foreground">{step.title}</h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => stop(true)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => stop(true)}>
            Skip
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goBack} disabled={stepIndex === 0}>
              Back
            </Button>
            <Button size="sm" onClick={goNext}>
              {stepIndex + 1 >= steps.length ? "Finish" : "Next"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
