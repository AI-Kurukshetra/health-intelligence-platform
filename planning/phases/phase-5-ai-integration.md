# Phase 5: AI Integration

## Goal
Introduce AI-generated risk scoring and (optional) care plan generation.

## Scope
- Risk scoring endpoint.
- Edge function for AI scoring (later).
- Cache scores in Postgres.

## Data Model
- `risk_scores`
- `care_plans` (optional for MVP)

## API Routes
- `POST /api/risk-scores/score`

## Tasks
1. Replace deterministic scoring with GPT-based edge function.
2. Add prompt template and JSON response validation.
3. Cache risk scores to avoid duplicate calls within 24 hours.
4. Add retries and fallback for AI errors.

## Exit Criteria
- Risk scoring produces AI-generated results stored in DB.
