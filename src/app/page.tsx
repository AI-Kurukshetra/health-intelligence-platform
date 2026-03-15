import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  Brain,
  CheckCircle2,
  LineChart,
  ShieldCheck,
  Users,
  Workflow,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { HomeNav } from "@/components/home/home-nav";
import { ContentContainer } from "@/components/shared/content-container";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const featureHighlights = [
  {
    icon: Brain,
    title: "AI Risk Stratification",
    description:
      "Predict who will deteriorate next with tiered risk scoring and explainable factors.",
  },
  {
    icon: Activity,
    title: "Care Gap Command Center",
    description:
      "Surface missing screenings and follow-ups with priority queues your team can act on.",
  },
  {
    icon: Workflow,
    title: "Workflow Automation",
    description:
      "Trigger tasks and outreach the moment a patient crosses a risk threshold.",
  },
  {
    icon: LineChart,
    title: "Quality Measure Reporting",
    description:
      "Track HEDIS-style measures and demonstrate value-based care outcomes.",
  },
  {
    icon: Users,
    title: "Cohort Intelligence",
    description:
      "Segment populations by condition, risk tier, and engagement level.",
  },
  {
    icon: ShieldCheck,
    title: "Role-Based Operations",
    description:
      "Give every admin, analyst, and clinician the right view at the right time.",
  },
];

const outcomes = [
  "Reduce avoidable admissions by intervening earlier.",
  "Close care gaps faster with targeted outreach.",
  "Give leadership a real-time pulse on population health.",
];

const faqs = [
  {
    question: "What is HealthIQ?",
    answer:
      "HealthIQ is a web-based, AI-powered Population Health Management platform that helps healthcare organizations identify high-risk patients, close care gaps, coordinate care teams, and prove outcomes in value-based care contracts.",
  },
  {
    question: "Which core modules does the platform include?",
    answer:
      "Risk stratification, population KPIs and charts, care gap management, patient profiles, cohorts, care coordination tasks, workflow automation, quality measures reporting, and secure authentication with role-based access.",
  },
  
  {
    question: "What data is required to power the platform?",
    answer:
      "Core data includes organizations, users/roles, patients, conditions, risk scores, care gaps, care plans, tasks, outreach logs, quality measures, workflows, and cohorts. These enable risk insights, gap tracking, and coordinated care actions.",
  },
  {
    question: "How does AI risk scoring work?",
    answer:
      "Risk scoring returns structured JSON with score, tier, and factors, is stored for auditability, and is not re-run on unchanged patients within 24 hours. Batch scoring is supported via edge functions.",
  },
  
];

const personas = [
  {
    title: "Care Managers",
    description: "Daily queue of highest-risk patients, tasks, and outreach activity.",
  },
  {
    title: "Clinical Leaders",
    description: "Population-wide KPIs, quality measures, and outcome reporting.",
  },
  {
    title: "Admins",
    description: "Workflow configuration, user permissions, and audit-ready logs.",
  },
];

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
        <ContentContainer variant="wide" className="flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Brain className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">HealthIQ</p>
              <p className="text-xs text-muted-foreground">Population Health OS</p>
            </div>
          </Link>
          <HomeNav user={user} />
        </ContentContainer>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -top-44 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
            <div className="absolute top-4 right-10 h-80 w-80 rounded-full bg-secondary/40 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-accent/40 blur-3xl" />
          </div>
          <ContentContainer variant="wide" className="py-20 md:py-28">
            <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
              <div className="space-y-7">
                <Badge variant="secondary" className="w-fit">
                  AI Population Health Platform
                </Badge>
                <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
                  Turn reactive care into proactive population health.
                </h1>
                <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
                  HealthIQ helps care teams identify high-risk patients, close care gaps, and
                  coordinate interventions with real-time dashboards, AI scoring, and workflow
                  automation.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    size="lg"
                    icon={<ArrowRight className="h-4 w-4" />}
                    iconPosition="end"
                    render={
                      <Link href={user ? "/dashboard" : "/auth/sign-in"}>Explore Dashboard</Link>
                    }
                    nativeButton={false}
                  />
                  <Button
                    size="lg"
                    variant="outline"
                    render={<Link href="/auth/sign-up">Request Demo</Link>}
                    nativeButton={false}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    "Unified risk, gaps, and tasks",
                    "Role-aware workflows",
                    "Audit-ready analytics",
                  ].map((copy) => (
                    <Card key={copy} size="sm" className="border-border/60 bg-card/70">
                      <CardContent className="text-xs text-muted-foreground">{copy}</CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <Card className="border-border/60 bg-card/80">
                <CardContent className="space-y-6 p-7">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Platform Preview
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-foreground">
                      A single command center for population health teams.
                    </p>
                  </div>
                  <div className="grid gap-3">
                    {[
                      "AI risk tiers and factors",
                      "Care gap prioritization",
                      "Workflow automation",
                      "Quality measure tracking",
                    ].map((item) => (
                      <div
                        key={item}
                        className="flex items-center justify-between rounded-lg border border-border/60 bg-background/70 px-3 py-2"
                      >
                        <p className="text-sm font-medium text-foreground">{item}</p>
                        <span className="text-xs text-muted-foreground">Ready</span>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-lg border border-border/60 bg-muted/50 p-4 text-sm text-muted-foreground">
                    Built for ACOs, health systems, and value-based care teams.
                  </div>
                </CardContent>
              </Card>
            </div>
          </ContentContainer>
        </section>

        <section id="platform" className="border-y border-border bg-muted/40">
          <ContentContainer variant="wide" className="py-16">
            <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
              <div className="space-y-3">
                <Badge variant="outline" className="w-fit">
                  Built for value-based care
                </Badge>
                <h2 className="font-display text-3xl font-semibold text-foreground">
                  A single command center for population health teams.
                </h2>
                <p className="text-muted-foreground">
                  HealthIQ unifies patient risk, care gaps, tasks, and quality measures into
                  a single surface so care teams can act faster.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                {[
                  "Real-time KPI visibility",
                  "Audit-ready workflows",
                  "Role-aware dashboards",
                  "Secure Supabase auth",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <BadgeCheck className="h-4 w-4 text-primary" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </ContentContainer>
        </section>

        <section id="features" className="py-20">
          <ContentContainer variant="wide" className="space-y-10">
            <div className="space-y-2">
              <Badge variant="secondary" className="w-fit">
                Core Modules
              </Badge>
              <h2 className="font-display text-3xl font-semibold text-foreground">
                Everything needed to run proactive care operations.
              </h2>
              <p className="text-muted-foreground">
                Align your teams around risk, care gaps, and workflows with AI-powered
                prioritization.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featureHighlights.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card key={feature.title} className="border-border/60 bg-card/80">
                    <CardContent className="space-y-3 p-6">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </span>
                      <h3 className="text-lg font-semibold text-foreground">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ContentContainer>
        </section>

        <section id="outcomes" className="bg-muted/30 py-20">
          <ContentContainer variant="wide" className="space-y-10">
            <div className="space-y-2">
              <Badge variant="outline" className="w-fit">
                Outcomes
              </Badge>
              <h2 className="font-display text-3xl font-semibold text-foreground">
                Deliver measurable results across your population.
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {outcomes.map((outcome) => (
                <Card key={outcome} className="border-border/60 bg-background/70">
                  <CardContent className="flex h-full flex-col gap-3 p-6">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <p className="text-sm text-muted-foreground">{outcome}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ContentContainer>
        </section>

        <section className="py-20">
          <ContentContainer variant="wide" className="space-y-10">
            <div className="space-y-2">
              <Badge variant="secondary" className="w-fit">
                Built for every role
              </Badge>
              <h2 className="font-display text-3xl font-semibold text-foreground">
                A focused workspace for every member of the care team.
              </h2>
              <p className="text-muted-foreground">
                HealthIQ adapts navigation, KPIs, and workflows based on the role of the
                user who signs in.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {personas.map((persona) => (
                <Card key={persona.title} className="border-border/60 bg-card/80">
                  <CardContent className="space-y-2 p-6">
                    <p className="text-lg font-semibold text-foreground">{persona.title}</p>
                    <p className="text-sm text-muted-foreground">{persona.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ContentContainer>
        </section>

        <section id="faq" className="border-y border-border bg-muted/40 py-20">
          <ContentContainer variant="wide" className="space-y-10">
            <div className="space-y-2">
              <Badge variant="secondary" className="w-fit">
                FAQs
              </Badge>
              <h2 className="font-display text-3xl font-semibold text-foreground">
                Answers to common population health questions.
              </h2>
              <p className="text-muted-foreground">
                Learn how HealthIQ fits into value-based care programs and day-to-day workflows.
              </p>
            </div>
            <Accordion  className="max-w-3xl">
              {faqs.map((faq) => (
                <AccordionItem key={faq.question} value={faq.question}>
                  <AccordionTrigger className="text-base text-foreground">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ContentContainer>
        </section>

        <section className="py-20">
          <ContentContainer variant="wide">
            <Card className="border-border/60 bg-gradient-to-br from-primary/10 via-card to-background">
              <CardContent className="grid gap-8 p-8 md:grid-cols-[1.4fr_0.6fr] md:items-center">
                <div className="space-y-3">
                  <Badge variant="outline" className="w-fit">
                    Launch ready
                  </Badge>
                  <h2 className="font-display text-3xl font-semibold text-foreground">
                    Ready to move population health forward?
                  </h2>
                  <p className="text-muted-foreground">
                    Sign in to explore the HealthIQ dashboard or request a demo for your
                    organization.
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <Button
                    size="lg"
                    render={<Link href={user ? "/dashboard" : "/auth/sign-in"}>Explore Dashboard</Link>}
                    nativeButton={false}
                  />
                  <Button
                    size="lg"
                    variant="outline"
                    render={<Link href="/auth/sign-up">Request Demo</Link>}
                    nativeButton={false}
                  />
                </div>
              </CardContent>
            </Card>
          </ContentContainer>
        </section>
      </main>

      <footer className="border-t border-border bg-background">
        <ContentContainer variant="wide" className="flex flex-col gap-4 py-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">HealthIQ</p>
            <p className="text-xs text-muted-foreground">
              AI-powered population health management platform.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span>Security-first infrastructure</span>
            <span>Supabase Auth + RLS</span>
            <span>Demo-ready in days</span>
          </div>
        </ContentContainer>
      </footer>
    </div>
  );
}
