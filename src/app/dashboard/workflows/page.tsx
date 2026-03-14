"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCreateWorkflow, useUpdateWorkflow, useWorkflows } from "@/hooks/use-workflows";
import { useRole } from "@/hooks/use-role";
import { getErrorMessage } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { GitBranch, Zap } from "lucide-react";
import { workflowCreateSchema, type WorkflowCreateValues } from "@/types/schemas";
import type { Workflow } from "@/types/healthiq";
import { ROLES } from "@/constants/roles";

const TRIGGER_TYPES = [
  { label: "Risk threshold", value: "risk_threshold" },
  { label: "Care gap detected", value: "care_gap_detected" },
  { label: "Time based", value: "time_based" },
];

const TASK_TYPES = ["care_gap", "outreach", "follow_up"] as const;
const PRIORITIES = ["low", "medium", "high", "urgent"] as const;

type WorkflowFormValues = WorkflowCreateValues & {
  trigger_value?: string;
  task_type?: string;
  priority?: string;
};

function WorkflowCard({ workflow, canManage }: { workflow: Workflow; canManage: boolean }) {
  const updateWorkflow = useUpdateWorkflow(workflow.id);

  const toggleStatus = async () => {
    await updateWorkflow.mutateAsync({ is_active: !workflow.is_active });
  };

  return (
    <Card className="border-border/60 bg-card/80">
      <CardContent className="space-y-3 p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-lg font-semibold text-foreground">{workflow.name}</p>
            <p className="text-sm text-muted-foreground">Trigger: {workflow.trigger_type}</p>
          </div>
          <Badge variant={workflow.is_active ? "secondary" : "outline"}>
            {workflow.is_active ? "Active" : "Paused"}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-primary" />
            Auto-assign care manager and notify team.
          </div>
          {canManage && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => void toggleStatus()}
              loading={updateWorkflow.isPending}
            >
              {workflow.is_active ? "Pause" : "Activate"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function WorkflowsPage() {
  const workflows = useWorkflows();
  const createWorkflow = useCreateWorkflow();
  const [open, setOpen] = useState(false);
  const { role } = useRole();
  const canManage = role === ROLES.ORG_ADMIN || role === ROLES.SUPER_ADMIN;

  const data = workflows.data ?? [];
  const activeCount = data.filter((workflow) => workflow.is_active).length;

  const form = useForm<WorkflowFormValues>({
    resolver: zodResolver(workflowCreateSchema),
    defaultValues: {
      name: "",
      trigger_type: "risk_threshold",
      is_active: true,
      trigger_value: "",
      task_type: "care_gap",
      priority: "high",
    },
  });

  const onSubmit = async (values: WorkflowFormValues) => {
    const triggerConfig =
      values.trigger_type === "risk_threshold"
        ? { min_score: Number(values.trigger_value || 80) }
        : values.trigger_type === "care_gap_detected"
          ? { gap_type: values.trigger_value || "a1c_test", overdue_days: 14 }
          : { interval_days: Number(values.trigger_value || 365) };

    const actions = [
      {
        action: "create_task",
        task_type: values.task_type || "care_gap",
        priority: values.priority || "high",
      },
    ];

    await createWorkflow.mutateAsync({
      name: values.name,
      trigger_type: values.trigger_type,
      trigger_config: triggerConfig,
      actions,
      is_active: values.is_active ?? true,
    });

    form.reset();
    setOpen(false);
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <Badge variant="secondary" className="w-fit">
            Workflows
          </Badge>
          <h1 className="text-3xl font-semibold text-foreground">Automation Studio</h1>
          <p className="text-muted-foreground">
            Rule-based triggers that create tasks and notify your teams in real time.
          </p>
        </div>
        {canManage && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button size="sm">Create Workflow</Button>} />
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create workflow</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="High Risk Outreach" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="trigger_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Trigger type</FormLabel>
                        <FormControl>
                          <select
                            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                            value={field.value}
                            onChange={field.onChange}
                          >
                            {TRIGGER_TYPES.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="trigger_value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {form.watch("trigger_type") === "risk_threshold"
                            ? "Minimum score"
                            : form.watch("trigger_type") === "care_gap_detected"
                              ? "Gap type"
                              : "Interval days"}
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={
                              form.watch("trigger_type") === "risk_threshold"
                                ? "80"
                                : form.watch("trigger_type") === "care_gap_detected"
                                  ? "a1c_test"
                                  : "365"
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid gap-3 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="task_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Task type</FormLabel>
                          <FormControl>
                            <select
                              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                              value={field.value ?? ""}
                              onChange={field.onChange}
                            >
                              {TASK_TYPES.map((type) => (
                                <option key={type} value={type}>
                                  {type.replace(/_/g, " ")}
                                </option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <FormControl>
                            <select
                              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                              value={field.value ?? ""}
                              onChange={field.onChange}
                            >
                              {PRIORITIES.map((priority) => (
                                <option key={priority} value={priority}>
                                  {priority}
                                </option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit" loading={createWorkflow.isPending} className="w-full">
                    Create workflow
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {workflows.isError && (
        <p className="text-sm text-destructive">
          {getErrorMessage(workflows.error, "Failed to load workflows.")}
        </p>
      )}

      {workflows.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { label: "Active workflows", value: activeCount, icon: Zap },
              { label: "Total workflows", value: data.length, icon: GitBranch },
              { label: "Paused workflows", value: data.length - activeCount, icon: GitBranch },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label} className="border-border/60 bg-card/80">
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
              );
            })}
          </div>

          <div className="grid gap-6 md:grid-cols-2" data-tour="workflows-list">
            {data.map((workflow) => (
              <WorkflowCard key={workflow.id} workflow={workflow} canManage={canManage} />
            ))}
            {!workflows.isLoading && !data.length && (
              <p className="text-sm text-muted-foreground">No workflows created.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
