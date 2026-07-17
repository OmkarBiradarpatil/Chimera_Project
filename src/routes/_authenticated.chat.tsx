import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, FileText, Copy, ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/chimera/page-header";
import { Button } from "@/components/ui/button";
import { chatHistory, chatSuggestions, type ChatMessage } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/chat")({
  head: () => ({
    meta: [
      { title: "AI Chat — Chimera" },
      { name: "description", content: "Ask questions about your evidence. Every answer cites its sources." },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(chatHistory);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, streaming]);

  const send = (text: string) => {
    if (!text.trim() || streaming) return;
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setStreaming(true);
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content:
            "Based on the ingested evidence for Operation Meridian, I can trace the funding path: Sundara Holdings BV (Rotterdam) → Merkava Bank correspondent → LU 288-4402-119 (Luxembourg) → Aventis Capital SA. Total across Q2: €14.2M across 83 wires. 71% routed through the LU intermediary. I have not made any determination of intent — this is a pattern in the data.",
          citations: [
            { evidenceId: "ev-002", name: "Wire transfers — Merkava Bank Q2.csv", excerpt: "83 wires, €14.2M, 71% via LU 288-4402-119" },
            { evidenceId: "ev-001", name: "Sundara Holdings — Incorporation Docs.pdf", excerpt: "Registered office: Weena 690, Rotterdam" },
          ],
          confidence: 0.91,
          timestamp: new Date().toISOString(),
        },
      ]);
      setStreaming(false);
    }, 1200);
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      <PageHeader
        eyebrow="Evidence-backed assistant"
        title="AI Chat"
        description="Every answer draws exclusively from evidence in this workspace, with citations."
      />

      <div ref={scrollRef} className="relative flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 py-6 md:px-6">
          {messages.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-8">
              <AnimatePresence initial={false}>
                {messages.map((m) => (
                  <MessageBubble key={m.id} message={m} />
                ))}
              </AnimatePresence>
              {streaming && <ThinkingIndicator />}
            </div>
          )}
        </div>
      </div>

      {/* Composer */}
      <div className="border-t border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-3 md:px-6">
          {messages.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {chatSuggestions.slice(0, 3).map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-border bg-card px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/10 hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-end gap-2 rounded-xl border border-border bg-card p-2 focus-within:border-primary/50 focus-within:shadow-[0_0_0_3px_color-mix(in_oklab,var(--primary)_20%,transparent)]"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder="Ask about people, transactions, timelines, or contradictions…"
              rows={1}
              className="flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-muted-foreground"
            />
            <Button
              type="submit"
              size="icon"
              className="h-8 w-8 shrink-0"
              disabled={!input.trim() || streaming}
              aria-label="Send"
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          </form>
          <p className="mt-2 text-center text-[10px] text-muted-foreground">
            Chimera answers only from uploaded evidence. It does not make legal or guilt determinations.
          </p>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-card">
        <Sparkles className="h-6 w-6 text-primary" />
      </div>
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Ask about your evidence</h2>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
          Chimera retrieves relevant documents and answers with citations. It never invents facts.
        </p>
      </div>
      <div className="grid w-full max-w-xl gap-2 sm:grid-cols-2">
        {chatSuggestions.map((s) => (
          <button
            key={s}
            className="rounded-lg border border-border bg-card p-3 text-left text-[12px] transition-colors hover:border-primary/50 hover:bg-primary/5"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  if (message.role === "user") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-end"
      >
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm text-primary-foreground">
          {message.content}
        </div>
      </motion.div>
    );
  }
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-card">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
      </div>
      <div className="min-w-0 flex-1 space-y-3">
        <div className="text-sm leading-relaxed text-foreground/95 whitespace-pre-wrap">
          {message.content}
        </div>
        {message.citations && message.citations.length > 0 && (
          <div className="space-y-1.5">
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Sources ({message.citations.length})
            </div>
            <ul className="space-y-1.5">
              {message.citations.map((c, i) => (
                <li
                  key={i}
                  className="group flex items-start gap-2 rounded-lg border border-border/60 bg-card p-2.5 transition-colors hover:border-border"
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-border bg-background/60 text-[9px] font-mono">
                    {i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <FileText className="h-3 w-3 text-muted-foreground" />
                      <span className="truncate text-[12px] font-medium">{c.name}</span>
                    </div>
                    <div className="mt-0.5 text-[11px] italic text-muted-foreground line-clamp-2">
                      "{c.excerpt}"
                    </div>
                  </div>
                  <ArrowUpRight className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          {typeof message.confidence === "number" && (
            <span className="inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--success)]" />
              Confidence {Math.round(message.confidence * 100)}%
            </span>
          )}
          <button className="inline-flex items-center gap-1 transition-colors hover:text-foreground">
            <Copy className="h-3 w-3" /> Copy
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function ThinkingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
      </div>
      <div className="flex items-center gap-1.5 pt-2 text-sm text-muted-foreground">
        <motion.span
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.4, repeat: Infinity }}
        >
          Retrieving evidence
        </motion.span>
        <span className="flex gap-0.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="inline-block h-1 w-1 rounded-full bg-current"
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </span>
      </div>
    </div>
  );
}
