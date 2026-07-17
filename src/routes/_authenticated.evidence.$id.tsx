import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Download,
  Share2,
  Sparkles,
  FileText,
  Mail,
  MessageSquare,
  Image as ImageIcon,
  Table,
  FileSignature,
  Landmark,
  Phone,
  ChevronLeft,
  ChevronRight,
  Search,
  Clock,
  Users,
} from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/chimera/page-header";
import { StatusChip } from "@/components/chimera/status-chip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { evidence, timelineEvents, contradictions } from "@/lib/mock-data";
import type { EvidenceType } from "@/lib/mock-data";
import { formatDate, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/evidence/$id")({
  loader: ({ params }) => {
    const item = evidence.find((e) => e.id === params.id);
    if (!item) throw notFound();
    return { item };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.item.name ?? "Evidence"} — Chimera` },
      {
        name: "description",
        content:
          loaderData?.item.summary ??
          "Evidence document viewer with AI-extracted entities, timeline references, and related contradictions.",
      },
    ],
  }),
  notFoundComponent: NotFound,
  errorComponent: ({ error, reset }) => (
    <div className="p-8 text-sm">
      <div className="font-semibold">Couldn't load this evidence item.</div>
      <div className="mt-1 text-muted-foreground">{error.message}</div>
      <Button size="sm" variant="outline" className="mt-3 h-8" onClick={reset}>
        Retry
      </Button>
    </div>
  ),
  component: EvidenceViewer,
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

// Deterministic pseudo-document body per evidence id.
const BODY_FOR: Record<string, string[]> = {
  "ev-001": [
    "SUNDARA HOLDINGS BV — Deed of Incorporation",
    "This deed is made on the 8th day of March, 2026, by the undersigned notary in the presence of the sole appearing party.",
    "Article 1. The company is a private limited liability company (besloten vennootschap) under the name Sundara Holdings BV, with its registered office at Weena 690, 3012 CN Rotterdam, the Netherlands.",
    "Article 2. The sole director shall be Ilya Novak, of Estonian nationality, residing at Narva mnt 7, Tallinn.",
    "Article 3. The authorised share capital is EUR 100 divided into 100 ordinary shares of EUR 1 each. All shares have been issued to and subscribed by the sole shareholder.",
    "Article 4. The corporate objects include holding participations, financing group companies, and any lawful commercial activity ancillary thereto.",
    "Cross-reference: registered address matches entries in the KvK virtual-office registry (see contradiction CX-4).",
  ],
  "ev-002": [
    "MERKAVA BANK — Wire Transfer Register (Q2, redacted)",
    "Account: NL62 MERK 0248 9910 04 · Sundara Holdings BV",
    "Period: 01-Apr-2026 through 30-Jun-2026",
    "Total outbound: EUR 14,231,802.44 across 83 wires.",
    "Concentration: 71% of value routed via LU 288-4402-119 (numbered intermediary, Luxembourg).",
    "Notable cluster: 02-May-2026, 08:11-08:51 CET, seven consecutive wires totalling EUR 4,109,220.",
    "Counterparties (top 3): Aventis Capital SA (61%), Halcyon Trading Sarl (17%), Meridian Consulting LLC (9%).",
  ],
  "ev-003": [
    "From: ilya.n@sundara-bv.com",
    "To: w.chen@aventis-cap.ch",
    "Date: Sun, 12 Apr 2026 11:20:04 +0200",
    "Subject: Re: Project Aster — Zurich",
    "",
    "Wei — wrapping up in Zurich, will confirm tonight. The counterparty side is comfortable with the revised structure; I'll send the memo before dinner. Please keep the Delacroix thread quiet until we're aligned.",
    "",
    "— Ilya",
  ],
  "ev-004": [
    "STATEMENT OF MARION DELACROIX",
    "Taken this 22nd day of June, 2026, before the undersigned officer of the court.",
    "I, Marion Delacroix, of full age and legally competent, having been duly sworn, do state as follows:",
    "1. On or about 12 April 2026 I met with the individual known to me as Ilya Novak at Café Rousseau, 34 Grand-Rue, Geneva, at approximately 15:30 local time.",
    "2. The meeting lasted approximately one hour. We discussed the Aster arrangements and I raised concerns about the ledger reconciliation.",
    "3. I did not, at any point, travel to Zurich on the aforementioned date.",
    "Signed: M. Delacroix",
  ],
  "ev-005": [
    "BAUR AU LAC — Zurich · Folio 2026-04-0714",
    "Guest: Novak, I. · Room 512",
    "Arrival: 11-Apr-2026 · Departure: 13-Apr-2026",
    "Charges: 2 × room (CHF 1,850), restaurant (CHF 214), minibar (CHF 68), city tax (CHF 24).",
    "Total: CHF 4,006.00 · Charged to VISA •••• 4402 (corporate — Sundara Holdings BV).",
  ],
  "ev-006": [
    "[04/04/2026, 09:12] Ilya Novak: aster group. small circle please.",
    "[04/04/2026, 09:13] Wei Chen: understood. the ledger arrangement stays here.",
    "[04/04/2026, 09:15] Marion Delacroix: ok.",
    "…",
    "[15/05/2026, 22:04] Ilya Novak: off-grid Wed–Fri, don't call.",
    "[03/06/2026, 07:41] Wei Chen: the ledger needs an entry for LU 288.",
  ],
  "ev-007": [
    "REPUBLIC OF ESTONIA · PASSPORT",
    "Surname: NOVAK · Given names: ILYA",
    "Date of issue: 14 JAN 2022 · Date of expiry: 13 JAN 2032",
    "Schengen entry stamps observed within window: 11 APR 2026 (ZRH), 18 MAY 2026 (LUX).",
  ],
  "ev-009": [
    "CALL DETAIL RECORD — Novak mobile · +372 5xx xxx xxx",
    "Period: 01-Apr-2026 through 30-Jun-2026 · Total 312 calls · Total duration 41h 22m.",
    "Top destination: +352 27 xxx xxx (LU) — 44% of calls, 62% of duration.",
    "Cluster: 01-Jun-2026 — 22 outbound calls in a single day, all to the LU destination above.",
  ],
};

const DEFAULT_BODY = [
  "Document text unavailable in this demo build.",
  "Once Cloud integration is enabled in Phase 3, the raw document, extracted text, and OCR output will be rendered here alongside AI-extracted entities and citations.",
];

function EvidenceViewer() {
  const { item } = Route.useLoaderData() as { item: (typeof evidence)[number] };
  const Icon = ICON_FOR[item.type];
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");

  const pageCount = Math.max(1, Math.ceil((BODY_FOR[item.id] ?? DEFAULT_BODY).length / 4));
  const body = BODY_FOR[item.id] ?? DEFAULT_BODY;

  const relatedEvents = timelineEvents.filter((e) => e.evidenceId === item.id);
  const relatedContradictions = contradictions.filter(
    (c) => c.evidenceA.id === item.id || c.evidenceB.id === item.id,
  );

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col">
      <PageHeader
        eyebrow={
          <Link
            to="/evidence"
            className="inline-flex items-center gap-1 hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" /> Evidence
          </Link>
        }
        title={
          <span className="flex items-center gap-2">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-border bg-background/60 text-muted-foreground">
              <Icon className="h-4 w-4" />
            </span>
            <span className="truncate text-lg md:text-xl">{item.name}</span>
          </span>
        }
        description={item.summary}
        actions={
          <>
            <StatusChip value={item.status} />
            <Button variant="outline" size="sm" className="h-8 gap-1.5" aria-label="Share">
              <Share2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Share</span>
            </Button>
            <Button size="sm" className="h-8 gap-1.5" aria-label="Download original">
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Download</span>
            </Button>
          </>
        }
      />

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Document canvas */}
        <div className="flex min-h-0 flex-col border-b border-border/60 lg:border-b-0 lg:border-r">
          {/* Toolbar */}
          <div className="flex items-center gap-2 border-b border-border/60 px-3 py-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Find in document…"
                className="h-8 w-56 pl-8 text-xs"
              />
            </div>
            <div className="ml-auto flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                {page} / {pageCount}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                disabled={page >= pageCount}
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Document body */}
          <div className="flex-1 overflow-auto bg-background/60 p-4 md:p-8">
            <motion.article
              key={page}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="mx-auto max-w-2xl rounded-lg border border-border/60 bg-card p-6 md:p-10 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.6)]"
            >
              <div className="mb-6 flex items-center justify-between border-b border-border/60 pb-3">
                <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  {item.type} · {item.size}
                </div>
                <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  Page {page} of {pageCount}
                </div>
              </div>
              <div className="space-y-3 whitespace-pre-wrap text-[13px] leading-relaxed">
                {body
                  .slice((page - 1) * 4, page * 4)
                  .map((line, i) => (
                    <p key={i}>{highlight(line, query, item.entities)}</p>
                  ))}
              </div>
            </motion.article>
          </div>
        </div>

        {/* Right rail */}
        <aside className="flex min-h-0 flex-col overflow-y-auto">
          <Tabs defaultValue="summary" className="flex min-h-0 flex-1 flex-col">
            <TabsList className="mx-3 mt-3 grid grid-cols-3">
              <TabsTrigger value="summary" className="text-[11px]">
                Summary
              </TabsTrigger>
              <TabsTrigger value="entities" className="text-[11px]">
                Entities
              </TabsTrigger>
              <TabsTrigger value="related" className="text-[11px]">
                Related
              </TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="mt-0 space-y-4 px-4 py-4">
              <section className="rounded-lg border border-primary/25 bg-primary/5 p-3">
                <div className="mb-1 flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.14em] text-primary">
                  <Sparkles className="h-3 w-3" /> AI summary
                </div>
                <p className="text-[12px] leading-relaxed text-foreground/90">{item.summary}</p>
                <div className="mt-2 flex items-center justify-between border-t border-primary/20 pt-2">
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    Extraction confidence
                  </span>
                  <span className="font-mono text-[11px] tabular-nums">
                    {Math.round(item.confidence * 100)}%
                  </span>
                </div>
                <Progress value={item.confidence * 100} className="mt-1 h-1" />
              </section>

              <section>
                <SectionLabel>Metadata</SectionLabel>
                <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[12px]">
                  <dt className="text-muted-foreground">Uploaded</dt>
                  <dd className="font-mono tabular-nums">{formatDateTime(item.uploadedAt)}</dd>
                  <dt className="text-muted-foreground">By</dt>
                  <dd>{item.uploadedBy}</dd>
                  <dt className="text-muted-foreground">Type</dt>
                  <dd className="font-mono uppercase">{item.type}</dd>
                  <dt className="text-muted-foreground">Size</dt>
                  <dd className="font-mono">{item.size}</dd>
                  <dt className="text-muted-foreground">Case</dt>
                  <dd>
                    <Link
                      to="/cases"
                      className="text-primary hover:underline"
                    >
                      {item.caseId}
                    </Link>
                  </dd>
                </dl>
              </section>

              <section>
                <SectionLabel>Tags</SectionLabel>
                <div className="mt-2 flex flex-wrap gap-1">
                  {item.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded border border-border/60 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </section>
            </TabsContent>

            <TabsContent value="entities" className="mt-0 px-4 py-4">
              <SectionLabel>
                <Users className="mr-1 inline h-3 w-3" /> Extracted entities · {item.entities.length}
              </SectionLabel>
              <ul className="mt-2 space-y-1.5">
                {item.entities.length === 0 && (
                  <li className="rounded-md border border-dashed border-border/60 p-3 text-center text-[11px] text-muted-foreground">
                    Extraction in progress…
                  </li>
                )}
                {item.entities.map((en) => (
                  <li
                    key={en}
                    className="flex items-center justify-between rounded-md border border-border/60 bg-background/60 px-2.5 py-1.5 text-[12px]"
                  >
                    <span className="truncate">{en}</span>
                    <Link
                      to="/graph"
                      className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground hover:text-foreground"
                    >
                      Graph →
                    </Link>
                  </li>
                ))}
              </ul>
            </TabsContent>

            <TabsContent value="related" className="mt-0 space-y-4 px-4 py-4">
              <section>
                <SectionLabel>
                  <Clock className="mr-1 inline h-3 w-3" /> Timeline events · {relatedEvents.length}
                </SectionLabel>
                <ul className="mt-2 space-y-2">
                  {relatedEvents.length === 0 && (
                    <li className="rounded-md border border-dashed border-border/60 p-3 text-center text-[11px] text-muted-foreground">
                      No linked events yet.
                    </li>
                  )}
                  {relatedEvents.map((e) => (
                    <li
                      key={e.id}
                      className="rounded-md border border-border/60 bg-background/60 p-2.5 text-[12px]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                          {formatDate(e.timestamp)}
                        </span>
                        <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                          {Math.round(e.confidence * 100)}%
                        </span>
                      </div>
                      <div className="mt-1 font-medium">{e.title}</div>
                      <div className="mt-0.5 text-[11px] text-muted-foreground">
                        {e.description}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>

              {relatedContradictions.length > 0 && (
                <section>
                  <SectionLabel>Contradictions · {relatedContradictions.length}</SectionLabel>
                  <ul className="mt-2 space-y-2">
                    {relatedContradictions.map((cx) => (
                      <li
                        key={cx.id}
                        className="rounded-md border border-[color:var(--destructive)]/30 bg-[color:var(--destructive)]/5 p-2.5 text-[12px]"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[color:var(--destructive)]">
                            {cx.severity}
                          </span>
                          <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                            {Math.round(cx.confidence * 100)}%
                          </span>
                        </div>
                        <Link
                          to="/contradictions"
                          className="mt-1 block font-medium hover:underline"
                        >
                          {cx.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </TabsContent>
          </Tabs>
        </aside>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
      {children}
    </div>
  );
}

function highlight(text: string, query: string, entities: string[]) {
  const terms = [
    ...(query.trim() ? [query.trim()] : []),
    ...entities.filter((e) => e.length > 2),
  ];
  if (terms.length === 0) return text;
  const pattern = new RegExp(
    `(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
    "gi",
  );
  const parts = text.split(pattern);
  return (
    <>
      {parts.map((p, i) => {
        const match = terms.some((t) => t.toLowerCase() === p.toLowerCase());
        return match ? (
          <mark
            key={i}
            className={cn(
              "rounded px-0.5",
              query.trim() && p.toLowerCase() === query.trim().toLowerCase()
                ? "bg-warning/40 text-foreground"
                : "bg-primary/25 text-foreground",
            )}
          >
            {p}
          </mark>
        ) : (
          <span key={i}>{p}</span>
        );
      })}
    </>
  );
}

function NotFound() {
  return (
    <div className="p-8 text-center">
      <div className="mx-auto max-w-sm">
        <div className="text-lg font-semibold">Evidence not found</div>
        <p className="mt-1 text-sm text-muted-foreground">
          This item may have been removed or archived. Return to the evidence library to keep browsing.
        </p>
        <Link to="/evidence" className="mt-4 inline-flex text-sm text-primary hover:underline">
          ← Back to Evidence
        </Link>
      </div>
    </div>
  );
}
