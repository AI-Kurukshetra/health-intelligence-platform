"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Users, ListChecks, Layers } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useDebounce } from "@/hooks/use-debounce";
import { usePatientSearch } from "@/hooks/use-patients";
import { useTaskSearch } from "@/hooks/use-tasks";
import { useCohortSearch } from "@/hooks/use-cohorts";

export function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounced = useDebounce(query, 300);
  const trimmed = debounced.trim();
  const enabled = open && trimmed.length >= 2;

  const patients = usePatientSearch(trimmed, 5, enabled);
  const tasks = useTaskSearch(trimmed, 5, enabled);
  const cohorts = useCohortSearch(trimmed, 5, enabled);

  const hasResults =
    (patients.data?.length ?? 0) +
      (tasks.data?.length ?? 0) +
      (cohorts.data?.length ?? 0) >
    0;

  const handleFocus = () => {
    if (blurTimer.current) {
      clearTimeout(blurTimer.current);
      blurTimer.current = null;
    }
    setOpen(true);
  };

  const handleBlur = () => {
    blurTimer.current = setTimeout(() => setOpen(false), 140);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (event.key === "Enter" && trimmed.length >= 2) {
      router.push(`/dashboard/patients?search=${encodeURIComponent(trimmed)}`);
      setOpen(false);
    }
  };

  return (
    <div className="relative w-full max-w-md" onFocus={handleFocus} onBlur={handleBlur}>
      <div className="relative w-full">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search patients, cohorts, or tasks"
          className="h-9 pl-9"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      {open && (
        <div
          className="absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border border-border bg-background p-3 shadow-lg"
          onMouseDown={(event) => event.preventDefault()}
        >
          {trimmed.length < 2 ? (
            <p className="text-xs text-muted-foreground">
              Type at least 2 characters to search.
            </p>
          ) : patients.isLoading || tasks.isLoading || cohorts.isLoading ? (
            <p className="text-xs text-muted-foreground">Searching…</p>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="uppercase text-[0.6rem] tracking-[0.2em]">
                  Results
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {hasResults ? "Select a record to jump in." : "No matches yet."}
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    Patients
                  </div>
                  <div className="mt-2 space-y-2">
                    {(patients.data ?? []).slice(0, 4).map((patient) => (
                      <Link
                        key={patient.id}
                        href={`/dashboard/patients/${patient.id}`}
                        onClick={() => setOpen(false)}
                        className="block rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-sm text-foreground hover:bg-muted/50"
                      >
                        {patient.first_name} {patient.last_name}
                      </Link>
                    ))}
                    {patients.data?.length === 0 && (
                      <p className="text-xs text-muted-foreground">No matching patients.</p>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                    <ListChecks className="h-3.5 w-3.5" />
                    Tasks
                  </div>
                  <div className="mt-2 space-y-2">
                    {(tasks.data ?? []).slice(0, 4).map((task) => (
                      <Link
                        key={task.id}
                        href={`/dashboard/tasks?search=${encodeURIComponent(trimmed)}`}
                        onClick={() => setOpen(false)}
                        className="block rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-sm text-foreground hover:bg-muted/50"
                      >
                        {task.title}
                      </Link>
                    ))}
                    {tasks.data?.length === 0 && (
                      <p className="text-xs text-muted-foreground">No matching tasks.</p>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                    <Layers className="h-3.5 w-3.5" />
                    Cohorts
                  </div>
                  <div className="mt-2 space-y-2">
                    {(cohorts.data ?? []).slice(0, 4).map((cohort) => (
                      <Link
                        key={cohort.id}
                        href={`/dashboard/cohorts?search=${encodeURIComponent(trimmed)}`}
                        onClick={() => setOpen(false)}
                        className="block rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-sm text-foreground hover:bg-muted/50"
                      >
                        {cohort.name}
                      </Link>
                    ))}
                    {cohorts.data?.length === 0 && (
                      <p className="text-xs text-muted-foreground">No matching cohorts.</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>Jump to:</span>
                  <Link
                    href={`/dashboard/patients?search=${encodeURIComponent(trimmed)}`}
                    onClick={() => setOpen(false)}
                    className="underline underline-offset-4"
                  >
                    Patients
                  </Link>
                  <Link
                    href={`/dashboard/tasks?search=${encodeURIComponent(trimmed)}`}
                    onClick={() => setOpen(false)}
                    className="underline underline-offset-4"
                  >
                    Tasks
                  </Link>
                  <Link
                    href={`/dashboard/cohorts?search=${encodeURIComponent(trimmed)}`}
                    onClick={() => setOpen(false)}
                    className="underline underline-offset-4"
                  >
                    Cohorts
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
