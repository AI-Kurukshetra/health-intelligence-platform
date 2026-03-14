"use client";

import { useUsers } from "@/hooks/use-users";
import { UsersTable } from "@/components/admin/users/users-table";
import { EmptyState } from "@/components/common/empty-state";
import { Users as UsersIcon } from "lucide-react";
import { getErrorMessage } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminUsersPage() {
  const { data, isLoading, isError, error } = useUsers();
  const users = data ?? [];
  const adminCount = users.filter((user) => user.role === "org_admin" || user.role === "super_admin").length;

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-56 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        {getErrorMessage(error, "Failed to load users.")}
      </p>
    );
  }

  if (!users.length) {
    return (
      <EmptyState
        icon={UsersIcon}
        title="No users found"
        description="Profiles will appear here after users sign up."
      />
    );
  }

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <Badge variant="secondary" className="w-fit">
          Admin
        </Badge>
        <h1 className="text-3xl font-semibold text-foreground">User Directory</h1>
        <p className="text-muted-foreground">View all users and manage their roles.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {[
          { label: "Total users", value: users.length },
          { label: "Admin roles", value: adminCount },
          { label: "Care team", value: users.length - adminCount },
        ].map((stat) => (
          <Card key={stat.label} className="border-border/60 bg-card/80">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-foreground">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/60 bg-card/80" data-tour="admin-users">
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <UsersTable users={users} />
        </CardContent>
      </Card>
    </div>
  );
}
