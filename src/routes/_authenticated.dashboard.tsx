import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Sparkles,
  AlertTriangle,
  FileText,
  Users,
  ArrowUpRight,
  TrendingUp,
  Plus,
  Upload,
} from "lucide-react";
import { PageHeader, StatPill, SectionTitle } from "@/components/chimera/page-header";
import { StatusChip } from "@/components/chimera/status-chip";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  cases,
  evidence,
  contradictions,
  activityFeed,
  timelineEvents,
  entityDistribution,
} from "@/lib/mock-data";
import { formatDistanceToNow } from "date-fns";
import { formatDayMonth, formatNumber } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Chimera" },
      {
        name: "description",
        content:
          "Executive dashboard for Chimera: active cases, recent evidence, contradictions, and AI insights across your investigations.",
      },
    ],
  }),
  component: Dashboard,
});

const fadeUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
};

function Dashboard() {
  const activeCases = cases.filter((c) => c.status === "active");
  const openContradictions = contradictions.filter((c) => c.status !== "dismissed");
  const recentEvidence = [...evidence].slice(0, 5);

  return (
    <div>
      <PageHeader
        eyebrow="Overview"
        title="Good morning, Elena"
        description="Here's what's happening across your investigations today."
        actions={
          <>
            <Button variant="outline" size="sm" className="h-8 gap-1.5">
              <Upload className="h-3.5 w-3.5" /> Upload
            </Button>
            <Button size="sm" className="h-8 gap-1.5">
              <Plus className="h-3.5 w-3.5" /> New case
            </Button>
          </>
        }
      />

      <div className="grid-bg absolute inset-0 -z-10 opacity-40" aria-hidden />

      <div className="space-y-6 p-4 md:p-6">
        {/* Stats */}
        <motion.div
          initial="initial"
          animate="animate"
          transition={{ staggerChildren: 0.05 }}
          className="grid grid-cols-2 gap-3 md:grid-cols-4"
        >
          {[
            { label: "Active cases", value: activeCases.length, trend: "+2 this week", intent: "success" as const },
            { label: "Evidence items", value: formatNumber(cases.reduce((s, c) => s + c.evidenceCount, 0)), trend: "+118 today", intent: "success" as const },
            { label: "Entities extracted", value: cases.reduce((s, c) => s + c.entityCount, 0), trend: "+47 last 24h", intent: "default" as const },
            { label: "Open contradictions", value: openContradictions.length, trend: "1 critical", intent: "warning" as const },
          ].map((s) => (
            <motion.div key={s.label} variants={fadeUp}>
              <StatPill {...s} />
            </motion.div>
          ))}
        </motion.div>

        {/* Row 1: Active cases + AI insights */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <motion.section
            variants={fadeUp}
            initial="initial"
            animate="animate"
            className="col-span-2 rounded-xl border border-border/60 bg-card"
          >
            <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold">Active investigations</h3>
                <StatusChip value="live" />
              </div>
              <Link
                to="/cases"
                className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
              >
                View all <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="divide-y divide-border/60">
              {activeCases.slice(0, 4).map((c) => (
                <Link
                  key={c.id}
                  to="/cases"
                  className="group grid grid-cols-12 gap-3 px-4 py-3.5 transition-colors hover:bg-accent/30"
                >
                  <div className="col-span-5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        {c.code}
                      </span>
                      <StatusChip value={c.priority} />
                    </div>
                    <div className="mt-0.5 truncate text-sm font-medium">{c.title}</div>
                  </div>
                  <div className="col-span-2 flex flex-col justify-center">
                    <div className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Evidence</div>
                    <div className="font-mono text-sm tabular-nums">{c.evidenceCount}</div>
                  </div>
                  <div className="col-span-2 flex flex-col justify-center">
                    <div className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Entities</div>
                    <div className="font-mono text-sm tabular-nums">{c.entityCount}</div>
                  </div>
                  <div className="col-span-3 flex flex-col justify-center">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Health</span>
                      <span className="font-mono text-[10px]">{c.health}%</span>
                    </div>
                    <Progress value={c.health} className="h-1" />
                  </div>
                </Link>
              ))}
            </div>
          </motion.section>

          <motion.section
            variants={fadeUp}
            initial="initial"
            animate="animate"
            className="rounded-xl border border-border/60 bg-card p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/15 text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <h3 className="text-sm font-semibold">AI insights</h3>
              </div>
              <span className="font-mono text-[10px] text-muted-foreground">3 new</span>
            </div>
            <ul className="space-y-3">
              <li className="rounded-lg border border-border/60 bg-background/60 p-3">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-[color:var(--warning)]">
                  <TrendingUp className="h-3 w-3" /> Pattern detected
                </div>
                <p className="mt-1 text-[13px] leading-snug">
                  71% of Sundara BV outbound wires route through a single LU intermediary before onward transfer to Aventis.
                </p>
              </li>
              <li className="rounded-lg border border-border/60 bg-background/60 p-3">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-[color:var(--info)]">
                  <Users className="h-3 w-3" /> Cross-case link
                </div>
                <p className="mt-1 text-[13px] leading-snug">
                  Entity <span className="font-mono">Aventis Capital SA</span> appears in Meridian and Halcyon. Consider linking cases.
                </p>
              </li>
              <li className="rounded-lg border border-border/60 bg-background/60 p-3">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-[color:var(--destructive)]">
                  <AlertTriangle className="h-3 w-3" /> Contradiction
                </div>
                <p className="mt-1 text-[13px] leading-snug">
                  Location conflict on 12 April: hotel invoice (Zurich) vs. signed witness statement (Geneva). Confidence 0.87.
                </p>
              </li>
            </ul>
          </motion.section>
        </div>

        {/* Row 2: Recent evidence + entity distribution + activity */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <motion.section
            variants={fadeUp}
            initial="initial"
            animate="animate"
            className="rounded-xl border border-border/60 bg-card"
          >
            <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
              <h3 className="text-sm font-semibold">Recent evidence</h3>
              <Link to="/evidence" className="text-[11px] text-muted-foreground hover:text-foreground">
                Library →
              </Link>
            </div>
            <ul className="divide-y divide-border/60">
              {recentEvidence.map((e) => (
                <li key={e.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background/60 text-muted-foreground">
                    <FileText className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-medium">{e.name}</div>
                    <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span>{e.size}</span>
                      <span>·</span>
                      <span className="font-mono">{e.type}</span>
                    </div>
                  </div>
                  <StatusChip value={e.status} />
                </li>
              ))}
            </ul>
          </motion.section>

          <motion.section
            variants={fadeUp}
            initial="initial"
            animate="animate"
            className="rounded-xl border border-border/60 bg-card p-4"
          >
            <SectionTitle>Entity distribution</SectionTitle>
            <ul className="space-y-2.5">
              {entityDistribution.map((e) => {
                const total = entityDistribution.reduce((s, x) => s + x.value, 0);
                const pct = Math.round((e.value / total) * 100);
                return (
                  <li key={e.name}>
                    <div className="mb-1 flex items-center justify-between text-[12px]">
                      <span>{e.name}</span>
                      <span className="font-mono tabular-nums text-muted-foreground">
                        {e.value} · {pct}%
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{
                          width: `${pct}%`,
                          background: e.color,
                        }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </motion.section>

          <motion.section
            variants={fadeUp}
            initial="initial"
            animate="animate"
            className="rounded-xl border border-border/60 bg-card"
          >
            <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
              <h3 className="text-sm font-semibold">Activity</h3>
              <span className="text-[11px] text-muted-foreground">Last 24 hours</span>
            </div>
            <ul className="divide-y divide-border/60">
              {activityFeed.slice(0, 6).map((a) => (
                <li key={a.id} className="flex items-start gap-3 px-4 py-2.5">
                  <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[12px] leading-snug">
                      <span className="font-medium">{a.actor}</span>
                      <span className="text-muted-foreground"> {a.action} </span>
                      <span className="font-medium">{a.target}</span>
                    </div>
                    <div className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                      {a.when}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </motion.section>
        </div>

        {/* Row 3: Timeline preview */}
        <motion.section
          variants={fadeUp}
          initial="initial"
          animate="animate"
          className="rounded-xl border border-border/60 bg-card"
        >
          <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
            <div>
              <h3 className="text-sm font-semibold">Recent timeline · Operation Meridian</h3>
              <p className="text-[11px] text-muted-foreground">Auto-generated from 412 evidence items</p>
            </div>
            <Link to="/timeline" className="text-[11px] text-muted-foreground hover:text-foreground">
              Open full timeline →
            </Link>
          </div>
          <div className="relative overflow-x-auto">
            <div className="flex min-w-max gap-3 px-4 py-4">
              {timelineEvents.slice(0, 6).map((e, i) => (
                <div key={e.id} className="relative w-64 shrink-0">
                  {i < timelineEvents.slice(0, 6).length - 1 && (
                    <div className="absolute left-full top-6 h-px w-3 bg-border" />
                  )}
                  <div className="rounded-lg border border-border/60 bg-background/60 p-3 transition-colors hover:border-border">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                        {formatDayMonth(e.timestamp)}
                      </span>
                      <span className="font-mono text-[9px] tabular-nums text-muted-foreground">
                        {Math.round(e.confidence * 100)}%
                      </span>
                    </div>
                    <div className="text-[12px] font-medium leading-snug">{e.title}</div>
                    <div className="mt-1 text-[11px] leading-snug text-muted-foreground line-clamp-2">
                      {e.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
