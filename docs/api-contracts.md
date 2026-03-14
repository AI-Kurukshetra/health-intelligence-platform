# API Contracts

> Source of truth for all API routes. Update this file whenever routes change.

---

## Conventions

- All routes are prefixed with `/api/`.
- JSON in, JSON out.
- Auth: Supabase session cookie (axios client sends credentials).
- **Success format:** `{ success: true, data: T, message?: string, metadata?: { pagination?: {...} } }`
- **Error format:** `{ success: false, error: { code?: string, message: string }, message?: string, details?: unknown }`
- Client uses `apiGet`, `apiPost`, `apiPatch`, `apiDelete` from `src/lib/api/client.ts`.

---

## Profile

### `GET /api/profile/current`

Returns the current user and profile (id, full_name, avatar_url, role).

**Response 200**
```json
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "email": "string | null" },
    "profile": { "id": "uuid", "full_name": "string | null", "avatar_url": "string | null", "role": "string" } | null
  }
}
```

---

## Patients

### `GET /api/patients`

List patients with pagination and filters.

**Query params**
`page`, `limit`, `risk_tier`, `condition_code`, `cohort_id`, `search`

**Response 200**
```json
{
  "success": true,
  "data": [{ "id": "uuid", "first_name": "string", "last_name": "string", "risk_tier": "high|medium|low" }],
  "metadata": { "pagination": { "page": 1, "limit": 20, "total": 200 } }
}
```

### `POST /api/patients`

Create a patient.

**Request**
```json
{
  "first_name": "string",
  "last_name": "string",
  "dob": "YYYY-MM-DD",
  "gender": "string",
  "email": "string | null",
  "phone": "string | null"
}
```

### `GET /api/patients/:id`

Get a full patient profile.

### `PATCH /api/patients/:id`

Update patient fields.

### `GET /api/patients/:id/risk`

Latest risk score and factors.

### `GET /api/patients/:id/gaps`

Open care gaps for the patient.

### `GET /api/patients/:id/conditions`

Active and chronic conditions for the patient.

### `GET /api/patients/:id/care-plans`

Care plans for the patient.

---

## Risk Scores

### `GET /api/risk-scores`

List recent risk scores (optional filters by patient_id, risk_tier).

### `POST /api/risk-scores/score`

Trigger scoring for a patient (AI or deterministic fallback).

**Request**
```json
{ "patient_id": "uuid" }
```

---

## Care Gaps

### `GET /api/care-gaps`

List gaps by status and priority.

### `PATCH /api/care-gaps/:id`

Update status, close gap, or add notes.

---

## Tasks

### `GET /api/tasks`

List tasks with filters: `status`, `assignee_id`, `priority`, `due_date`, `search`, `limit`.

### `POST /api/tasks`

Create a task for a patient.

### `PATCH /api/tasks/:id`

Update task status, assignee, or notes.

---

## Cohorts

### `GET /api/cohorts`

List cohorts for the org.

**Query params**
`search`, `limit`

### `POST /api/cohorts`

Create a cohort with filter_config.

---

## Workflows

### `GET /api/workflows`

List workflows.

### `POST /api/workflows`

Create a workflow.

### `PATCH /api/workflows/:id`

Update workflow config or activation.

---

## Analytics

### `GET /api/analytics/kpis`

Returns KPI values for dashboard cards.

### `GET /api/analytics/quality-measures`

Returns HEDIS-style measures for the org.

---

## Errors

All endpoints may return:
- 401 for unauthenticated
- 403 for unauthorized
- 404 for missing resources
- 500 for server errors
