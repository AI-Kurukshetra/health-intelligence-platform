# HealthIQ
AI-powered Population Health Management platform for value-based care teams.

## Overview
HealthIQ helps healthcare organizations identify high-risk patients, close care gaps, coordinate care teams, and prove outcomes in value-based care contracts. The platform unifies risk stratification, care gap management, workflows, and quality measures in a single role-aware dashboard.

## Key Capabilities
- AI risk stratification with tiers and explainable factors
- Population health KPIs and analytics dashboards
- Care gap detection and prioritization
- Patient profiles with clinical context
- Cohorts for segmentation and outreach
- Care coordination tasks and outreach logs
- Workflow automation and triggers
- Quality measure reporting
- Role-based access control and secure authentication

## Roles and Access
- Super Admin: cross-organization visibility, workflow configuration, user and access management
- Care Manager: patient lists, care gaps, tasks, and outreach workflows
- Analyst: aggregate analytics, quality measures, and reporting
- Physician and Org Admin: clinical and operational access aligned to their roles

## Tech Stack
- Next.js 16 (App Router) and TypeScript (strict mode)
- Supabase (Postgres, Auth, Storage, Realtime, Edge Functions)
- TanStack Query v5 for server state
- Axios client in `src/lib/api/client`
- shadcn/ui components with Tailwind CSS
- React Hook Form and Zod for forms and validation

## Project Structure
- `src/app` app routes and layouts
- `src/components` UI, shared, and dashboard components
- `src/hooks` TanStack Query hooks
- `src/lib` shared utilities and clients
- `src/types` shared types and Zod schemas
- `docs` product and API references
- `planning` product context and roadmap

## Getting Started
1. Install dependencies with your preferred package manager.
2. Create `./.env.local` using `./.env.example` as the reference.
3. Run the development server with `npm run dev`.

## Demo Script
See `docs/demo-video-script.md` for a ready-to-record walkthrough that covers platform overview and role-based flows.
