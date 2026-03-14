export interface Patient {
  id: string;
  org_id: string;
  mrn: string | null;
  first_name: string;
  last_name: string;
  dob: string | null;
  gender: string | null;
  phone: string | null;
  email: string | null;
  address: Record<string, unknown> | null;
  insurance_id: string | null;
  pcp_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PatientCondition {
  id: string;
  patient_id: string;
  icd10_code: string;
  description: string | null;
  onset_date: string | null;
  status: "active" | "resolved" | "chronic";
  created_at: string;
}

export interface CarePlan {
  id: string;
  patient_id: string;
  created_by: string | null;
  title: string;
  goals: Record<string, unknown>[] | null;
  interventions: Record<string, unknown>[] | null;
  status: "active" | "completed" | "archived";
  ai_generated: boolean;
  created_at: string;
  updated_at: string;
}

export interface RiskScore {
  id: string;
  patient_id: string;
  score: number;
  risk_tier: "high" | "medium" | "low";
  risk_factors: Record<string, unknown>[] | null;
  model_version: string | null;
  calculated_at: string;
}

export interface CareGap {
  id: string;
  patient_id: string;
  gap_type: string;
  description: string | null;
  due_date: string | null;
  status: "open" | "in_progress" | "closed";
  closed_at: string | null;
  closed_by: string | null;
  created_at: string;
}

export interface Task {
  id: string;
  patient_id: string | null;
  assigned_to: string | null;
  created_by: string | null;
  org_id: string;
  title: string;
  description: string | null;
  task_type: string | null;
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "in_progress" | "completed" | "cancelled";
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface Cohort {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  filter_config: Record<string, unknown> | null;
  patient_count: number | null;
  created_by: string | null;
  created_at: string;
}

export interface Workflow {
  id: string;
  org_id: string;
  name: string;
  trigger_type: string;
  trigger_config: Record<string, unknown> | null;
  actions: Record<string, unknown>[] | null;
  is_active: boolean;
  created_at: string;
}

export interface QualityMeasure {
  id: string;
  org_id: string;
  measure_code: string;
  measure_name: string | null;
  numerator: number;
  denominator: number;
  rate: number | null;
  period_start: string | null;
  period_end: string | null;
  calculated_at: string;
}

export interface KpiSummary {
  total_patients: number;
  high_risk_patients: number;
  open_care_gaps: number;
  care_gap_closure_rate: number;
  tasks_due_today: number;
}

export interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  role: string;
  org_id: string | null;
}
