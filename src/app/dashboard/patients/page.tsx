"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { usePatients } from "@/hooks/use-patients";
import { useRiskScores } from "@/hooks/use-risk-scores";
import { getErrorMessage } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Users } from "lucide-react";

const CONDITION_OPTIONS = [
  { label: "Type 2 Diabetes (E11)", value: "E11" },
  { label: "Hypertension (I10)", value: "I10" },
  { label: "Hyperlipidemia (E78)", value: "E78" },
  { label: "Heart Failure (I50)", value: "I50" },
  { label: "COPD (J44)", value: "J44" },
  { label: "Chronic Kidney Disease (N18)", value: "N18" },
  { label: "Asthma (J45)", value: "J45" },
  { label: "Major Depressive Disorder (F33)", value: "F33" },
];

export default function PatientsPage() {
  const searchParams = useSearchParams();
  const riskParam = searchParams.get("risk_tier") ?? "";
  const conditionParam = searchParams.get("condition_code") ?? "";
  const searchParam = searchParams.get("search") ?? "";
  const [riskTier, setRiskTier] = useState("");
  const [conditionCode, setConditionCode] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRiskTier(riskParam);
    setConditionCode(conditionParam);
    setSearch(searchParam);
  }, [riskParam, conditionParam, searchParam]);

  const patients = usePatients({
    limit: 50,
    risk_tier: riskTier || undefined,
    condition_code: conditionCode || undefined,
    search: search || undefined,
  });
  const riskScores = useRiskScores();
  const riskLoading = riskScores.isLoading;

  const riskMap = useMemo(() => {
    const map = new Map<string, { tier: string; score: number }>();
    if (!riskScores.data) return map;
    for (const score of riskScores.data) {
      if (!map.has(score.patient_id)) {
        map.set(score.patient_id, { tier: score.risk_tier, score: score.score });
      }
    }
    return map;
  }, [riskScores.data]);

  const data = patients.data ?? [];
  const highRiskCount = Array.from(riskMap.values()).filter((risk) => risk.tier === "high").length;
  const stats = [
    { label: "Total patients", value: data.length, href: "/dashboard/patients" },
    { label: "High risk", value: highRiskCount, href: "/dashboard/patients?risk_tier=high" },
    { label: "Profiles loaded", value: Math.min(data.length, 50), href: "/dashboard/patients" },
  ];

  const tierVariant = (tier?: string) => {
    if (!tier) return "outline" as const;
    if (tier === "high") return "destructive" as const;
    if (tier === "medium") return "secondary" as const;
    return "outline" as const;
  };

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <Badge variant="secondary" className="w-fit">
          Patients
        </Badge>
        <h1 className="text-3xl font-semibold text-foreground">Patient Directory</h1>
        <p className="text-muted-foreground">
          Review patient profiles, risk tiers, and clinical context.
        </p>
      </div>

      {(patients.isError || riskScores.isError) && (
        <p className="text-sm text-destructive">
          {getErrorMessage(patients.error ?? riskScores.error, "Failed to load patients.")}
        </p>
      )}

      {patients.isLoading ? (
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
                      <Users className="h-4 w-4" />
                    </span>
                  </CardHeader>
                  <CardContent>
                    {stat.label === "High risk" && riskLoading ? (
                      <Skeleton className="h-7 w-16" />
                    ) : (
                      <div className="text-2xl font-semibold text-foreground">{stat.value}</div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <Card className="border-border/60 bg-card/80" data-tour="patients-table">
            <CardHeader>
              <CardTitle>Patient List</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                <Input
                  placeholder="Search by name"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
                <select
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={riskTier}
                  onChange={(event) => setRiskTier(event.target.value)}
                >
                  <option value="">All risk tiers</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <select
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={conditionCode}
                  onChange={(event) => setConditionCode(event.target.value)}
                >
                  <option value="">All conditions</option>
                  {CONDITION_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-lg border border-border/60">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>DOB</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Risk Tier</TableHead>
                      <TableHead>Risk Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((patient) => {
                      const risk = riskMap.get(patient.id);
                      return (
                        <TableRow key={patient.id}>
                          <TableCell>
                            <Link
                              href={`/dashboard/patients/${patient.id}`}
                              className="font-medium text-foreground hover:underline"
                            >
                              {patient.first_name} {patient.last_name}
                            </Link>
                          </TableCell>
                          <TableCell>{patient.dob ?? "N/A"}</TableCell>
                          <TableCell className="capitalize">{patient.gender ?? "N/A"}</TableCell>
                          <TableCell>
                            {riskLoading ? (
                              <Skeleton className="h-5 w-20" />
                            ) : (
                              <Badge variant={tierVariant(risk?.tier)} className="capitalize">
                                {risk?.tier ?? "N/A"}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {riskLoading ? (
                              <Skeleton className="h-5 w-12" />
                            ) : risk ? (
                              Math.round(risk.score)
                            ) : (
                              "N/A"
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {!patients.isLoading && !data.length && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                          No patients found.
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
