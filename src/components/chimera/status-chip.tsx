import { cn } from "@/lib/utils";

const TONES: Record<string, string> = {
  critical: "border-[color:var(--destructive)]/40 bg-[color:var(--destructive)]/12 text-[color:var(--destructive)]",
  high: "border-[color:var(--warning)]/40 bg-[color:var(--warning)]/12 text-[color:var(--warning)]",
  medium: "border-[color:var(--info)]/40 bg-[color:var(--info)]/12 text-[color:var(--info)]",
  low: "border-border bg-muted text-muted-foreground",
  active: "border-[color:var(--success)]/40 bg-[color:var(--success)]/12 text-[color:var(--success)]",
  review: "border-[color:var(--warning)]/40 bg-[color:var(--warning)]/12 text-[color:var(--warning)]",
  archived: "border-border bg-muted text-muted-foreground",
  draft: "border-border bg-muted text-muted-foreground",
  processed: "border-[color:var(--success)]/40 bg-[color:var(--success)]/12 text-[color:var(--success)]",
  processing: "border-[color:var(--info)]/40 bg-[color:var(--info)]/12 text-[color:var(--info)]",
  pending: "border-border bg-muted text-muted-foreground",
  failed: "border-[color:var(--destructive)]/40 bg-[color:var(--destructive)]/12 text-[color:var(--destructive)]",
  open: "border-[color:var(--destructive)]/40 bg-[color:var(--destructive)]/12 text-[color:var(--destructive)]",
  reviewing: "border-[color:var(--warning)]/40 bg-[color:var(--warning)]/12 text-[color:var(--warning)]",
  dismissed: "border-border bg-muted text-muted-foreground",
};

export function StatusChip({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const tone = TONES[value] ?? "border-border bg-muted text-muted-foreground";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em]",
        tone,
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {value}
    </span>
  );
}
