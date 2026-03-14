"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useCareGaps } from "@/hooks/use-care-gaps";
import { getErrorMessage } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardCheck } from "lucide-react";

export default function CareGapsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status") ?? "";
  const careGapsAll = useCareGaps();
  const careGaps = useCareGaps(statusParam || undefined);

  const statusOptions = [
    { label: "All", value: "" },
    { label: "Open", value: "open" },
    { label: "In progress", value: "in_progress" },
    { label: "Closed", value: "closed" },
  ];
  const data = careGaps.data ?? [];
  const allData = careGapsAll.data ?? [];
  const openCount = allData.filter((gap) => gap.status !== "closed").length;
  const dueSoon = allData.filter((gap) => gap.status !== "closed" && gap.due_date).length;
  const stats = [
    { label: "Open care gaps", value: openCount, href: "/dashboard/care-gaps?status=open" },
    { label: "Due soon", value: dueSoon, href: "/dashboard/care-gaps" },
    { label: "Total tracked", value: allData.length, href: "/dashboard/care-gaps" },
  ];

  const statusVariant = (status?: string) => {
    if (!status) return "outline" as const;
    if (status === "closed") return "outline" as const;
    if (status === "in_progress") return "secondary" as const;
    return "destructive" as const;
  };

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <Badge variant="secondary" className="w-fit">
          Care Gaps
        </Badge>
        <h1 className="text-3xl font-semibold text-foreground">Care Gap Queue</h1>
        <p className="text-muted-foreground">
          Prioritized screenings and follow-ups that need action across your cohorts.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <select
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          value={statusParam}
          onChange={(event) => {
            const value = event.target.value;
            const params = new URLSearchParams(searchParams.toString());
            if (value) {
              params.set("status", value);
            } else {
              params.delete("status");
            }
            const qs = params.toString();
            router.replace(qs ? `${pathname}?${qs}` : pathname);
          }}
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {statusParam && (
          <Badge variant="outline" className="capitalize">
            Filter: {statusParam.replace(/_/g, " ")}
          </Badge>
        )}
      </div>

      {(careGaps.isError || careGapsAll.isError) && (
        <p className="text-sm text-destructive">
          {getErrorMessage(careGaps.error ?? careGapsAll.error, "Failed to load care gaps.")}
        </p>
      )}

      {(careGaps.isLoading || careGapsAll.isLoading) ? (
        <div className="space-y-3">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-56 w-full" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            {stats.map((stat) => (
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
                      <ClipboardCheck className="h-4 w-4" />
                    </span>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-semibold text-foreground">{stat.value}</div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <Card className="border-border/60 bg-card/80" data-tour="care-gaps-table">
            <CardHeader>
              <CardTitle>Care Gap Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border/60">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Gap</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((gap) => (
                      <TableRow key={gap.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">
                              {gap.description ?? gap.gap_type}
                            </p>
                            <p className="text-xs text-muted-foreground">Priority queue</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariant(gap.status)} className="capitalize">
                            {gap.status ?? "unknown"}
                          </Badge>
                        </TableCell>
                        <TableCell>{gap.due_date ?? "N/A"}</TableCell>
                      </TableRow>
                    ))}
                    {!careGaps.isLoading && !data.length && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-sm text-muted-foreground">
                          No care gaps found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
