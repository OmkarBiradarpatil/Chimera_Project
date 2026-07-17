import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { AlertTriangle, FileText, ArrowRight, Check, X } from "lucide-react";
import { PageHeader, StatPill } from "@/components/chimera/page-header";
import { StatusChip } from "@/components/chimera/status-chip";
import { Button } from "@/components/ui/button";
import { contradictions } from "@/lib/mock-data";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_authenticated/contradictions")({
  head: () => ({
    meta: [
      { title: "Contradictions — Chimera" },
      {
        name: "description",
        content: "Possible contradictions detected across evidence, with severity, confidence, and citations.",
      },
    ],
  }),
  component: ContradictionsPage,
});

function ContradictionsPage() {
  const bySeverity = contradictions.reduce(
    (acc, c) => ({ ...acc, [c.severity]: (acc[c.severity] || 0) + 1 }),
    {} as Record<string, number>,
  );

  return (
    <div>
      <PageHeader
        eyebrow="Signal detection"
        title="Contradictions"
        description="Where the evidence disagrees with itself. Chimera flags conflicts; humans adjudicate."
      />

      <div className="space-y-4 p-4 md:p-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatPill label="Open" value={contradictions.filter((c) => c.status === "open").length} intent="danger" trend="requires review" />
          <StatPill label="Critical" value={bySeverity.critical ?? 0} intent="danger" />
          <StatPill label="High" value={bySeverity.high ?? 0} intent="warning" />
          <StatPill label="Avg. confidence" value={`${Math.round((contradictions.reduce((s, c) => s + c.confidence, 0) / contradictions.length) * 100)}%`} />
        </div>

        <div className="space-y-3">
          {contradictions.map((c, i) => (
            <motion.article
              key={c.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="overflow-hidden rounded-xl border border-border/60 bg-card"
            >
              <div className="flex flex-wrap items-start gap-3 border-b border-border/60 px-4 py-3">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{
                    background: `color-mix(in oklab, var(--${c.severity === "critical" ? "destructive" : c.severity === "high" ? "warning" : "info"}) 15%, transparent)`,
                    color: `var(--${c.severity === "critical" ? "destructive" : c.severity === "high" ? "warning" : "info"})`,
                  }}
                >
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusChip value={c.severity} />
                    <StatusChip value={c.status} />
                    <span className="font-mono text-[10px] text-muted-foreground">
                      conf {Math.round(c.confidence * 100)}%
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      · detected {formatDistanceToNow(new Date(c.detectedAt))} ago
                    </span>
                  </div>
                  <h3 className="mt-1 text-[14px] font-semibold">{c.title}</h3>
                  <p className="mt-1 text-[12px] text-muted-foreground">{c.description}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs">
                    <Check className="h-3.5 w-3.5" /> Review
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 gap-1.5 text-xs">
                    <X className="h-3.5 w-3.5" /> Dismiss
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 divide-border/60 md:grid-cols-[1fr_auto_1fr] md:divide-x">
                <ComparisonCell label="Source A" ev={c.evidenceA} />
                <div className="flex items-center justify-center py-3 md:py-6">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-muted-foreground">
                    <ArrowRight className="h-3.5 w-3.5 rotate-0 md:rotate-0" />
                  </div>
                </div>
                <ComparisonCell label="Source B" ev={c.evidenceB} />
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
}

function ComparisonCell({
  label,
  ev,
}: {
  label: string;
  ev: { id: string; name: string; excerpt: string };
}) {
  return (
    <div className="p-4">
      <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </div>
      <div className="flex items-center gap-2">
        <FileText className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="truncate text-[12px] font-medium">{ev.name}</span>
      </div>
      <blockquote className="mt-2 border-l-2 border-border pl-3 text-[12px] italic text-muted-foreground">
        {ev.excerpt}
      </blockquote>
    </div>
  );
}
