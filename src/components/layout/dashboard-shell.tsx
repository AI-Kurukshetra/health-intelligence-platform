"use client";

import Link from "next/link";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { ContentContainer } from "@/components/shared/content-container";
import { ThemeSwitcher } from "@/components/shared/theme-switcher";
import { LayoutBreadcrumbs } from "@/components/layout/breadcrumbs";
import { GlobalSearch } from "@/components/layout/global-search";
import { Providers } from "@/components/common/providers";
import { useSidebar } from "@/hooks/use-sidebar";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ProductTour } from "@/components/shared/product-tour";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "@supabase/supabase-js";
import type { UserProfile } from "@/types/healthiq";
import { ROUTES } from "@/constants/routes";
import type { Role } from "@/constants/roles";

type DashboardShellProps = {
  user: User;
  profile: UserProfile | null;
  children: React.ReactNode;
};

export function DashboardShell({ user, profile, children }: DashboardShellProps) {
  const initial = (profile?.full_name || user.email || "U").slice(0, 1).toUpperCase();
  const role = (profile?.role ?? "care_manager") as Role;
  const roleLabel = role.replace(/_/g, " ");
  const { collapsed, toggle } = useSidebar();
  const { signOut } = useAuth();

  return (
    <Providers>
      <div className="flex h-screen min-h-0 w-full overflow-hidden">
        <ProductTour role={role} />
        <AppSidebar userRole={role} collapsed={collapsed} onToggle={toggle} />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-muted/30">
          <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border bg-background/80 px-6 md:px-10 backdrop-blur">
            <div className="flex min-w-0 flex-1 items-center gap-4">
              <LayoutBreadcrumbs />
              <div className="hidden w-full max-w-md items-center md:flex">
                <GlobalSearch />
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("product-tour:start"));
                }}
                data-tour="tour-launch"
              >
                Take tour
              </Button>
              <ThemeSwitcher />
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={profile?.avatar_url ?? undefined} alt={user.email ?? ""} />
                        <AvatarFallback>{initial}</AvatarFallback>
                      </Avatar>
                    </Button>
                  }
                />
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5 text-sm font-medium">
                    {profile?.full_name || user.email}
                  </div>
                  <div className="px-2 py-1 text-xs text-muted-foreground">{user.email}</div>
                  <div className="px-2 pb-2 text-xs text-muted-foreground capitalize">Role: {roleLabel}</div>
                  <DropdownMenuItem>
                    <Link href={ROUTES.PROFILE} className="block w-full">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <button
                      type="button"
                      onClick={() => {
                        void signOut();
                      }}
                      className="w-full cursor-pointer text-left"
                    >
                      Sign out
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="min-h-0 flex-1 overflow-auto px-6 py-8 md:px-10">
            <ContentContainer className="space-y-8">{children}</ContentContainer>
          </main>
        </div>
      </div>
    </Providers>
  );
}
