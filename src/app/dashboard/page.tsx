"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useKpis, useQualityMeasures } from "@/hooks/use-analytics";
import { getErrorMessage } from "@/lib/utils";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Bell,
  CheckCircle2,
  ClipboardCheck,
  LineChart,
  AlertTriangle,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Minus,
  Users,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const kpis = useKpis();
  const qualityMeasures = useQualityMeasures();
  const kpiLoading = kpis.isLoading;
  const measureLoading = qualityMeasures.isLoading;
  const measureAccents = [
    "border-primary/60",
    "border-secondary/60",
    "border-accent/60",
    "border-muted-foreground/40",
  ];

  const formatPeriod = (start?: string | null, end?: string | null) => {
    if (!start && !end) return "Rolling period";
    const startValue = start ? start.slice(0, 10) : null;
    const endValue = end ? end.slice(0, 10) : null;
    if (startValue && endValue) return `${startValue} – ${endValue}`;
    return startValue ?? endValue ?? "Rolling period";
  };

  const getTrend = (rate?: number | null) => {
    if (typeof rate !== "number") {
      return { label: "No trend", icon: Minus, tone: "text-muted-foreground" };
    }
    if (rate >= 80) {
      return { label: "Above target", icon: TrendingUp, tone: "text-emerald-500" };
    }
    if (rate >= 65) {
      return { label: "Stable", icon: Minus, tone: "text-muted-foreground" };
    }
    return { label: "Needs focus", icon: TrendingDown, tone: "text-destructive" };
  };

  const derived = useMemo(() => {
    const total = kpis.data?.total_patients ?? 0;
    const highRisk = kpis.data?.high_risk_patients ?? 0;
    const openGaps = kpis.data?.open_care_gaps ?? 0;
    const closure = kpis.data?.care_gap_closure_rate ?? 0;

    const highRiskShare = total > 0 ? (highRisk / total) * 100 : 0;
    const closedEstimate =
      closure >= 100 ? openGaps : closure > 0 ? (openGaps * closure) / (100 - closure) : 0;
    const totalGaps = openGaps + closedEstimate;
    const openShare = totalGaps > 0 ? (openGaps / totalGaps) * 100 : 0;

    return {
      total,
      highRisk,
      openGaps,
      closure,
      highRiskShare,
      openShare,
    };
  }, [kpis.data]);

  const aiSummary = useMemo(() => {
    if (!kpis.data) return null;
    const { high_risk_patients, open_care_gaps, tasks_due_today, care_gap_closure_rate } =
      kpis.data;
    const warnings: string[] = [];
    if (high_risk_patients > 0) {
      warnings.push(`${high_risk_patients} high-risk patients need outreach`);
    }
    if (open_care_gaps > 0) {
      warnings.push(`${open_care_gaps} care gaps are still open`);
    }
    if (tasks_due_today > 0) {
      warnings.push(`${tasks_due_today} tasks due today`);
    }
    const urgent = warnings.length > 0;
    const headline = urgent ? "Immediate attention required" : "No urgent actions flagged";
    const summary = urgent
      ? "Prioritize high-risk outreach and same-day task completion today."
      : "Care operations are stable today. Continue monitoring risk and gaps.";
    const note = care_gap_closure_rate < 65
      ? "Closure rate is trending below target."
      : "Closure rate is on track for the current period.";
    return { urgent, headline, summary, warnings, note };
  }, [kpis.data]);

  const cards = [
    {
      label: "Total Patients",
      value: kpis.data?.total_patients ?? "N/A",
      helper: "Active panel",
      trend: derived.total ? "Active roster" : "Awaiting data",
      icon: Users,
      href: "/dashboard/patients",
    },
    {
      label: "High Risk",
      value: kpis.data?.high_risk_patients ?? "N/A",
      helper: "Needs escalation",
      trend: `${derived.highRiskShare.toFixed(1)}% of population`,
      icon: Activity,
      href: "/dashboard/patients?risk_tier=high",
    },
    {
      label: "Open Care Gaps",
      value: kpis.data?.open_care_gaps ?? "N/A",
      helper: "Outstanding",
      trend: `${derived.openShare.toFixed(1)}% still open`,
      icon: ClipboardCheck,
      href: "/dashboard/care-gaps?status=open",
    },
    {
      label: "Care Gap Closure",
      value: kpis.data ? `${kpis.data.care_gap_closure_rate}%` : "N/A",
      helper: "30-day trend",
      trend: `${derived.closure.toFixed(1)}% closure rate`,
      icon: LineChart,
      href: "/dashboard/care-gaps",
    },
    {
      label: "Tasks Due Today",
      value: kpis.data?.tasks_due_today ?? "N/A",
      helper: "Assigned to team",
      trend: "Same-day follow up",
      icon: ShieldCheck,
      href: "/dashboard/tasks",
    },
  ];

  const quickActions = [
    {
      label: "Review high-risk patients",
      description: "See the latest risk tiers and scores.",
      href: "/dashboard/patients",
    },
    {
      label: "Work the care gap queue",
      description: "Prioritize overdue screenings.",
      href: "/dashboard/care-gaps",
    },
    {
      label: "Track active tasks",
      description: "Follow up on assigned outreach.",
      href: "/dashboard/tasks",
    },
  ];

  const focusItems = [
    {
      label: "High-risk patients need outreach",
      value: kpis.data?.high_risk_patients ?? null,
    },
    {
      label: "Open care gaps across cohorts",
      value: kpis.data?.open_care_gaps ?? null,
    },
    {
      label: "Tasks due today",
      value: kpis.data?.tasks_due_today ?? null,
    },
  ];

  const activityFeed = [
    {
      title: "AI risk score refreshed",
      detail: "12 patients moved into high-risk tier",
      time: "5m ago",
      icon: Sparkles,
    },
    {
      title: "Care gap closed",
      detail: "A1C screening documented for cohort",
      time: "18m ago",
      icon: CheckCircle2,
    },
    {
      title: "New outreach task",
      detail: "Assigned to care manager queue",
      time: "1h ago",
      icon: Bell,
    },
  ];

  const handleExport = () => {
    if (!kpis.data || !qualityMeasures.data) {
      toast.error("Report data is not ready yet.");
      return;
    }
    const timestamp = new Date();
    const payload = {
      generated_at: timestamp.toISOString(),
      kpis: kpis.data,
      quality_measures: qualityMeasures.data,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `healthiq-report-${timestamp.toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Report downloaded.");
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <Badge variant="secondary" className="w-fit">
            Live Dashboard
          </Badge>
          <h1 className="text-3xl font-semibold text-foreground">Population Overview</h1>
          <p className="text-muted-foreground">
            Real-time KPIs, care gaps, and quality performance across your programs.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            Export Report
          </Button>
          <Button
            size="sm"
            icon={<ArrowUpRight className="h-4 w-4" />}
            iconPosition="end"
            onClick={() => router.push("/dashboard/analytics")}
          >
            View Analytics
          </Button>
        </div>
      </div>

      {kpis.isError && (
        <p className="text-sm text-destructive">
          {getErrorMessage(kpis.error, "Failed to load KPIs.")}
        </p>
      )}

      <Card className="border-border/60 bg-card/80" data-tour="dashboard-kpis">
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Population Pulse</CardTitle>
            <CardDescription>Key indicators across risk, gaps, and tasks.</CardDescription>
          </div>
          <Badge variant="outline" className="w-fit text-xs uppercase tracking-[0.2em]">
            Live
          </Badge>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {cards.map((card) => {
            const Icon = card.icon;
            const content = (
              <div
                className="rounded-xl border border-border/60 bg-background/70 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                      {card.label}
                    </p>
                    <p className="text-[0.7rem] text-muted-foreground">{card.helper}</p>
                  </div>
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                </div>
                <div className="mt-4 space-y-2">
                  {kpiLoading ? (
                    <>
                      <Skeleton className="h-7 w-20" />
                      <Skeleton className="h-3 w-24" />
                    </>
                  ) : (
                    <>
                      <div className="text-2xl font-semibold text-foreground">{card.value}</div>
                      <p className="text-xs text-muted-foreground">{card.trend}</p>
                    </>
                  )}
                </div>
              </div>
            );
            return (
              <Link
                key={card.label}
                href={card.href}
                className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {content}
              </Link>
            );
          })}
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/80">
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>AI Summary</CardTitle>
            <CardDescription>Today&apos;s priority insights based on live KPIs.</CardDescription>
          </div>
          <Badge variant="outline" className="w-fit text-xs uppercase tracking-[0.2em]">
            Today
          </Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          {kpiLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-72" />
            </div>
          ) : aiSummary ? (
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <AlertTriangle className="h-4 w-4" />
                </span>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">{aiSummary.headline}</p>
                  <p className="text-sm text-muted-foreground">{aiSummary.summary}</p>
                </div>
              </div>
              {aiSummary.warnings.length > 0 ? (
                <div className="grid gap-2 md:grid-cols-3">
                  {aiSummary.warnings.map((item) => (
                    <div
                      key={item}
                      className="rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-xs text-muted-foreground"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No urgent alerts for today.</p>
              )}
              <div className="rounded-lg border border-border/60 bg-background/70 px-3 py-2 text-xs text-muted-foreground">
                {aiSummary.note}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No summary available.</p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-border/60 bg-card/80">
          <CardHeader>
            <CardTitle>Quality Measures</CardTitle>
            <CardDescription>
              Measure performance across core HEDIS-style indicators.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {qualityMeasures.isError && (
              <p className="text-sm text-destructive">
                {getErrorMessage(qualityMeasures.error, "Failed to load measures.")}
              </p>
            )}
            {measureLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={`measure-skeleton-${index}`}
                    className="rounded-lg border border-border/60 bg-background/70 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <div className="space-y-2 text-right">
                        <Skeleton className="h-4 w-14" />
                        <Skeleton className="h-3 w-12" />
                      </div>
                    </div>
                    <Skeleton className="mt-3 h-2 w-full" />
                  </div>
                ))}
              </div>
            ) : qualityMeasures.data?.length ? (
              <div className="space-y-3">
                {qualityMeasures.data.map((measure, index) => {
                  const rate = measure.rate;
                  const hasRate = typeof rate === "number";
                  const trend = getTrend(rate);
                  const TrendIcon = trend.icon;
                  const accent = measureAccents[index % measureAccents.length];
                  return (
                  <div
                    key={measure.id}
                    className={`rounded-lg border border-border/60 bg-background/70 p-4 border-l-4 ${accent}`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-foreground">
                            {measure.measure_name ?? measure.measure_code}
                          </p>
                          <Badge variant="outline" className="text-[0.7rem]">
                            {measure.measure_code}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatPeriod(measure.period_start, measure.period_end)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <p className="text-lg font-semibold text-foreground">
                            {hasRate ? `${rate.toFixed(1)}%` : "N/A"}
                          </p>
                          <span className={`flex items-center gap-1 text-xs ${trend.tone}`}>
                            <TrendIcon className="h-3 w-3" />
                            {trend.label}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {measure.numerator}/{measure.denominator}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 h-2 w-full rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{
                          width: `${Math.min(rate ?? 0, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No quality measures available yet.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card className="border-border/60 bg-card/80">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Jump into high-priority workstreams.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickActions.map((action) => (
                <div
                  key={action.label}
                  className="flex items-center justify-between rounded-lg border border-border/60 bg-background/70 p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{action.label}</p>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    icon={<ArrowRight className="h-3 w-3" />}
                    iconPosition="end"
                    render={<Link href={action.href}>Open</Link>}
                    nativeButton={false}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/80">
            <CardHeader>
              <CardTitle>Priority Focus</CardTitle>
              <CardDescription>Today&apos;s high-impact opportunities.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {kpiLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={`focus-skeleton-${index}`}
                      className="flex items-center gap-3 rounded-lg border border-border/60 bg-background/70 p-3"
                    >
                      <Skeleton className="h-2 w-2 rounded-full" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                  ))}
                </div>
              ) : (
                focusItems.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 rounded-lg border border-border/60 bg-background/70 p-3"
                  >
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <Badge variant="secondary" className="ml-auto">
                      {item.value ?? "N/A"}
                    </Badge>
                  </div>
                ))
              )}
              <div className="rounded-lg border border-border/60 bg-muted/50 p-4 text-sm text-muted-foreground">
                AI suggestions update automatically as new risk scores arrive.
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/80">
            <CardHeader>
              <CardTitle>Activity Feed</CardTitle>
              <CardDescription>Latest population health updates.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {activityFeed.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="flex items-start gap-3 rounded-lg border border-border/60 bg-background/70 p-3"
                  >
                    <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-foreground">{item.title}</p>
                        <span className="text-xs text-muted-foreground">{item.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{item.detail}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
