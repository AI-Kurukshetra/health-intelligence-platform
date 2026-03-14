"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRiskScores } from "@/hooks/use-risk-scores";
import { useCareGaps } from "@/hooks/use-care-gaps";
import { getErrorMessage } from "@/lib/utils";
import { Activity, LineChart, TrendingUp, Users, ClipboardCheck } from "lucide-react";

export default function AnalyticsPage() {
  const riskScores = useRiskScores();
  const careGaps = useCareGaps();
  const riskLoading = riskScores.isLoading;
  const gapsLoading = careGaps.isLoading;

  const counts = riskScores.data?.reduce(
    (acc, score) => {
      acc[score.risk_tier] += 1;
      return acc;
    },
    { high: 0, medium: 0, low: 0 }
  );

  const total = riskScores.data?.length ?? 0;
  const openGaps = careGaps.data?.filter((gap) => gap.status !== "closed").length ?? 0;
  const totalGaps = careGaps.data?.length ?? 0;
  const closedGaps = careGaps.data?.filter((gap) => gap.status === "closed").length ?? 0;
  const closureRate = totalGaps ? Math.round((closedGaps / totalGaps) * 100) : 0;
  const dueSoon = careGaps.data?.filter((gap) => {
    if (!gap.due_date || gap.status === "closed") return false;
    const due = new Date(gap.due_date);
    if (Number.isNaN(due.getTime())) return false;
    const diff = due.getTime() - Date.now();
    return diff <= 7 * 24 * 60 * 60 * 1000;
  }).length ?? 0;

  const tiers: Array<{
    id: "high" | "medium" | "low";
    label: string;
    color: string;
    dot: string;
  }> = [
    { id: "high", label: "High", color: "bg-chart-1", dot: "bg-chart-1" },
    { id: "medium", label: "Medium", color: "bg-chart-2", dot: "bg-chart-2" },
    { id: "low", label: "Low", color: "bg-chart-3", dot: "bg-chart-3" },
  ];

  const gapTrend = useMemo(() => {
    const months = Array.from({ length: 6 }).map((_, index) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - index));
      return {
        key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
        label: date.toLocaleString("en-US", { month: "short" }),
      };
    });

    const countsByMonth: Record<string, number> = {};
    (careGaps.data ?? []).forEach((gap) => {
      const ref = gap.due_date ?? gap.created_at;
      if (!ref) return;
      const date = new Date(ref);
      if (Number.isNaN(date.getTime())) return;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      countsByMonth[key] = (countsByMonth[key] ?? 0) + 1;
    });

    const max = Math.max(1, ...months.map((m) => countsByMonth[m.key] ?? 0));

    return months.map((m) => ({
      label: m.label,
      count: countsByMonth[m.key] ?? 0,
      pct: Math.round(((countsByMonth[m.key] ?? 0) / max) * 100),
    }));
  }, [careGaps.data]);

  const gapTypeSummary = useMemo(() => {
    const tally: Record<string, number> = {};
    (careGaps.data ?? []).forEach((gap) => {
      const key = gap.gap_type || "other";
      tally[key] = (tally[key] ?? 0) + 1;
    });
    return Object.entries(tally)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([type, count]) => ({
        type,
        count,
      }));
  }, [careGaps.data]);

  const totalRisk = total || 0;
  const highPct = totalRisk ? (counts?.high ?? 0) / totalRisk * 100 : 0;
  const mediumPct = totalRisk ? (counts?.medium ?? 0) / totalRisk * 100 : 0;
  const lowPct = Math.max(0, 100 - highPct - mediumPct);
  const highShare = totalRisk ? Math.round((counts?.high ?? 0) / totalRisk * 100) : 0;

  const lineMax = Math.max(1, ...gapTrend.map((m) => m.count));
  const summaryCards = [
    {
      label: "Total Patients",
      value: totalRisk,
      icon: Users,
      tone: "text-foreground",
      href: "/dashboard/patients",
    },
    {
      label: "High Risk Share",
      value: `${highShare}%`,
      icon: Activity,
      tone: "text-foreground",
      href: "/dashboard/patients?risk_tier=high",
    },
    {
      label: "Open Care Gaps",
      value: openGaps,
      icon: ClipboardCheck,
      tone: "text-foreground",
      href: "/dashboard/care-gaps?status=open",
    },
    {
      label: "Closure Rate",
      value: `${closureRate}%`,
      icon: LineChart,
      tone: "text-foreground",
      href: "/dashboard/care-gaps",
    },
  ];

  const linePoints = gapTrend.map((point, index) => {
    const x = (index / Math.max(1, gapTrend.length - 1)) * 100;
    const y = 38 - (point.count / lineMax) * 30;
    return `${x},${y}`;
  });
  const linePath = linePoints.length ? `M ${linePoints[0]} L ${linePoints.slice(1).join(" L ")}` : "";
  const areaPath = linePoints.length
    ? `M ${linePoints[0]} L ${linePoints.slice(1).join(" L ")} L 100,38 L 0,38 Z`
    : "";

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Badge variant="secondary" className="w-fit">
          Analytics
        </Badge>
        <h1 className="text-3xl font-semibold text-foreground">Population Insights</h1>
        <p className="text-muted-foreground">
          Risk distribution, care gap volume, and trend indicators for your organization.
        </p>
      </div>

      {(riskScores.isError || careGaps.isError) && (
        <p className="text-sm text-destructive">
          {getErrorMessage(riskScores.error ?? careGaps.error, "Failed to load analytics.")}
        </p>
      )}

      <Card className="border-border/60 bg-gradient-to-br from-primary/10 via-card to-background">
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Executive Summary</CardTitle>
            <CardDescription>Fast read on population health performance.</CardDescription>
          </div>
          <Badge variant="outline" className="w-fit text-xs uppercase tracking-[0.2em]">
            Live
          </Badge>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <div
                  className="rounded-xl border border-border/60 bg-background/70 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                      {item.label}
                    </p>
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                  </div>
                  <div className="mt-4">
                    {riskLoading || gapsLoading ? (
                      <Skeleton className="h-7 w-20" />
                    ) : (
                      <p className={`text-2xl font-semibold ${item.tone}`}>{item.value}</p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-start">
        <div className="flex flex-col gap-6">
          <Card className="border-border/60 bg-card/80">
            <CardHeader>
              <CardTitle>Risk Intelligence</CardTitle>
              <CardDescription>Tier distribution and population mix.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-4">
                {riskLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={`risk-skeleton-${index}`} className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-2 w-full" />
                      </div>
                    ))}
                  </div>
                ) : (
                  tiers.map((tier) => {
                    const count = counts ? counts[tier.id] : 0;
                    const pct = total ? Math.round((count / total) * 100) : 0;
                    return (
                      <div key={tier.id} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{tier.label}</span>
                          <span className="font-medium text-foreground">
                            {counts ? count : "N/A"} ({pct}%)
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted">
                          <div
                            className={`h-2 rounded-full ${tier.color}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="space-y-4">
                {riskLoading ? (
                  <div className="flex items-center justify-center">
                    <Skeleton className="h-32 w-32 rounded-full" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <div
                      className="relative h-32 w-32 rounded-full"
                      style={{
                        background: `conic-gradient(hsl(var(--chart-1)) 0 ${highPct}%, hsl(var(--chart-2)) ${highPct}% ${highPct + mediumPct}%, hsl(var(--chart-3)) ${highPct + mediumPct}% 100%)`,
                      }}
                    >
                      <div className="absolute inset-3 rounded-full bg-background/90" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-xs text-muted-foreground">
                        <span className="text-lg font-semibold text-foreground">{totalRisk}</span>
                        Total
                      </div>
                    </div>
                    <div className="grid w-full gap-2 text-xs">
                      {tiers.map((tier) => {
                        const count = counts ? counts[tier.id] : 0;
                        const pct = totalRisk ? Math.round((count / totalRisk) * 100) : 0;
                        return (
                          <div key={tier.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`h-2 w-2 rounded-full ${tier.dot}`} />
                              <span className="text-muted-foreground">{tier.label}</span>
                            </div>
                            <span className="text-foreground">
                              {count} ({pct}%)
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/80">
            <CardHeader>
              <CardTitle>Care Gap Mix</CardTitle>
              <CardDescription>Top gap types driving workload.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {gapsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={`gap-mix-skeleton-${index}`} className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-2 w-full" />
                    </div>
                  ))}
                </div>
              ) : gapTypeSummary.length ? (
                gapTypeSummary.map((gap) => {
                  const pct = totalGaps ? Math.round((gap.count / totalGaps) * 100) : 0;
                  return (
                    <div key={gap.type} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{gap.type.replace(/_/g, " ")}</span>
                        <span className="font-medium text-foreground">
                          {gap.count} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full bg-primary"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground">No gap data available yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card className="border-border/60 bg-card/80">
            <CardHeader>
              <CardTitle>Care Gap Volume</CardTitle>
              <CardDescription>Open gaps requiring follow-up.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {gapsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-3xl font-semibold text-foreground">
                  {careGaps.data ? openGaps : "N/A"}
                </div>
              )}
              <div className="grid gap-3 rounded-lg border border-border/60 bg-background/70 p-3 text-xs text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Closure rate</span>
                  <span className="font-medium text-foreground">
                    {gapsLoading ? "..." : `${closureRate}%`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Due within 7 days</span>
                  <span className="font-medium text-foreground">
                    {gapsLoading ? "..." : dueSoon}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Total tracked</span>
                  <span className="font-medium text-foreground">
                    {gapsLoading ? "..." : totalGaps}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-background/70 p-3 text-xs text-muted-foreground">
                <Activity className="h-4 w-4 text-primary" />
                Updated with every outreach log.
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/80">
            <CardHeader>
              <CardTitle>Momentum</CardTitle>
              <CardDescription>Trend snapshot for the last 30 days.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Care gap closure", value: "+12%", icon: TrendingUp },
                { label: "Outreach completion", value: "+8%", icon: TrendingUp },
                { label: "Quality measure lift", value: "+5%", icon: LineChart },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-lg border border-border/60 bg-background/70 px-3 py-2"
                  >
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon className="h-4 w-4 text-primary" />
                      {item.label}
                    </div>
                    <span className="text-sm font-semibold text-foreground">{item.value}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-border/60 bg-card/80">
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Care Gap Trend</CardTitle>
            <CardDescription>Volume by due month.</CardDescription>
          </div>
          <Badge variant="outline" className="w-fit text-xs uppercase tracking-[0.2em]">
            Last 6 months
          </Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          {gapsLoading ? (
            <>
              <Skeleton className="h-24 w-full" />
              <div className="grid grid-cols-6 gap-2">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={`gap-label-skeleton-${index}`} className="h-3 w-10" />
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <svg viewBox="0 0 100 38" className="h-24 w-full">
                <path
                  d={areaPath}
                  fill="hsl(var(--primary) / 0.15)"
                />
                <path
                  d={linePath}
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                />
              </svg>
              <div className="grid grid-cols-6 gap-2 text-xs text-muted-foreground">
                {gapTrend.map((month) => (
                  <div key={month.label} className="text-center">
                    <div className="text-foreground">{month.count}</div>
                    {month.label}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
