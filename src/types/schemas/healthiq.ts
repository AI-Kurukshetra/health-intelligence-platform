import { z } from "zod";

export const patientCreateSchema = z.object({
  first_name: z.string().min(1, "First name is required."),
  last_name: z.string().min(1, "Last name is required."),
  dob: z.string().optional(),
  gender: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
});

export const patientUpdateSchema = patientCreateSchema.partial();

export const taskCreateSchema = z.object({
  patient_id: z.string().uuid().optional(),
  title: z.string().min(1, "Title is required."),
  description: z.string().optional(),
  task_type: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  due_date: z.string().optional(),
  assigned_to: z.string().uuid().optional(),
});

export const taskUpdateSchema = taskCreateSchema.partial();

export const careGapUpdateSchema = z.object({
  status: z.enum(["open", "in_progress", "closed"]).optional(),
  closed_by: z.string().uuid().optional(),
  closed_at: z.string().optional(),
});

export const cohortCreateSchema = z.object({
  name: z.string().min(1, "Name is required."),
  description: z.string().optional(),
  filter_config: z.record(z.unknown()).optional(),
});

export const workflowCreateSchema = z.object({
  name: z.string().min(1, "Name is required."),
  trigger_type: z.string().min(1, "Trigger type is required."),
  trigger_config: z.record(z.unknown()).optional(),
  actions: z.array(z.record(z.unknown())).optional(),
  is_active: z.boolean().optional(),
});

export const workflowUpdateSchema = workflowCreateSchema.partial();

export const riskScoreTriggerSchema = z.object({
  patient_id: z.string().uuid(),
});

export type PatientCreateValues = z.infer<typeof patientCreateSchema>;
export type PatientUpdateValues = z.infer<typeof patientUpdateSchema>;
export type TaskCreateValues = z.infer<typeof taskCreateSchema>;
export type TaskUpdateValues = z.infer<typeof taskUpdateSchema>;
export type CareGapUpdateValues = z.infer<typeof careGapUpdateSchema>;
export type CohortCreateValues = z.infer<typeof cohortCreateSchema>;
export type WorkflowCreateValues = z.infer<typeof workflowCreateSchema>;
export type WorkflowUpdateValues = z.infer<typeof workflowUpdateSchema>;
export type RiskScoreTriggerValues = z.infer<typeof riskScoreTriggerSchema>;
