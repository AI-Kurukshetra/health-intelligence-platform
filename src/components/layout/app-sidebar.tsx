"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  sidebarNav,
  sidebarNavFooter,
  getVisibleNavItems,
} from "@/config/nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, PanelLeftClose, PanelLeft } from "lucide-react";
import type { Role } from "@/constants/roles";

type AppSidebarProps = {
  userRole: Role;
  collapsed: boolean;
  onToggle: () => void;
};

export function AppSidebar({ userRole, collapsed, onToggle }: AppSidebarProps) {
  const pathname = usePathname();
  const mainItems = getVisibleNavItems(sidebarNav, userRole);
  const footerItems = getVisibleNavItems(sidebarNavFooter, userRole);
  const allItems = [...mainItems, ...footerItems];
  const activeHref =
    allItems
      .filter((item) =>
        pathname === item.href ||
        (item.href !== "/" && pathname.startsWith(`${item.href}/`))
      )
      .sort((a, b) => b.href.length - a.href.length)[0]?.href ?? "";

  return (
    <aside
      data-tour="sidebar"
      className={cn(
        "flex h-full shrink-0 flex-col border-r border-border bg-sidebar transition-[width] duration-200 ease-in-out",
        collapsed ? "w-[3.25rem]" : "w-56"
      )}
    >
      <div className="flex items-center justify-between gap-2 px-3 py-3">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
            <Brain className="h-5 w-5" />
          </span>
          {!collapsed && (
            <div>
              <p className="text-sm font-semibold text-sidebar-foreground">HealthIQ</p>
              <p className="text-xs text-sidebar-foreground/70">Population Health</p>
            </div>
          )}
        </Link>
        {!collapsed && <Badge variant="secondary">AI</Badge>}
      </div>
      <div className="flex flex-1 flex-col gap-1 overflow-hidden px-2 pb-2">
        {!collapsed && (
          <div className="px-2 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-sidebar-foreground/60">
            Navigation
          </div>
        )}
        {mainItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === activeHref;
          const tourKey = item.label
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
          return (
            <Link
              key={item.href + item.label}
              href={item.href}
              title={collapsed ? item.label : undefined}
              data-tour={`nav-${tourKey}`}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                collapsed && "justify-center px-2",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
            >
              {Icon && <Icon className="h-4 w-4 shrink-0" />}
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </div>
      {footerItems.length > 0 && (
        <div className="border-t border-sidebar-border p-2">
          {!collapsed && (
            <div className="px-2 pb-2 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-sidebar-foreground/60">
              Account
            </div>
          )}
          {footerItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === activeHref;
            const tourKey = item.label
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)/g, "");
            return (
              <Link
                key={item.href + item.label}
                href={item.href}
                title={collapsed ? item.label : undefined}
                data-tour={`nav-${tourKey}`}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  collapsed && "justify-center px-2",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                {Icon && <Icon className="h-4 w-4 shrink-0" />}
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </div>
      )}
      <div className="border-t border-sidebar-border p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "h-9 w-9 shrink-0 text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
            collapsed && "w-full"
          )}
        >
          {collapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </Button>
      </div>
    </aside>
  );
}
