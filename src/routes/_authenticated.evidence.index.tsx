import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type DragEvent } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  Search,
  FileText,
  Mail,
  MessageSquare,
  Image as ImageIcon,
  Table,
  FileSignature,
  Landmark,
  Phone,
} from "lucide-react";
import { PageHeader } from "@/components/chimera/page-header";
import { StatusChip } from "@/components/chimera/status-chip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { evidence } from "@/lib/mock-data";
import type { EvidenceType } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/evidence/")({
  head: () => ({
    meta: [
      { title: "Evidence — Chimera" },
      {
        name: "description",
        content: "Upload, browse, and search all evidence across your investigations with AI-extracted metadata.",
      },
    ],
  }),
  component: EvidencePage,
});

const ICON_FOR: Record<EvidenceType, typeof FileText> = {
  pdf: FileText,
  image: ImageIcon,
  email: Mail,
  chat: MessageSquare,
  statement: FileSignature,
  financial: Landmark,
  "call-log": Phone,
  csv: Table,
};

function EvidencePage() {
  const [drag, setDrag] = useState(false);
  const [query, setQuery] = useState("");
  const filtered = evidence.filter(
    (e) =>
      e.name.toLowerCase().includes(query.toLowerCase()) ||
      e.entities.some((en) => en.toLowerCase().includes(query.toLowerCase())),
  );

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDrag(false);
    toast.success("Upload started", {
      description: `${e.dataTransfer.files.length} file(s) queued for extraction.`,
    });
  };

  return (
    <div>
      <PageHeader
        eyebrow="Case files"
        title="Evidence library"
        description="Everything you've ingested. AI extracts entities, timestamps, and relationships automatically."
        actions={
          <Button size="sm" className="h-8 gap-1.5">
            <Upload className="h-3.5 w-3.5" /> Upload
          </Button>
        }
      />

      <div className="space-y-4 p-4 md:p-6">
        {/* Upload dropzone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
          className={`relative overflow-hidden rounded-xl border-2 border-dashed p-6 transition-colors ${
            drag ? "border-primary bg-primary/5" : "border-border/60 bg-card"
          }`}
        >
          <div className="flex flex-col items-center justify-center gap-2 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Upload className="h-5 w-5" />
            </div>
            <div className="text-sm font-medium">Drop files here to ingest</div>
            <p className="max-w-md text-[12px] text-muted-foreground">
              PDF, images, CSV, EML, WhatsApp exports, bank statements. Files are encrypted at rest and
              processed with entity extraction, OCR, and embedding indexing.
            </p>
            <Button variant="outline" size="sm" className="mt-1 h-8 text-xs">
              Choose files
            </Button>
          </div>
        </div>

        {/* Search + filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search evidence, entities, tags…"
              className="h-8 pl-8 text-xs"
            />
          </div>
          <Button variant="outline" size="sm" className="h-8 text-xs">All types</Button>
          <Button variant="outline" size="sm" className="h-8 text-xs">All statuses</Button>
          <Button variant="outline" size="sm" className="h-8 text-xs">Sort: newest</Button>
        </div>

        {/* Evidence grid */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((e, i) => {
            const Icon = ICON_FOR[e.type];
            return (
              <motion.article
                key={e.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="group flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card transition-all hover:border-border hover:shadow-[0_12px_32px_-16px_rgba(0,0,0,0.6)] focus-within:ring-2 focus-within:ring-ring"
              >
                <Link
                  to="/evidence/$id"
                  params={{ id: e.id }}
                  className="flex flex-1 flex-col outline-none"
                  aria-label={`Open ${e.name}`}
                >
                <div className="flex items-start gap-3 border-b border-border/60 p-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background/60 text-muted-foreground">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-medium">{e.name}</div>
                    <div className="mt-0.5 flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                      <span className="font-mono">{e.type}</span>
                      <span>·</span>
                      <span>{e.size}</span>
                    </div>
                  </div>
                  <StatusChip value={e.status} />
                </div>

                {e.status === "processing" ? (
                  <div className="space-y-2 p-3.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground">Extracting entities…</span>
                      <span className="font-mono tabular-nums">62%</span>
                    </div>
                    <Progress value={62} className="h-1" />
                  </div>
                ) : (
                  <>
                    <p className="p-3.5 text-[12px] leading-snug text-muted-foreground line-clamp-3">
                      {e.summary}
                    </p>
                    <div className="mt-auto flex flex-wrap gap-1 border-t border-border/60 p-3">
                      {e.entities.slice(0, 3).map((en) => (
                        <span
                          key={en}
                          className="rounded border border-border/60 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground"
                        >
                          {en}
                        </span>
                      ))}
                      {e.entities.length > 3 && (
                        <span className="rounded border border-border/60 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
                          +{e.entities.length - 3}
                        </span>
                      )}
                      <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                        {Math.round(e.confidence * 100)}%
                      </span>
                    </div>
                  </>
                )}
                </Link>
              </motion.article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
