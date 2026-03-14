"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useCreateTask, useTasks } from "@/hooks/use-tasks";
import { usePatients } from "@/hooks/use-patients";
import { getErrorMessage } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ListChecks } from "lucide-react";
import { taskCreateSchema, type TaskCreateValues } from "@/types/schemas";

const TASK_TYPES = ["care_gap", "outreach", "follow_up", "quality_review"] as const;
const PRIORITIES = ["low", "medium", "high", "urgent"] as const;

export default function TasksPage() {
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status") ?? "";
  const priorityParam = searchParams.get("priority") ?? "";
  const dueDateParam = searchParams.get("due_date") ?? "";
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setStatusFilter(statusParam);
    setPriorityFilter(priorityParam);
  }, [statusParam, priorityParam]);

  const tasksAll = useTasks();
  const tasks = useTasks({
    status: statusFilter || undefined,
    priority: priorityFilter || undefined,
    due_date: dueDateParam || undefined,
    search: searchParam || undefined,
  });
  const patients = usePatients({ limit: 200 });
  const createTask = useCreateTask();

  const data = tasks.data ?? [];
  const allData = tasksAll.data ?? [];

  const form = useForm<TaskCreateValues>({
    resolver: zodResolver(taskCreateSchema),
    defaultValues: {
      title: "",
      description: "",
      task_type: "care_gap",
      priority: "medium",
      due_date: "",
      patient_id: "",
    },
  });

  const onSubmit = async (values: TaskCreateValues) => {
    await createTask.mutateAsync({
      ...values,
      description: values.description || undefined,
      due_date: values.due_date || undefined,
      patient_id: values.patient_id || undefined,
    });
    form.reset();
    setOpen(false);
  };

  const statusVariant = (status?: string) => {
    if (!status) return "outline" as const;
    if (status === "completed") return "outline" as const;
    if (status === "in_progress") return "secondary" as const;
    return "destructive" as const;
  };

  const priorityVariant = (priority?: string) => {
    if (!priority) return "outline" as const;
    if (priority === "high" || priority === "urgent") return "destructive" as const;
    if (priority === "medium") return "secondary" as const;
    return "outline" as const;
  };

  const stats = useMemo(
    () => [
      {
        label: "Pending",
        value: allData.filter((task) => task.status === "pending").length,
        href: "/dashboard/tasks?status=pending",
      },
      {
        label: "In progress",
        value: allData.filter((task) => task.status === "in_progress").length,
        href: "/dashboard/tasks?status=in_progress",
      },
      {
        label: "Completed",
        value: allData.filter((task) => task.status === "completed").length,
        href: "/dashboard/tasks?status=completed",
      },
    ],
    [allData]
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <Badge variant="secondary" className="w-fit">
            Tasks
          </Badge>
          <h1 className="text-3xl font-semibold text-foreground">Care Coordination Tasks</h1>
          <p className="text-muted-foreground">
            Track outreach, care gap closure, and follow-up activities for your team.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={<Button size="sm">Create Task</Button>}
          />
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create a new task</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Follow up on A1C" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Notes for the care team" />
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
                <FormField
                  control={form.control}
                  name="due_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="patient_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Patient (optional)</FormLabel>
                      <FormControl>
                        <select
                          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                          value={field.value ?? ""}
                          onChange={field.onChange}
                        >
                          <option value="">Unassigned</option>
                          {(patients.data ?? []).map((patient) => (
                            <option key={patient.id} value={patient.id}>
                              {patient.first_name} {patient.last_name}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" loading={createTask.isPending} className="w-full">
                  Create task
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {(tasks.isError || tasksAll.isError) && (
        <p className="text-sm text-destructive">
          {getErrorMessage(tasks.error ?? tasksAll.error, "Failed to load tasks.")}
        </p>
      )}

      {(tasks.isLoading || tasksAll.isLoading) ? (
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
                      <ListChecks className="h-4 w-4" />
                    </span>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-semibold text-foreground">{stat.value}</div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <Card className="border-border/60 bg-card/80">
            <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <CardTitle>Task Details</CardTitle>
              <div className="flex flex-wrap gap-3">
                <select
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                >
                  <option value="">All statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <select
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                  value={priorityFilter}
                  onChange={(event) => setPriorityFilter(event.target.value)}
                >
                  <option value="">All priorities</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border/60">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">{task.title}</p>
                            <p className="text-xs text-muted-foreground">Assigned via workflow</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={priorityVariant(task.priority)} className="capitalize">
                            {task.priority ?? "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariant(task.status)} className="capitalize">
                            {task.status ?? "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell>{task.due_date ?? "N/A"}</TableCell>
                      </TableRow>
                    ))}
                    {!tasks.isLoading && !data.length && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                          No tasks found.
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
