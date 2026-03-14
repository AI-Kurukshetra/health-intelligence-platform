"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCohorts } from "@/hooks/use-cohorts";
import { getErrorMessage } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Layers, Users } from "lucide-react";

export default function CohortsPage() {
  const searchParams = useSearchParams();
  const searchParam = searchParams.get("search") ?? "";
  const cohorts = useCohorts({ search: searchParam || undefined });
  const data = cohorts.data ?? [];
  const totalPatients = data.reduce((acc, cohort) => acc + (cohort.patient_count ?? 0), 0);
  const stats = [
    { label: "Total cohorts", value: data.length, icon: Layers, href: "/dashboard/cohorts" },
    { label: "Patients covered", value: totalPatients, icon: Users, href: "/dashboard/patients" },
    { label: "Active programs", value: data.length ? Math.min(data.length, 6) : 0, icon: Layers, href: "/dashboard/cohorts" },
  ];

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <Badge variant="secondary" className="w-fit">
          Cohorts
        </Badge>
        <h1 className="text-3xl font-semibold text-foreground">Cohort Intelligence</h1>
        <p className="text-muted-foreground">Segment populations by condition, risk, or care program.</p>
      </div>

      {cohorts.isError && (
        <p className="text-sm text-destructive">
          {getErrorMessage(cohorts.error, "Failed to load cohorts.")}
        </p>
      )}

      {cohorts.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Link
                  key={stat.label}
                  href={stat.href}
                  className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <Card className="border-border/60 bg-card/80 transition hover:-translate-y-0.5 hover:shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {stat.label}
                      </CardTitle>
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                      </span>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-semibold text-foreground">{stat.value}</div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {data.map((cohort) => (
              <Card key={cohort.id} className="border-border/60 bg-card/80">
                <CardContent className="space-y-3 p-6">
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-semibold text-foreground">{cohort.name}</p>
                    <Badge variant="outline">{cohort.patient_count ?? 0} patients</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {cohort.description ?? "No description provided."}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    Cohort ready for outreach workflows.
                  </div>
                </CardContent>
              </Card>
            ))}
            {!cohorts.isLoading && !data.length && (
              <p className="text-sm text-muted-foreground">No cohorts available.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
