"use client";

import { useCurrentUser } from "@/hooks/use-current-user";
import { ProfileSkeleton } from "@/components/dashboard/profile-skeleton";
import { getErrorMessage } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, User } from "lucide-react";

export default function ProfilePage() {
  const { data, isLoading, isError, error } = useCurrentUser();

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        {getErrorMessage(error, "Failed to load profile.")}
      </p>
    );
  }

  if (!data?.user) {
    return null;
  }

  const { user, profile } = data;

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <Badge variant="secondary" className="w-fit">
          Profile
        </Badge>
        <h1 className="text-3xl font-semibold text-foreground">Account Overview</h1>
        <p className="text-muted-foreground">Your account details and role context.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2" data-tour="profile-cards">
        <Card className="border-border/60 bg-card/80">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Email</CardTitle>
            <Mail className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Primary contact</p>
            <p className="mt-2 text-lg font-semibold text-foreground">{user.email ?? "N/A"}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/80">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Display name</CardTitle>
            <User className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Shown in dashboards</p>
            <p className="mt-2 text-lg font-semibold text-foreground">{profile?.full_name ?? "N/A"}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/80">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Role</CardTitle>
            <User className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Access level</p>
            <p className="mt-2 text-lg font-semibold text-foreground capitalize">{(profile?.role ?? "care_manager").replace(/_/g, " ")}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
