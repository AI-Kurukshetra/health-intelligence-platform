# Phase 3: Care Coordination Workflow

## Goal
Enable care teams to manage tasks and document outreach.

## Scope
- Task list and status tracking.
- Outreach log capture.
- Workflow rules for auto-task creation (MVP: create/update only).

## Data Model
- `tasks`
- `outreach_log`
- `workflows`

## API Routes
- `GET /api/tasks`
- `POST /api/tasks`
- `PATCH /api/tasks/:id`
- `GET /api/workflows`
- `POST /api/workflows`
- `PATCH /api/workflows/:id`

## UI/UX
- Dashboard -> Tasks
- Dashboard -> Workflows

## Tasks
1. Add task status/priority filters.
2. Add create task form (modal or inline).
3. Add workflow create/update form (admin only).
4. Hook up outreach log capture (optional UI).

## Exit Criteria
- Tasks can be viewed and updated.
- Workflows can be created/edited by admins.
