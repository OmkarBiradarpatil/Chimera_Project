import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider, embedText, toPgVectorLiteral } from "./ai-gateway.server";

const ChatInput = z.object({
  message: z.string().min(1).max(4000),
  caseId: z.string().uuid().nullable().optional(),
});

const SYSTEM = `You are Chimera, an evidence-grounded AI assistant for investigators.

Rules:
- Answer ONLY from the provided evidence excerpts. If the evidence does not support an answer, say so plainly.
- Cite specific evidence by referencing the [E#] tags in your answer where relevant.
- Never make legal, guilt, or identity determinations.
- When evidence conflicts, surface the contradiction rather than resolving it.
- Be concise. Use plain prose, occasional short bullet lists. No headings.`;

type Citation = { evidenceId: string; name: string; excerpt: string; similarity: number };

export const chatWithEvidence = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ChatInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Persist user message
    await supabase.from("chat_messages").insert({
      user_id: userId,
      case_id: data.caseId ?? null,
      role: "user",
      content: data.message,
    });

    // 1) Embed query
    const queryVec = await embedText(data.message);

    // 2) Retrieve top-k chunks
    const { data: matches, error: matchErr } = await supabase.rpc("match_evidence_chunks", {
      query_embedding: toPgVectorLiteral(queryVec) as unknown as never,
      match_count: 8,
      filter_case_id: data.caseId ?? undefined,
    });
    if (matchErr) throw new Error(matchErr.message);

    const rows = (matches ?? []) as Array<{
      id: string;
      evidence_id: string;
      case_id: string;
      content: string;
      similarity: number;
    }>;

    let citations: Citation[] = [];
    let contextBlock = "";

    if (rows.length > 0) {
      const evidenceIds = Array.from(new Set(rows.map((r) => r.evidence_id)));
      const { data: evidenceRows } = await supabase
        .from("evidence")
        .select("id, name")
        .in("id", evidenceIds);
      const nameById = new Map((evidenceRows ?? []).map((e) => [e.id, e.name]));

      citations = rows.map((r) => ({
        evidenceId: r.evidence_id,
        name: nameById.get(r.evidence_id) ?? "Unknown evidence",
        excerpt: r.content.slice(0, 240),
        similarity: r.similarity,
      }));

      contextBlock = rows
        .map(
          (r, i) =>
            `[E${i + 1}] ${nameById.get(r.evidence_id) ?? "Unknown"} (similarity ${r.similarity.toFixed(2)}):\n${r.content}`,
        )
        .join("\n\n---\n\n");
    }

    // 3) Generate answer
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");
    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-2.5-flash");

    const prompt = contextBlock
      ? `Evidence excerpts:\n\n${contextBlock}\n\nQuestion: ${data.message}`
      : `The knowledge base is empty for this filter. Answer briefly that no evidence has been indexed yet and suggest uploading files.\n\nQuestion: ${data.message}`;

    const { text } = await generateText({
      model,
      system: SYSTEM,
      prompt,
    });

    // Confidence heuristic from top similarity
    const confidence = rows.length ? Math.min(0.99, rows[0].similarity) : 0.2;

    // Persist assistant message
    const { data: saved } = await supabase
      .from("chat_messages")
      .insert({
        user_id: userId,
        case_id: data.caseId ?? null,
        role: "assistant",
        content: text,
        citations,
        confidence,
      })
      .select("id, created_at")
      .single();

    return {
      id: saved?.id,
      content: text,
      citations,
      confidence,
    };
  });

export const listChatMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ caseId: z.string().uuid().nullable().optional() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    let q = supabase
      .from("chat_messages")
      .select("id, role, content, citations, confidence, created_at, case_id")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(100);
    if (data.caseId) q = q.eq("case_id", data.caseId);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });
