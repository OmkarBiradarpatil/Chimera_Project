import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/chimera/page-header";
import { StatusChip } from "@/components/chimera/status-chip";
import { Button } from "@/components/ui/button";
import { timelineEvents } from "@/lib/mock-data";
import { format } from "date-fns";
import {
  MessageSquare,
  Landmark,
  MapPin,
  FileText,
  Users,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  Filter,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/timeline")({
  head: () => ({
    meta: [
      { title: "Timeline — Chimera" },
      { name: "description", content: "Interactive chronological timeline auto-generated from evidence." },
    ],
  }),
  component: TimelinePage,
});

const CATEGORY_ICON = {
  communication: MessageSquare,
  transaction: Landmark,
  movement: MapPin,
  document: FileText,
  meeting: Users,
  alert: AlertTriangle,
} as const;

const CATEGORY_COLOR: Record<string, string> = {
  communication: "var(--info)",
  transaction: "var(--warning)",
  movement: "var(--chart-3)",
  document: "var(--muted-foreground)",
  meeting: "var(--success)",
  alert: "var(--destructive)",
};

function TimelinePage() {
  return (
    <div>
      <PageHeader
        eyebrow="Operation Meridian"
        title="Timeline"
        description="Every event, correlated across sources. Click any card to open the underlying evidence."
        actions={
          <div className="flex items-center gap-1">
            <Button size="sm" variant="outline" className="h-8 gap-1.5">
              <Filter className="h-3.5 w-3.5" /> Filter
            </Button>
            <Button size="icon" variant="outline" className="h-8 w-8" aria-label="Zoom out">
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
            <Button size="icon" variant="outline" className="h-8 w-8" aria-label="Zoom in">
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
          </div>
        }
      />

      <div className="p-4 md:p-6">
        <div className="relative rounded-xl border border-border/60 bg-card">
          {/* month header rail */}
          <div className="grid grid-cols-4 border-b border-border/60 divide-x divide-border/60">
            {["March 2026", "April 2026", "May 2026", "June 2026"].map((m) => (
              <div key={m} className="px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                {m}
              </div>
            ))}
          </div>

          <div className="relative py-6">
            <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-border to-transparent" />
            <ol className="space-y-3 px-4">
              {timelineEvents.map((e, i) => {
                const Icon = CATEGORY_ICON[e.category];
                const color = CATEGORY_COLOR[e.category];
                return (
                  <motion.li
                    key={e.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="group relative pl-16"
                  >
                    <div
                      className="absolute left-6 top-4 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full border-2 bg-background transition-transform group-hover:scale-110"
                      style={{ borderColor: color, boxShadow: `0 0 0 4px color-mix(in oklab, ${color} 15%, transparent)` }}
                    >
                      <Icon className="h-2.5 w-2.5" style={{ color }} />
                    </div>
                    <div className="rounded-lg border border-border/60 bg-background/60 p-3.5 transition-colors hover:border-border">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                            {format(new Date(e.timestamp), "dd MMM yyyy · HH:mm")}
                          </span>
                          <span
                            className="rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em]"
                            style={{ borderColor: `${color}66`, color, background: `color-mix(in oklab, ${color} 12%, transparent)` }}
                          >
                            {e.category}
                          </span>
                        </div>
                        <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                          conf {Math.round(e.confidence * 100)}%
                        </span>
                      </div>
                      <div className="mt-1.5 text-[13px] font-medium">{e.title}</div>
                      <p className="mt-0.5 text-[12px] text-muted-foreground">{e.description}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-1">
                        {e.entities.map((en) => (
                          <span
                            key={en}
                            className="rounded border border-border/60 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground"
                          >
                            {en}
                          </span>
                        ))}
                        <span className="ml-auto text-[10px] text-muted-foreground">
                          from <span className="font-mono">{e.evidenceId}</span>
                        </span>
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
