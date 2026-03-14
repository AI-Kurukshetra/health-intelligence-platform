export interface Organization {
  id: string;
  name: string;
  slug: string;
  settings: Record<string, unknown> | null;
  created_at: string;
}

export interface RoleRow {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface UserProfileRow {
  id: string;
  org_id: string | null;
  role_id: string | null;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PatientRow {
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

export interface PatientConditionRow {
  id: string;
  patient_id: string;
  icd10_code: string;
  description: string | null;
  onset_date: string | null;
  status: string;
  created_at: string;
}

export interface RiskScoreRow {
  id: string;
  patient_id: string;
  score: number;
  risk_tier: string;
  risk_factors: Record<string, unknown>[] | null;
  model_version: string | null;
  calculated_at: string;
}

export interface CareGapRow {
  id: string;
  patient_id: string;
  gap_type: string;
  description: string | null;
  due_date: string | null;
  status: string;
  closed_at: string | null;
  closed_by: string | null;
  created_at: string;
}

export interface CarePlanRow {
  id: string;
  patient_id: string;
  created_by: string | null;
  title: string;
  goals: Record<string, unknown>[] | null;
  interventions: Record<string, unknown>[] | null;
  status: string;
  ai_generated: boolean;
  created_at: string;
  updated_at: string;
}

export interface TaskRow {
  id: string;
  patient_id: string | null;
  assigned_to: string | null;
  created_by: string | null;
  org_id: string;
  title: string;
  description: string | null;
  task_type: string | null;
  priority: string;
  status: string;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface OutreachLogRow {
  id: string;
  patient_id: string;
  user_id: string | null;
  channel: string | null;
  outcome: string | null;
  notes: string | null;
  contacted_at: string;
}

export interface QualityMeasureRow {
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

export interface WorkflowRow {
  id: string;
  org_id: string;
  name: string;
  trigger_type: string;
  trigger_config: Record<string, unknown> | null;
  actions: Record<string, unknown>[] | null;
  is_active: boolean;
  created_at: string;
}

export interface CohortRow {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  filter_config: Record<string, unknown> | null;
  patient_count: number | null;
  created_by: string | null;
  created_at: string;
}

export interface CohortMemberRow {
  cohort_id: string;
  patient_id: string;
  added_at: string;
}

export interface CareTeamAssignmentRow {
  id: string;
  patient_id: string;
  user_id: string;
  role: string | null;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: Organization;
        Insert: Omit<Organization, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Organization>;
      };
      roles: {
        Row: RoleRow;
        Insert: Omit<RoleRow, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<RoleRow>;
      };
      user_profiles: {
        Row: UserProfileRow;
        Insert: Omit<UserProfileRow, "created_at" | "updated_at"> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<UserProfileRow>;
      };
      patients: {
        Row: PatientRow;
        Insert: Omit<PatientRow, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<PatientRow>;
      };
      patient_conditions: {
        Row: PatientConditionRow;
        Insert: Omit<PatientConditionRow, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<PatientConditionRow>;
      };
      risk_scores: {
        Row: RiskScoreRow;
        Insert: Omit<RiskScoreRow, "id" | "calculated_at"> & {
          id?: string;
          calculated_at?: string;
        };
        Update: Partial<RiskScoreRow>;
      };
      care_gaps: {
        Row: CareGapRow;
        Insert: Omit<CareGapRow, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<CareGapRow>;
      };
      care_plans: {
        Row: CarePlanRow;
        Insert: Omit<CarePlanRow, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<CarePlanRow>;
      };
      tasks: {
        Row: TaskRow;
        Insert: Omit<TaskRow, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<TaskRow>;
      };
      outreach_log: {
        Row: OutreachLogRow;
        Insert: Omit<OutreachLogRow, "id" | "contacted_at"> & {
          id?: string;
          contacted_at?: string;
        };
        Update: Partial<OutreachLogRow>;
      };
      quality_measures: {
        Row: QualityMeasureRow;
        Insert: Omit<QualityMeasureRow, "id" | "calculated_at"> & {
          id?: string;
          calculated_at?: string;
        };
        Update: Partial<QualityMeasureRow>;
      };
      workflows: {
        Row: WorkflowRow;
        Insert: Omit<WorkflowRow, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<WorkflowRow>;
      };
      cohorts: {
        Row: CohortRow;
        Insert: Omit<CohortRow, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<CohortRow>;
      };
      cohort_members: {
        Row: CohortMemberRow;
        Insert: CohortMemberRow;
        Update: Partial<CohortMemberRow>;
      };
      care_team_assignments: {
        Row: CareTeamAssignmentRow;
        Insert: Omit<CareTeamAssignmentRow, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<CareTeamAssignmentRow>;
      };
    };
  };
}
