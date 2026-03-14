"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Users } from "lucide-react";

export default function AdminPage() {
  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <Badge variant="secondary" className="w-fit">
          Admin
        </Badge>
        <h1 className="text-3xl font-semibold text-foreground">Administration</h1>
        <p className="text-muted-foreground">
          Manage users, roles, and organization-level settings.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border/60 bg-card/80">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Users className="h-5 w-5" />
              </span>
              <div>
                <p className="text-lg font-semibold text-foreground">User Management</p>
                <p className="text-sm text-muted-foreground">
                  Invite users, assign roles, and control access.
                </p>
              </div>
            </div>
            <Button variant="outline" render={<Link href="/admin/users">Go to Users</Link>} nativeButton={false} />
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/80">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Shield className="h-5 w-5" />
              </span>
              <div>
                <p className="text-lg font-semibold text-foreground">Policy Center</p>
                <p className="text-sm text-muted-foreground">
                  Review audit activity and role-based access policies.
                </p>
              </div>
            </div>
            <Button variant="ghost">View Audit Log</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
