"use client";

import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  usePatient,
  usePatientCarePlans,
  usePatientConditions,
  usePatientGaps,
  usePatientRisk,
} from "@/hooks/use-patients";
import { getErrorMessage, isUuid } from "@/lib/utils";
import { Activity, Mail, User } from "lucide-react";

export default function PatientProfilePage() {
  const params = useParams();
  const rawId = params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const normalizedId = typeof id === "string" ? id.trim() : "";
  const hasParam = typeof id === "string";
  const isValidId = Boolean(normalizedId) && isUuid(normalizedId);
  const safeId = isValidId ? normalizedId : "";
  const patient = usePatient(safeId);
  const risk = usePatientRisk(safeId);
  const gaps = usePatientGaps(safeId);
  const conditions = usePatientConditions(safeId);
  const carePlans = usePatientCarePlans(safeId);
  const patientLoading = patient.isLoading;
  const riskLoading = risk.isLoading;
  const conditionsLoading = conditions.isLoading;
  const plansLoading = carePlans.isLoading;
  const gapsLoading = gaps.isLoading;

  if (!hasParam) {
    return (
      <div className="space-y-4">
        <Badge variant="secondary" className="w-fit">
          Patient Profile
        </Badge>
        <h1 className="text-3xl font-semibold text-foreground">Patient Overview</h1>
        <p className="text-sm text-muted-foreground">Loading patient details...</p>
      </div>
    );
  }

  if (!isValidId) {
    return (
      <div className="space-y-4">
        <Badge variant="secondary" className="w-fit">
          Patient Profile
        </Badge>
        <h1 className="text-3xl font-semibold text-foreground">Patient Overview</h1>
        <p className="text-sm text-destructive">Invalid patient id.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <Badge variant="secondary" className="w-fit">
          Patient Profile
        </Badge>
        <h1 className="text-3xl font-semibold text-foreground">Patient Overview</h1>
        <p className="text-muted-foreground">Demographics, risk signals, and care gap status.</p>
      </div>

      {(patient.isError || risk.isError || gaps.isError) && (
        <p className="text-sm text-destructive">
          {getErrorMessage(patient.error ?? risk.error ?? gaps.error, "Failed to load patient.")}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <Card className="border-border/60 bg-card/80">
          <CardHeader>
            <CardTitle>Patient Details</CardTitle>
            <CardDescription>Core demographics and contact information.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-border/60 bg-background/70 p-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <User className="h-4 w-4" />
                Name
              </div>
              <div className="mt-2 font-medium text-foreground">
                {patientLoading ? (
                  <Skeleton className="h-4 w-32" />
                ) : (
                  `${patient.data?.first_name ?? "N/A"} ${patient.data?.last_name ?? ""}`.trim()
                )}
              </div>
            </div>
            <div className="rounded-lg border border-border/60 bg-background/70 p-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Activity className="h-4 w-4" />
                DOB
              </div>
              <div className="mt-2 font-medium text-foreground">
                {patientLoading ? <Skeleton className="h-4 w-24" /> : patient.data?.dob ?? "N/A"}
              </div>
            </div>
            <div className="rounded-lg border border-border/60 bg-background/70 p-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Activity className="h-4 w-4" />
                Gender
              </div>
              <div className="mt-2 font-medium text-foreground capitalize">
                {patientLoading ? (
                  <Skeleton className="h-4 w-20" />
                ) : (
                  patient.data?.gender ?? "N/A"
                )}
              </div>
            </div>
            <div className="rounded-lg border border-border/60 bg-background/70 p-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Mail className="h-4 w-4" />
                Email
              </div>
              <div className="mt-2 font-medium text-foreground">
                {patientLoading ? (
                  <Skeleton className="h-4 w-40" />
                ) : (
                  patient.data?.email ?? "N/A"
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/80">
          <CardHeader>
            <CardTitle>Risk Score</CardTitle>
            <CardDescription>Latest AI risk stratification.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-4xl font-semibold text-foreground">
              {riskLoading ? (
                <Skeleton className="h-9 w-20" />
              ) : risk.data?.score ? (
                Math.round(risk.data.score)
              ) : (
                "N/A"
              )}
            </div>
            {riskLoading ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <Badge variant="secondary" className="w-fit capitalize">
                {risk.data?.risk_tier ?? "No risk tier"}
              </Badge>
            )}
            <p className="text-xs text-muted-foreground">
              Updated when new clinical signals are detected.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/60 bg-card/80">
          <CardHeader>
            <CardTitle>Conditions</CardTitle>
            <CardDescription>Active and chronic diagnoses.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {conditionsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={`condition-skeleton-${index}`}
                    className="rounded-lg border border-border/60 bg-background/70 px-3 py-2"
                  >
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="mt-2 h-3 w-24" />
                  </div>
                ))}
              </div>
            ) : conditions.data?.length ? (
              conditions.data.map((condition) => (
                <div
                  key={condition.id}
                  className="flex items-center justify-between rounded-lg border border-border/60 bg-background/70 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {condition.description ?? condition.icd10_code}
                    </p>
                    <p className="text-xs text-muted-foreground">ICD-10 {condition.icd10_code}</p>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {condition.status}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No conditions recorded.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/80">
          <CardHeader>
            <CardTitle>Care Plans</CardTitle>
            <CardDescription>Active plans and interventions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {plansLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div
                    key={`plan-skeleton-${index}`}
                    className="rounded-lg border border-border/60 bg-background/70 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="mt-2 h-3 w-24" />
                  </div>
                ))}
              </div>
            ) : carePlans.data?.length ? (
              carePlans.data.map((plan) => (
                <div
                  key={plan.id}
                  className="rounded-lg border border-border/60 bg-background/70 p-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">{plan.title}</p>
                    <Badge variant="secondary" className="capitalize">
                      {plan.status}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {plan.ai_generated ? "AI-generated plan" : "Clinician-authored"}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No care plans available.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60 bg-card/80">
        <CardHeader>
          <CardTitle>Care Gaps</CardTitle>
          <CardDescription>Open opportunities for intervention.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {gapsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={`gap-skeleton-${index}`}
                  className="rounded-lg border border-border/60 bg-background/70 p-3"
                >
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="mt-2 h-3 w-24" />
                </div>
              ))}
            </div>
          ) : gaps.data?.length ? (
            gaps.data.map((gap) => (
              <div key={gap.id} className="rounded-lg border border-border/60 bg-background/70 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-foreground">{gap.description ?? gap.gap_type}</p>
                    <p className="text-xs text-muted-foreground capitalize">{gap.status}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">Due {gap.due_date ?? "N/A"}</div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No care gaps found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
