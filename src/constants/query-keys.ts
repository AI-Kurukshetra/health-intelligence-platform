export const QUERY_KEYS = {
  patients: {
    all: ["patients"] as const,
    detail: (id: string) => ["patients", "detail", id] as const,
    risk: (id: string) => ["patients", "risk", id] as const,
    gaps: (id: string) => ["patients", "gaps", id] as const,
    conditions: (id: string) => ["patients", "conditions", id] as const,
    carePlans: (id: string) => ["patients", "care-plans", id] as const,
  },
  careGaps: {
    all: ["care-gaps"] as const,
  },
  tasks: {
    all: ["tasks"] as const,
  },
  cohorts: {
    all: ["cohorts"] as const,
  },
  workflows: {
    all: ["workflows"] as const,
  },
  analytics: {
    kpis: ["analytics", "kpis"] as const,
    qualityMeasures: ["analytics", "quality-measures"] as const,
  },
  riskScores: {
    all: ["risk-scores"] as const,
  },
  profile: {
    current: ["profile", "current"] as const,
  },
  users: {
    all: ["users"] as const,
  },
} as const;
