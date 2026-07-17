import { createFileRoute } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader, StatPill } from "@/components/chimera/page-header";
import { evidenceGrowth, entityDistribution, cases } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Chimera" },
      { name: "description", content: "Executive analytics across cases, evidence, and entities." },
    ],
  }),
  component: AnalyticsPage,
});

const caseHealth = cases.map((c) => ({ name: c.code, health: c.health, evidence: c.evidenceCount }));

function AnalyticsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Workspace intelligence"
        title="Analytics"
        description="Growth, distribution, and health across every investigation."
      />
      <div className="space-y-4 p-4 md:p-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatPill label="Total evidence" value="1,180" trend="+118 · 7d" intent="success" />
          <StatPill label="Entities" value="477" trend="+22 · 7d" />
          <StatPill label="Timeline events" value="255" trend="+9 · 7d" />
          <StatPill label="Contradictions" value="17" trend="4 open" intent="warning" />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <ChartCard title="Evidence ingestion" subtitle="Last 7 days" className="lg:col-span-2">
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={evidenceGrowth} margin={{ top: 12, right: 8, bottom: 0, left: -16 }}>
                <defs>
                  <linearGradient id="up" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="uploads" stroke="var(--primary)" strokeWidth={2} fill="url(#up)" />
                <Area type="monotone" dataKey="processed" stroke="var(--chart-2)" strokeWidth={1.5} fill="transparent" strokeDasharray="4 4" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Entity distribution" subtitle="Across all cases">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={entityDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={3}
                  stroke="var(--background)"
                  strokeWidth={2}
                >
                  {entityDistribution.map((e, i) => (
                    <Cell key={i} fill={e.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <ul className="mt-2 space-y-1">
              {entityDistribution.map((e) => (
                <li key={e.name} className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: e.color }} />
                    {e.name}
                  </span>
                  <span className="font-mono tabular-nums text-muted-foreground">{e.value}</span>
                </li>
              ))}
            </ul>
          </ChartCard>

          <ChartCard title="Case health" subtitle="By case" className="lg:col-span-3">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={caseHealth} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="health" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-border/60 bg-card p-4 ${className}`}>
      <div className="mb-3 flex items-baseline justify-between">
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}
