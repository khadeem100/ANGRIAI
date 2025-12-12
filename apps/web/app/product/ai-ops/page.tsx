import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";

export const metadata: Metadata = {
  title: "AI Ops — Angri",
  description:
    "Angri is the AI that runs your business operations from the inbox — creating leads, quotes, invoices, tickets, tasks and more across tools like Odoo, QuickBooks, Stripe, Notion, Monday, HubSpot.",
};

export default function AIOpsPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
      
      <section className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          New • AI that does the work
        </div>
        <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight md:text-6xl">
          Automate real business ops — from your inbox
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-pretty text-base text-muted-foreground md:text-lg">
          Angri turns emails into actions across your stack. Create leads, quotes, invoices, tickets,
          and tasks automatically in tools like Odoo, QuickBooks, Stripe, Monday, Notion, HubSpot and more.
          Review drafts where it matters — or let it run on autopilot.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="group">
            <Link href="/">
              Get started <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/">Book a demo</Link>
          </Button>
        </div>
        <p className="mt-6 text-xs text-muted-foreground">
          Connect: Odoo • QuickBooks • Stripe • Monday • Notion • HubSpot • Google • Microsoft • more coming soon
        </p>
      </section>

      <section className="mt-10">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {[
            { name: "Odoo" },
            { name: "QuickBooks" },
            { name: "Stripe" },
            { name: "Monday" },
            { name: "Notion" },
            { name: "HubSpot" },
          ].map((i) => (
            <div key={i.name} className="flex items-center justify-center rounded-lg border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground">
              {i.name}
            </div>
          ))}
        </div>
      </section>

      
      <section className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Operate from email",
            desc: "Turn inbound emails into CRM records, quotes, invoices, tickets and tasks automatically.",
          },
          {
            title: "Safe by default",
            desc: "Draft-first replies and approvals; typed, scoped tools prevent risky actions.",
          },
          {
            title: "Self-host & private",
            desc: "Run on your infra, bring your own LLM keys, or use local models with Ollama.",
          },
          {
            title: "EU-ready",
            desc: "Data control with encryption-at-rest (AES-256-GCM) and minimal data sharing.",
          },
        ].map((c) => (
          <div key={c.title} className="rounded-xl border bg-card p-6">
            <h3 className="text-base font-semibold">{c.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{c.desc}</p>
          </div>
        ))}
      </section>

      
      <section className="mt-20 grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">How it works</h2>
          <ul className="mt-6 space-y-4 text-sm">
            {[
              "Connect your tools (ERP, CRM, Accounting, PM, Support) in minutes.",
              "Tell Angri what to do in plain English or via rules.",
              "Angri reads emails, decides next steps, and calls the right tools.",
              "You approve where needed; otherwise it runs hands‑off.",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3">
                <Check className="mt-0.5 h-4 w-4 text-emerald-500" />
                <span className="text-muted-foreground">{t}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <Button asChild>
              <Link href="/">Connect your tools</Link>
            </Button>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6">
          <h3 className="text-base font-semibold">Example automations</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {[
              {
                title: "Sales ops",
                lines: [
                  "Create CRM lead from inbound interest",
                  "Generate quote and send draft",
                  "Push order → invoice in ERP/Accounting",
                ],
              },
              {
                title: "Finance",
                lines: [
                  "Create customer + draft invoice in QuickBooks/Odoo",
                  "Reply with payment link",
                  "Flag late payment and nudge",
                ],
              },
              {
                title: "Support",
                lines: [
                  "Open helpdesk ticket from email",
                  "Tag priority and route",
                  "Draft status update",
                ],
              },
              {
                title: "Projects & ops",
                lines: [
                  "Create task in Monday/Notion",
                  "Assign owner and due date",
                  "Summarize thread to task notes",
                ],
              },
            ].map((b) => (
              <div key={b.title} className="rounded-lg border p-4">
                <div className="text-sm font-semibold">{b.title}</div>
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  {b.lines.map((l) => (
                    <li key={l} className="flex items-start gap-2">
                      <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-foreground/70" />
                      <span>{l}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      
      <section className="mt-20">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Why teams choose Angri</h2>
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {[
            {
              title: "Actionable AI, not just chat",
              desc: "Typed, scoped tool calls let Angri perform real operations (create, update, post) across your systems.",
            },
            {
              title: "Human‑in‑the‑loop where it matters",
              desc: "Reply drafts and approvals keep you in control. Flip to autopilot for mature workflows.",
            },
            {
              title: "Open, extensible, and private",
              desc: "Self‑host ready, bring your own LLM keys, or run locally via Ollama. Encryption at rest by default.",
            },
          ].map((f) => (
            <div key={f.title} className="rounded-xl border bg-card p-6">
              <h3 className="text-base font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      
      <section className="mt-20 rounded-2xl border bg-gradient-to-b from-background to-muted/30 p-8 text-center md:p-12">
        <h3 className="text-2xl font-semibold md:text-3xl">Let Angri run your back office</h3>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
          Connect your tools, tell it what to do, and watch admin work disappear. Start with approvals, then go autopilot.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild size="lg" className="group">
            <Link href="/">
              Start free <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/">Talk to sales</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
