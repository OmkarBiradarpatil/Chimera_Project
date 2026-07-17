import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/chimera/page-header";
import { Book, MessageSquare, Keyboard, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/_authenticated/help")({
  head: () => ({ meta: [{ title: "Help — Chimera" }] }),
  component: HelpPage,
});

const items = [
  { icon: Book, title: "Getting started", desc: "Create your first case, ingest evidence, and run the AI pipeline." },
  { icon: Keyboard, title: "Keyboard shortcuts", desc: "⌘K opens the command palette. G then D goes to dashboard." },
  { icon: MessageSquare, title: "Ask Chimera", desc: "Any question about your evidence is one keystroke away." },
  { icon: ShieldCheck, title: "Responsible use", desc: "Chimera never determines guilt, identity, or intent." },
];

function HelpPage() {
  return (
    <div>
      <PageHeader eyebrow="Support" title="Help" description="Everything you need to get the most from Chimera." />
      <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2 md:p-6">
        {items.map((i) => (
          <div key={i.title} className="rounded-xl border border-border/60 bg-card p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <i.icon className="h-4 w-4" />
            </div>
            <h3 className="mt-3 text-sm font-semibold">{i.title}</h3>
            <p className="mt-1 text-[12px] text-muted-foreground">{i.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
