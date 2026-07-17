import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  type Node,
  type Edge,
} from "reactflow";
import {
  User,
  Building2,
  MapPin,
  Mail,
  Phone,
  CreditCard,
  Smartphone,
  FileText as FileIcon,
  Calendar,
  Car,
} from "lucide-react";
import { PageHeader } from "@/components/chimera/page-header";
import { graphNodes, graphEdges, type EntityKind } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export const Route = createFileRoute("/_authenticated/graph")({
  head: () => ({
    meta: [
      { title: "Knowledge Graph — Chimera" },
      {
        name: "description",
        content: "Interactive knowledge graph of people, organizations, and relationships extracted from evidence.",
      },
    ],
  }),
  component: GraphPage,
});

const KIND_META: Record<EntityKind, { icon: typeof User; color: string; label: string }> = {
  person: { icon: User, color: "var(--chart-1)", label: "Person" },
  organization: { icon: Building2, color: "var(--chart-2)", label: "Organization" },
  location: { icon: MapPin, color: "var(--chart-3)", label: "Location" },
  email: { icon: Mail, color: "var(--chart-4)", label: "Email" },
  phone: { icon: Phone, color: "var(--chart-5)", label: "Phone" },
  account: { icon: CreditCard, color: "var(--warning)", label: "Account" },
  device: { icon: Smartphone, color: "var(--info)", label: "Device" },
  document: { icon: FileIcon, color: "var(--muted-foreground)", label: "Document" },
  event: { icon: Calendar, color: "var(--success)", label: "Event" },
  vehicle: { icon: Car, color: "var(--chart-3)", label: "Vehicle" },
};

function EntityNode({ data }: { data: { label: string; kind: EntityKind } }) {
  const meta = KIND_META[data.kind];
  const Icon = meta.icon;
  return (
    <div
      className="flex min-w-[168px] items-center gap-2 rounded-lg border bg-card px-3 py-2 shadow-[0_8px_20px_-10px_rgba(0,0,0,0.6)] transition-transform hover:scale-[1.03]"
      style={{ borderColor: `color-mix(in oklab, ${meta.color} 35%, var(--border))` }}
    >
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
        style={{
          background: `color-mix(in oklab, ${meta.color} 18%, transparent)`,
          color: meta.color,
        }}
      >
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0">
        <div className="truncate text-[12px] font-medium">{data.label}</div>
        <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
          {meta.label}
        </div>
      </div>
    </div>
  );
}

const nodeTypes = { entity: EntityNode };

function GraphPage() {
  const nodes: Node[] = useMemo(
    () =>
      graphNodes.map((n) => ({
        id: n.id,
        type: "entity",
        position: { x: n.x + 500, y: n.y + 320 },
        data: { label: n.label, kind: n.kind },
      })),
    [],
  );

  const edges: Edge[] = useMemo(
    () =>
      graphEdges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label,
        labelStyle: { fill: "var(--muted-foreground)", fontSize: 10, fontFamily: "var(--font-mono)" },
        labelBgStyle: { fill: "var(--background)" },
        labelBgPadding: [4, 2] as [number, number],
        style: { strokeWidth: 1.4 },
        animated: false,
      })),
    [],
  );

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      <PageHeader
        eyebrow="Operation Meridian"
        title="Knowledge graph"
        description="Entities and relationships extracted across all evidence. Click nodes to explore."
        actions={
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Find entity…" className="h-8 w-56 pl-8 text-xs" />
            </div>
            <Button size="sm" variant="outline" className="h-8 text-xs">Filter</Button>
          </div>
        }
      />

      <div className="relative flex-1 min-h-0">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="color-mix(in oklab, var(--foreground) 12%, transparent)" />
          <Controls showInteractive={false} />
          <MiniMap
            pannable
            zoomable
            maskColor="color-mix(in oklab, var(--background) 70%, transparent)"
            style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }}
            nodeColor={(n) => {
              const kind = (n.data as { kind?: EntityKind })?.kind ?? "person";
              return KIND_META[kind]?.color ?? "var(--primary)";
            }}
          />
        </ReactFlow>

        {/* Legend */}
        <div className="pointer-events-none absolute left-4 top-4 rounded-lg border border-border bg-card/90 p-2.5 backdrop-blur">
          <div className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
            Legend
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            {(Object.keys(KIND_META) as EntityKind[]).slice(0, 8).map((k) => (
              <div key={k} className="flex items-center gap-1.5 text-[10px]">
                <span className="h-2 w-2 rounded-full" style={{ background: KIND_META[k].color }} />
                {KIND_META[k].label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
