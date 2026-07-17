import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  Plus,
  Search,
  LayoutGrid,
  Rows3,
  Pin,
  MoreHorizontal,
  Users,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { PageHeader } from "@/components/chimera/page-header";
import { StatusChip } from "@/components/chimera/status-chip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cases } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/cases")({
  head: () => ({
    meta: [
      { title: "Cases — Chimera" },
      { name: "description", content: "Browse, filter, and manage active investigations in Chimera." },
    ],
  }),
  component: CasesPage,
});

function CasesPage() {
  const [view, setView] = useState<"table" | "grid">("table");
  const [query, setQuery] = useState("");

  const filtered = cases.filter(
    (c) =>
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.code.toLowerCase().includes(query.toLowerCase()) ||
      c.tags.some((t) => t.includes(query.toLowerCase())),
  );

  return (
    <div>
      <PageHeader
        eyebrow="Investigations"
        title="Cases"
        description="Every active, review-stage, and archived investigation in your workspace."
        actions={
          <Button size="sm" className="h-8 gap-1.5">
            <Plus className="h-3.5 w-3.5" /> New case
          </Button>
        }
      />

      <div className="border-b border-border/60 bg-background/60 px-4 py-3 md:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter cases…"
              className="h-8 pl-8 text-xs"
            />
          </div>
          <Button variant="outline" size="sm" className="h-8 text-xs">
            All statuses
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs">
            All priorities
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs">
            Owner: any
          </Button>
          <div className="ml-auto">
            <ToggleGroup
              type="single"
              value={view}
              onValueChange={(v) => v && setView(v as "table" | "grid")}
              className="rounded-md border border-border"
            >
              <ToggleGroupItem value="table" className="h-8 w-8" aria-label="Table view">
                <Rows3 className="h-3.5 w-3.5" />
              </ToggleGroupItem>
              <ToggleGroupItem value="grid" className="h-8 w-8" aria-label="Grid view">
                <LayoutGrid className="h-3.5 w-3.5" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6">
        {view === "table" ? (
          <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
            <div className="grid grid-cols-12 border-b border-border/60 bg-background/40 px-4 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              <div className="col-span-5">Case</div>
              <div className="col-span-2">Priority</div>
              <div className="col-span-2">Owner</div>
              <div className="col-span-2">Metrics</div>
              <div className="col-span-1 text-right">Health</div>
            </div>
            <div className="divide-y divide-border/60">
              {filtered.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={cn(
                    "group grid grid-cols-12 items-center gap-3 px-4 py-3.5 transition-colors hover:bg-accent/30",
                  )}
                >
                  <div className="col-span-5 min-w-0">
                    <div className="flex items-center gap-2">
                      {c.pinned && <Pin className="h-3 w-3 text-primary" />}
                      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        {c.code}
                      </span>
                      <StatusChip value={c.status} />
                    </div>
                    <div className="mt-0.5 truncate text-sm font-medium">{c.title}</div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {c.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded border border-border/60 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <StatusChip value={c.priority} />
                  </div>
                  <div className="col-span-2 flex items-center gap-2 min-w-0">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[10px] font-medium text-primary">
                      {c.ownerAvatar}
                    </div>
                    <div className="truncate text-[12px]">{c.owner}</div>
                  </div>
                  <div className="col-span-2 flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><FileText className="h-3 w-3" /> {c.evidenceCount}</span>
                    <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> {c.entityCount}</span>
                    <span className="inline-flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> {c.contradictionCount}</span>
                  </div>
                  <div className="col-span-1 flex items-center justify-end gap-2">
                    <div className="w-14">
                      <Progress value={c.health} className="h-1" />
                    </div>
                    <button
                      className="rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-accent group-hover:opacity-100"
                      aria-label="More"
                    >
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((c, i) => (
              <motion.article
                key={c.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="group flex flex-col rounded-xl border border-border/60 bg-card p-4 transition-all hover:border-border hover:shadow-[0_12px_32px_-16px_rgba(0,0,0,0.6)]"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    {c.code}
                  </span>
                  <StatusChip value={c.status} />
                  {c.pinned && <Pin className="ml-auto h-3 w-3 text-primary" />}
                </div>
                <h3 className="mt-2 text-[15px] font-semibold leading-tight tracking-tight">{c.title}</h3>
                <p className="mt-1.5 text-[12px] leading-snug text-muted-foreground line-clamp-3">
                  {c.description}
                </p>
                <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border/60 pt-3 text-[11px]">
                  <div>
                    <div className="text-muted-foreground">Evidence</div>
                    <div className="mt-0.5 font-mono text-sm tabular-nums">{c.evidenceCount}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Entities</div>
                    <div className="mt-0.5 font-mono text-sm tabular-nums">{c.entityCount}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Events</div>
                    <div className="mt-0.5 font-mono text-sm tabular-nums">{c.eventCount}</div>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-[10px] font-medium text-primary">
                    {c.ownerAvatar}
                  </div>
                  <span className="text-[11px] text-muted-foreground">{c.owner}</span>
                  <span className="ml-auto"><StatusChip value={c.priority} /></span>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
