// Realistic fictional investigation data for Project Chimera.
// All names, orgs, and identifiers are invented for demo purposes.

export type CasePriority = "critical" | "high" | "medium" | "low";
export type CaseStatus = "active" | "review" | "archived" | "draft";

export interface Case {
  id: string;
  code: string;
  title: string;
  description: string;
  status: CaseStatus;
  priority: CasePriority;
  owner: string;
  ownerAvatar: string;
  tags: string[];
  evidenceCount: number;
  entityCount: number;
  eventCount: number;
  contradictionCount: number;
  health: number; // 0-100
  updatedAt: string;
  pinned?: boolean;
}

export type EvidenceType =
  | "pdf"
  | "image"
  | "email"
  | "chat"
  | "statement"
  | "financial"
  | "call-log"
  | "csv";

export interface Evidence {
  id: string;
  caseId: string;
  name: string;
  type: EvidenceType;
  size: string;
  status: "processed" | "processing" | "pending" | "failed";
  confidence: number;
  entities: string[];
  tags: string[];
  uploadedAt: string;
  uploadedBy: string;
  summary: string;
}

export type EntityKind =
  | "person"
  | "organization"
  | "location"
  | "vehicle"
  | "email"
  | "phone"
  | "account"
  | "device"
  | "document"
  | "event";

export interface Entity {
  id: string;
  name: string;
  kind: EntityKind;
  mentions: number;
  confidence: number;
  description?: string;
}

export interface TimelineEvent {
  id: string;
  caseId: string;
  timestamp: string; // ISO
  title: string;
  description: string;
  category: "communication" | "transaction" | "movement" | "document" | "meeting" | "alert";
  entities: string[];
  evidenceId: string;
  confidence: number;
}

export interface Contradiction {
  id: string;
  caseId: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  confidence: number;
  description: string;
  evidenceA: { id: string; name: string; excerpt: string };
  evidenceB: { id: string; name: string; excerpt: string };
  status: "open" | "reviewing" | "dismissed";
  detectedAt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Array<{ evidenceId: string; name: string; excerpt: string }>;
  confidence?: number;
  timestamp: string;
}

export interface GraphNode {
  id: string;
  label: string;
  kind: EntityKind;
  x: number;
  y: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
}

// -------- CASES --------
export const cases: Case[] = [
  {
    id: "case-meridian",
    code: "CHM-2418",
    title: "Operation Meridian",
    description:
      "Suspected cross-border shell company network routing funds through three EU jurisdictions. 412 documents ingested across banking, corporate registry, and communication records.",
    status: "active",
    priority: "critical",
    owner: "Elena Márquez",
    ownerAvatar: "EM",
    tags: ["financial", "shell-co", "eu", "priority"],
    evidenceCount: 412,
    entityCount: 187,
    eventCount: 89,
    contradictionCount: 7,
    health: 82,
    updatedAt: "2026-07-16T14:22:00Z",
    pinned: true,
  },
  {
    id: "case-halcyon",
    code: "CHM-2401",
    title: "Halcyon Ledger Discrepancy",
    description:
      "Internal audit anomalies in Q3–Q4 ledger reconciliation. Multiple witness statements collected from finance and operations teams.",
    status: "active",
    priority: "high",
    owner: "Dr. Rohan Iyer",
    ownerAvatar: "RI",
    tags: ["audit", "internal", "witness"],
    evidenceCount: 187,
    entityCount: 64,
    eventCount: 41,
    contradictionCount: 3,
    health: 74,
    updatedAt: "2026-07-15T09:41:00Z",
    pinned: true,
  },
  {
    id: "case-northgate",
    code: "CHM-2389",
    title: "Northgate Logistics Inquiry",
    description:
      "Chain-of-custody review across regional distribution hubs. Focus on manifest inconsistencies and driver logs.",
    status: "review",
    priority: "medium",
    owner: "Aiko Tanaka",
    ownerAvatar: "AT",
    tags: ["logistics", "chain-of-custody"],
    evidenceCount: 93,
    entityCount: 38,
    eventCount: 22,
    contradictionCount: 1,
    health: 91,
    updatedAt: "2026-07-14T18:03:00Z",
  },
  {
    id: "case-crestline",
    code: "CHM-2372",
    title: "Crestline Communications Review",
    description:
      "Historical communications archive review — approximately 8,400 messages, filtered by relevance model. Cross-referenced with device metadata.",
    status: "active",
    priority: "high",
    owner: "Jonas Weber",
    ownerAvatar: "JW",
    tags: ["comms", "devices", "archive"],
    evidenceCount: 268,
    entityCount: 112,
    eventCount: 54,
    contradictionCount: 4,
    health: 68,
    updatedAt: "2026-07-13T11:12:00Z",
  },
  {
    id: "case-sable",
    code: "CHM-2341",
    title: "Sable Trust Estate Filing",
    description:
      "Probate discovery. Document set includes wills, correspondence, property deeds, and beneficiary statements over a 12-year period.",
    status: "review",
    priority: "medium",
    owner: "Priya Kaur",
    ownerAvatar: "PK",
    tags: ["probate", "documents"],
    evidenceCount: 149,
    entityCount: 52,
    eventCount: 31,
    contradictionCount: 2,
    health: 88,
    updatedAt: "2026-07-11T16:47:00Z",
  },
  {
    id: "case-orion",
    code: "CHM-2298",
    title: "Orion Procurement Audit",
    description: "Procurement irregularities across 3 fiscal years. Vendor and invoice cross-check.",
    status: "archived",
    priority: "low",
    owner: "Elena Márquez",
    ownerAvatar: "EM",
    tags: ["procurement", "audit"],
    evidenceCount: 71,
    entityCount: 24,
    eventCount: 18,
    contradictionCount: 0,
    health: 100,
    updatedAt: "2026-06-28T10:15:00Z",
  },
];

// -------- EVIDENCE (for Meridian primarily) --------
export const evidence: Evidence[] = [
  {
    id: "ev-001",
    caseId: "case-meridian",
    name: "Sundara Holdings — Incorporation Docs.pdf",
    type: "pdf",
    size: "2.4 MB",
    status: "processed",
    confidence: 0.96,
    entities: ["Sundara Holdings BV", "Ilya Novak", "Rotterdam"],
    tags: ["corporate", "registry"],
    uploadedAt: "2026-07-10T09:14:00Z",
    uploadedBy: "E. Márquez",
    summary:
      "Dutch BV incorporation documents naming Ilya Novak as sole director. Registered address matches a mail-forwarding service on Weena 690, Rotterdam.",
  },
  {
    id: "ev-002",
    caseId: "case-meridian",
    name: "Wire transfers — Merkava Bank Q2.csv",
    type: "csv",
    size: "412 KB",
    status: "processed",
    confidence: 0.99,
    entities: ["Merkava Bank", "Sundara Holdings BV", "Aventis Capital SA"],
    tags: ["financial", "wires"],
    uploadedAt: "2026-07-10T11:02:00Z",
    uploadedBy: "R. Iyer",
    summary:
      "83 outbound wires totalling €14.2M between Apr–Jun. 71% routed to a single Luxembourg intermediary before onward transfer.",
  },
  {
    id: "ev-003",
    caseId: "case-meridian",
    name: "Email — Novak ↔ Chen (April).eml",
    type: "email",
    size: "38 KB",
    status: "processed",
    confidence: 0.92,
    entities: ["Ilya Novak", "Wei Chen", "Project Aster"],
    tags: ["comms", "internal"],
    uploadedAt: "2026-07-11T08:33:00Z",
    uploadedBy: "J. Weber",
    summary:
      "Discussion of 'Project Aster' timeline. Novak references a meeting in Zurich on 12 April that appears inconsistent with travel records.",
  },
  {
    id: "ev-004",
    caseId: "case-meridian",
    name: "Witness statement — M. Delacroix.pdf",
    type: "statement",
    size: "1.1 MB",
    status: "processed",
    confidence: 0.88,
    entities: ["Marion Delacroix", "Aventis Capital SA", "Zurich"],
    tags: ["witness", "signed"],
    uploadedAt: "2026-07-11T14:19:00Z",
    uploadedBy: "E. Márquez",
    summary:
      "Signed statement placing subject in Geneva on 12 April, contradicting email correspondence and a hotel invoice on file.",
  },
  {
    id: "ev-005",
    caseId: "case-meridian",
    name: "Hotel invoice — Baur au Lac.pdf",
    type: "pdf",
    size: "312 KB",
    status: "processed",
    confidence: 0.97,
    entities: ["Baur au Lac", "Zurich", "Ilya Novak"],
    tags: ["receipt", "travel"],
    uploadedAt: "2026-07-11T15:04:00Z",
    uploadedBy: "A. Tanaka",
    summary: "Two-night stay 11–13 April, corporate card ending 4402. Confirms Zurich presence.",
  },
  {
    id: "ev-006",
    caseId: "case-meridian",
    name: "WhatsApp export — Aster group.txt",
    type: "chat",
    size: "204 KB",
    status: "processed",
    confidence: 0.85,
    entities: ["Ilya Novak", "Wei Chen", "Marion Delacroix"],
    tags: ["comms", "chat"],
    uploadedAt: "2026-07-12T10:22:00Z",
    uploadedBy: "J. Weber",
    summary: "1,247 messages between three principals over 6 weeks. Coded language around 'the ledger' recurs 41 times.",
  },
  {
    id: "ev-007",
    caseId: "case-meridian",
    name: "Passport scan — I. Novak.jpg",
    type: "image",
    size: "1.8 MB",
    status: "processed",
    confidence: 0.94,
    entities: ["Ilya Novak"],
    tags: ["identity"],
    uploadedAt: "2026-07-12T13:41:00Z",
    uploadedBy: "P. Kaur",
    summary: "Estonian passport, issued 2022. Two Schengen entry stamps in April window.",
  },
  {
    id: "ev-008",
    caseId: "case-meridian",
    name: "Aventis Capital — Annual filing 2025.pdf",
    type: "pdf",
    size: "6.7 MB",
    status: "processing",
    confidence: 0.0,
    entities: [],
    tags: ["corporate"],
    uploadedAt: "2026-07-16T13:58:00Z",
    uploadedBy: "E. Márquez",
    summary: "Extracting…",
  },
  {
    id: "ev-009",
    caseId: "case-meridian",
    name: "Call log — Novak mobile.csv",
    type: "call-log",
    size: "88 KB",
    status: "processed",
    confidence: 0.91,
    entities: ["Ilya Novak", "+41 44 xxx", "+352 27 xxx"],
    tags: ["comms", "metadata"],
    uploadedAt: "2026-07-13T09:11:00Z",
    uploadedBy: "R. Iyer",
    summary: "312 calls over 90 days. 44% to a single Luxembourg number registered to a numbered account.",
  },
];

// -------- ENTITIES --------
export const entities: Entity[] = [
  { id: "en-1", name: "Ilya Novak", kind: "person", mentions: 87, confidence: 0.97, description: "Sole director, Sundara Holdings BV. Estonian national." },
  { id: "en-2", name: "Wei Chen", kind: "person", mentions: 41, confidence: 0.93, description: "Referenced principal in Project Aster correspondence." },
  { id: "en-3", name: "Marion Delacroix", kind: "person", mentions: 22, confidence: 0.9, description: "Witness, former operations lead at Aventis." },
  { id: "en-4", name: "Sundara Holdings BV", kind: "organization", mentions: 63, confidence: 0.98 },
  { id: "en-5", name: "Aventis Capital SA", kind: "organization", mentions: 54, confidence: 0.96 },
  { id: "en-6", name: "Merkava Bank", kind: "organization", mentions: 39, confidence: 0.97 },
  { id: "en-7", name: "Zurich", kind: "location", mentions: 28, confidence: 0.95 },
  { id: "en-8", name: "Rotterdam", kind: "location", mentions: 19, confidence: 0.94 },
  { id: "en-9", name: "Luxembourg City", kind: "location", mentions: 24, confidence: 0.93 },
  { id: "en-10", name: "ilya.n@sundara-bv.com", kind: "email", mentions: 17, confidence: 0.99 },
  { id: "en-11", name: "+41 44 215 0088", kind: "phone", mentions: 12, confidence: 0.92 },
  { id: "en-12", name: "LU 288-4402-119", kind: "account", mentions: 31, confidence: 0.95 },
];

// -------- TIMELINE --------
export const timelineEvents: TimelineEvent[] = [
  { id: "te-1", caseId: "case-meridian", timestamp: "2026-03-08T10:15:00Z", title: "Sundara Holdings BV incorporated", description: "Dutch chamber of commerce filing. Sole director listed as Ilya Novak.", category: "document", entities: ["Ilya Novak", "Sundara Holdings BV"], evidenceId: "ev-001", confidence: 0.96 },
  { id: "te-2", caseId: "case-meridian", timestamp: "2026-03-19T14:02:00Z", title: "First outbound wire — €480K", description: "From Sundara BV → Aventis Capital SA via Merkava Bank correspondent.", category: "transaction", entities: ["Sundara Holdings BV", "Aventis Capital SA"], evidenceId: "ev-002", confidence: 0.99 },
  { id: "te-3", caseId: "case-meridian", timestamp: "2026-04-04T09:33:00Z", title: "WhatsApp: 'Aster' group created", description: "Three-person group. First message references 'the ledger arrangement'.", category: "communication", entities: ["Ilya Novak", "Wei Chen", "Marion Delacroix"], evidenceId: "ev-006", confidence: 0.85 },
  { id: "te-4", caseId: "case-meridian", timestamp: "2026-04-11T18:44:00Z", title: "Hotel check-in — Baur au Lac, Zurich", description: "Two-night reservation on corporate card ending 4402.", category: "movement", entities: ["Ilya Novak", "Zurich"], evidenceId: "ev-005", confidence: 0.97 },
  { id: "te-5", caseId: "case-meridian", timestamp: "2026-04-12T11:20:00Z", title: "Email references 'Zurich meeting today'", description: "Novak → Chen: 'Wrapping up in Zurich, will confirm tonight.'", category: "communication", entities: ["Ilya Novak", "Wei Chen"], evidenceId: "ev-003", confidence: 0.92 },
  { id: "te-6", caseId: "case-meridian", timestamp: "2026-04-12T15:30:00Z", title: "Witness places subject in Geneva", description: "Delacroix signed statement: met subject at Café Rousseau, Geneva, ~15:30.", category: "meeting", entities: ["Ilya Novak", "Marion Delacroix"], evidenceId: "ev-004", confidence: 0.88 },
  { id: "te-7", caseId: "case-meridian", timestamp: "2026-05-02T08:11:00Z", title: "Bulk transfer — €4.1M", description: "Sequence of 7 wires within 40 minutes to LU numbered account.", category: "transaction", entities: ["Sundara Holdings BV", "LU 288-4402-119"], evidenceId: "ev-002", confidence: 0.99 },
  { id: "te-8", caseId: "case-meridian", timestamp: "2026-05-18T13:07:00Z", title: "Passport stamped — Schengen entry", description: "Estonian passport, second Schengen stamp in the April–May window.", category: "movement", entities: ["Ilya Novak"], evidenceId: "ev-007", confidence: 0.94 },
  { id: "te-9", caseId: "case-meridian", timestamp: "2026-06-01T09:00:00Z", title: "Call spike — 22 calls in one day", description: "All to a single Luxembourg number registered to a numbered account.", category: "communication", entities: ["Ilya Novak", "LU 288-4402-119"], evidenceId: "ev-009", confidence: 0.91 },
  { id: "te-10", caseId: "case-meridian", timestamp: "2026-06-14T16:20:00Z", title: "Aventis Q2 filing lodged", description: "Filing lists Sundara BV as an unrelated third-party creditor.", category: "document", entities: ["Aventis Capital SA", "Sundara Holdings BV"], evidenceId: "ev-008", confidence: 0.9 },
];

// -------- CONTRADICTIONS --------
export const contradictions: Contradiction[] = [
  {
    id: "cx-1",
    caseId: "case-meridian",
    title: "Location conflict on 12 April — Zurich vs. Geneva",
    severity: "critical",
    confidence: 0.87,
    description:
      "One source places the subject in Zurich (email + hotel invoice) at the same window that a signed witness statement places them in Geneva.",
    evidenceA: { id: "ev-003", name: "Email — Novak ↔ Chen (April).eml", excerpt: "\"Wrapping up in Zurich, will confirm tonight.\" — 12 Apr, 11:20 CET" },
    evidenceB: { id: "ev-004", name: "Witness statement — M. Delacroix.pdf", excerpt: "\"…met at Café Rousseau, Geneva, at approximately 15:30 on 12 April.\"" },
    status: "open",
    detectedAt: "2026-07-15T20:14:00Z",
  },
  {
    id: "cx-2",
    caseId: "case-meridian",
    title: "Sundara declared unrelated to Aventis in Q2 filing",
    severity: "high",
    confidence: 0.81,
    description:
      "Aventis Q2 filing classifies Sundara as an unrelated third-party creditor, but 71% of Sundara's outbound wires route to Aventis and shared beneficial ownership indicators exist.",
    evidenceA: { id: "ev-008", name: "Aventis Capital — Annual filing 2025.pdf", excerpt: "\"Unrelated third-party trade creditor…\"" },
    evidenceB: { id: "ev-002", name: "Wire transfers — Merkava Bank Q2.csv", excerpt: "71% of €14.2M wires route Sundara → Aventis via LU intermediary." },
    status: "reviewing",
    detectedAt: "2026-07-14T11:02:00Z",
  },
  {
    id: "cx-3",
    caseId: "case-meridian",
    title: "Call log gap during declared travel window",
    severity: "medium",
    confidence: 0.72,
    description:
      "Subject declared 3-day travel with 'no reachability'. Call log shows 41 outbound calls during that window from the same device.",
    evidenceA: { id: "ev-006", name: "WhatsApp export — Aster group.txt", excerpt: "\"Off-grid Wed–Fri, don't call.\"" },
    evidenceB: { id: "ev-009", name: "Call log — Novak mobile.csv", excerpt: "41 outbound calls, Wed 09:00 – Fri 22:00" },
    status: "open",
    detectedAt: "2026-07-13T09:48:00Z",
  },
  {
    id: "cx-4",
    caseId: "case-meridian",
    title: "Registered address is a mail-forwarding service",
    severity: "medium",
    confidence: 0.9,
    description:
      "Weena 690, Rotterdam — declared HQ — matches a public directory of virtual office / mail-forwarding services.",
    evidenceA: { id: "ev-001", name: "Sundara Holdings — Incorporation Docs.pdf", excerpt: "Registered office: Weena 690, Rotterdam" },
    evidenceB: { id: "ev-001", name: "Sundara Holdings — Incorporation Docs.pdf", excerpt: "Cross-referenced against KvK virtual-office registry." },
    status: "open",
    detectedAt: "2026-07-12T17:33:00Z",
  },
];

// -------- CHAT --------
export const chatSuggestions = [
  "Summarize the funding trail from Sundara BV",
  "Where was Ilya Novak on 12 April?",
  "List all contradictions with confidence > 80%",
  "Which entities appear in both banking and communication records?",
  "Generate an executive summary for Operation Meridian",
];

export const chatHistory: ChatMessage[] = [
  {
    id: "msg-1",
    role: "user",
    content: "Where was Ilya Novak on 12 April?",
    timestamp: "2026-07-16T14:02:00Z",
  },
  {
    id: "msg-2",
    role: "assistant",
    content:
      "The evidence contains **conflicting signals** for 12 April. Two independent sources place the subject in Zurich (hotel invoice at Baur au Lac 11–13 Apr, and an email at 11:20 CET stating \"wrapping up in Zurich\"). A signed witness statement from M. Delacroix places the subject in Geneva at approximately 15:30 the same day.\n\nThis has been flagged as a **critical contradiction** (confidence 0.87). I have not resolved it — this is a factual conflict for a reviewer to adjudicate.",
    citations: [
      { evidenceId: "ev-005", name: "Hotel invoice — Baur au Lac.pdf", excerpt: "Nights 11–13 April, corporate card ending 4402." },
      { evidenceId: "ev-003", name: "Email — Novak ↔ Chen (April).eml", excerpt: "\"Wrapping up in Zurich, will confirm tonight.\"" },
      { evidenceId: "ev-004", name: "Witness statement — M. Delacroix.pdf", excerpt: "\"…met at Café Rousseau, Geneva, at approximately 15:30 on 12 April.\"" },
    ],
    confidence: 0.87,
    timestamp: "2026-07-16T14:02:04Z",
  },
];

// -------- GRAPH --------
export const graphNodes: GraphNode[] = [
  { id: "en-1", label: "Ilya Novak", kind: "person", x: 0, y: 0 },
  { id: "en-2", label: "Wei Chen", kind: "person", x: -280, y: -160 },
  { id: "en-3", label: "Marion Delacroix", kind: "person", x: 260, y: -180 },
  { id: "en-4", label: "Sundara Holdings BV", kind: "organization", x: -220, y: 160 },
  { id: "en-5", label: "Aventis Capital SA", kind: "organization", x: 240, y: 180 },
  { id: "en-6", label: "Merkava Bank", kind: "organization", x: 0, y: 300 },
  { id: "en-7", label: "Zurich", kind: "location", x: -420, y: 40 },
  { id: "en-8", label: "Rotterdam", kind: "location", x: -420, y: 220 },
  { id: "en-9", label: "Luxembourg City", kind: "location", x: 420, y: 60 },
  { id: "en-12", label: "LU 288-4402-119", kind: "account", x: 420, y: 260 },
  { id: "en-10", label: "ilya.n@sundara-bv.com", kind: "email", x: -140, y: -300 },
  { id: "en-11", label: "+41 44 215 0088", kind: "phone", x: 140, y: -300 },
];

export const graphEdges: GraphEdge[] = [
  { id: "e1", source: "en-1", target: "en-4", label: "director of" },
  { id: "e2", source: "en-1", target: "en-2", label: "corresponds with" },
  { id: "e3", source: "en-1", target: "en-3", label: "met with" },
  { id: "e4", source: "en-4", target: "en-6", label: "banks at" },
  { id: "e5", source: "en-4", target: "en-5", label: "wires to" },
  { id: "e6", source: "en-5", target: "en-12", label: "receives via" },
  { id: "e7", source: "en-1", target: "en-7", label: "visited" },
  { id: "e8", source: "en-4", target: "en-8", label: "registered at" },
  { id: "e9", source: "en-5", target: "en-9", label: "based in" },
  { id: "e10", source: "en-1", target: "en-10", label: "uses" },
  { id: "e11", source: "en-1", target: "en-11", label: "calls from" },
  { id: "e12", source: "en-11", target: "en-12", label: "contacted" },
];

// -------- ANALYTICS --------
export const evidenceGrowth = [
  { day: "Mon", uploads: 12, processed: 11 },
  { day: "Tue", uploads: 28, processed: 26 },
  { day: "Wed", uploads: 19, processed: 19 },
  { day: "Thu", uploads: 41, processed: 38 },
  { day: "Fri", uploads: 33, processed: 31 },
  { day: "Sat", uploads: 8, processed: 8 },
  { day: "Sun", uploads: 14, processed: 13 },
];

export const entityDistribution = [
  { name: "People", value: 42, color: "var(--chart-1)" },
  { name: "Organizations", value: 28, color: "var(--chart-2)" },
  { name: "Locations", value: 19, color: "var(--chart-3)" },
  { name: "Accounts", value: 14, color: "var(--chart-4)" },
  { name: "Devices", value: 9, color: "var(--chart-5)" },
];

export const activityFeed = [
  { id: "a1", actor: "E. Márquez", action: "uploaded 3 files to", target: "Operation Meridian", when: "12m ago" },
  { id: "a2", actor: "AI Pipeline", action: "extracted 47 entities from", target: "Wire transfers — Merkava Q2", when: "24m ago" },
  { id: "a3", actor: "R. Iyer", action: "flagged a contradiction in", target: "Halcyon Ledger Discrepancy", when: "1h ago" },
  { id: "a4", actor: "AI Pipeline", action: "generated timeline for", target: "Crestline Communications", when: "2h ago" },
  { id: "a5", actor: "J. Weber", action: "pinned", target: "Northgate Logistics Inquiry", when: "3h ago" },
  { id: "a6", actor: "AI Pipeline", action: "detected 2 new contradictions in", target: "Operation Meridian", when: "5h ago" },
];

export function findCase(id: string) {
  return cases.find((c) => c.id === id);
}
export function evidenceForCase(caseId: string) {
  return evidence.filter((e) => e.caseId === caseId);
}
