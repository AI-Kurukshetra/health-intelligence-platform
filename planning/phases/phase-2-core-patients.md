# Phase 2: Core Patient Management

## Goal
Enable patient list and profile views with risk scoring and care gaps.

## Scope
- Patient list with risk tiers and risk score.
- Patient profile details and care gaps.
- Seed data for demo realism.

## Data Model
- `patients`
- `patient_conditions`
- `risk_scores`
- `care_gaps`
- `care_team_assignments`

## API Routes
- `GET /api/patients`
- `POST /api/patients`
- `GET /api/patients/:id`
- `PATCH /api/patients/:id`
- `GET /api/patients/:id/risk`
- `GET /api/patients/:id/gaps`
- `GET /api/risk-scores`

## UI/UX
- Dashboard -> Patients list page.
- Patient profile page with risk + care gaps sections.

## Tasks
1. Verify patients and risk scores API responses.
2. Add patient list filtering by risk tier and condition (UI filters).
3. Show risk score badge and tier in list.
4. Expand patient profile with conditions and care plans (read-only for MVP).
5. QA with seeded data.

## Exit Criteria
- Users can browse patients and see risk tiers.
- Patient profile shows risk score and care gaps.
