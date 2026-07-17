import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generateText, Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider, embedText, toPgVectorLiteral } from "./ai-gateway.server";
import { chunkText } from "./chunk";

const ExtractInput = z.object({
  evidenceId: z.string().uuid(),
});

const ExtractionSchema = z.object({
  summary: z.string(),
  confidence: z.number().min(0).max(1),
  entities: z.array(
    z.object({
      name: z.string(),
      kind: z.enum([
        "person",
        "organization",
        "location",
        "vehicle",
        "email",
        "phone",
        "account",
        "device",
        "document",
        "event",
      ]),
    }),
  ),
  events: z
    .array(
      z.object({
        title: z.string(),
        description: z.string(),
        occurred_at: z.string().describe("ISO 8601 timestamp with UTC"),
        category: z.enum(["communication", "transaction", "movement", "document", "meeting", "alert"]),
        entities: z.array(z.string()),
        confidence: z.number().min(0).max(1),
      }),
    )
    .max(20),
  tags: z.array(z.string()).max(8),
});

const SYSTEM = `You are Chimera, an evidence intelligence analyst. Extract structured facts from investigative documents.

Rules:
- Never fabricate. If a fact is not in the text, omit it.
- Confidence reflects how clearly the text supports the fact (0.0-1.0).
- Timestamps: convert to ISO 8601 UTC. If only a date is given, use T00:00:00Z.
- Entities: canonical form (e.g. "Ilya Novak" not "I. Novak"). Deduplicate.
- Return concise, factual summaries. No legal conclusions.`;

export const extractEvidence = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ExtractInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;

    // Load evidence
    const { data: evidence, error: evErr } = await supabase
      .from("evidence")
      .select("id, case_id, name, extracted_text, status")
      .eq("id", data.evidenceId)
      .single();
    if (evErr || !evidence) throw new Error(evErr?.message ?? "Evidence not found");
    if (!evidence.extracted_text || evidence.extracted_text.trim().length === 0) {
      throw new Error("Evidence has no extracted_text yet");
    }

    await supabase.from("evidence").update({ status: "processing" }).eq("id", evidence.id);

    // Cap input to model-friendly size.
    const text = evidence.extracted_text.slice(0, 24000);

    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");
    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-2.5-flash");

    let extraction: z.infer<typeof ExtractionSchema>;
    try {
      const { output } = await generateText({
        model,
        system: SYSTEM,
        output: Output.object({ schema: ExtractionSchema }),
        prompt: `Filename: ${evidence.name}\n\nDocument text:\n${text}`,
      });
      extraction = output;
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error)) {
        await supabase
          .from("evidence")
          .update({ status: "failed", summary: "Extraction failed to return valid JSON." })
          .eq("id", evidence.id);
        throw new Error("Extraction failed");
      }
      throw error;
    }

    // Update evidence with summary + entity list + tags
    const entityNames = Array.from(new Set(extraction.entities.map((e) => e.name)));
    await supabase
      .from("evidence")
      .update({
        summary: extraction.summary,
        confidence: extraction.confidence,
        entities: entityNames,
        tags: extraction.tags,
        status: "processed",
      })
      .eq("id", evidence.id);

    // Upsert entities (case-scoped, unique on lower(name))
    for (const e of extraction.entities) {
      await supabase.from("entities").upsert(
        {
          case_id: evidence.case_id,
          name: e.name,
          kind: e.kind,
          mentions: 1,
          confidence: extraction.confidence,
        },
        { onConflict: "case_id,name" },
      );
    }

    // Insert timeline events
    if (extraction.events.length > 0) {
      const events = extraction.events.map((ev) => ({
        case_id: evidence.case_id,
        evidence_id: evidence.id,
        occurred_at: ev.occurred_at,
        title: ev.title,
        description: ev.description,
        category: ev.category,
        entities: ev.entities,
        confidence: ev.confidence,
      }));
      await supabase.from("timeline_events").insert(events);
    }

    // Chunk + embed + insert
    const chunks = chunkText(text);
    let inserted = 0;
    for (let i = 0; i < chunks.length; i++) {
      try {
        const vec = await embedText(chunks[i]);
        // Insert via SQL text literal for halfvec — supabase-js sends JSON, which halfvec accepts as text.
        const { error } = await supabase.from("evidence_chunks").insert({
          evidence_id: evidence.id,
          case_id: evidence.case_id,
          chunk_index: i,
          content: chunks[i],
          embedding: toPgVectorLiteral(vec) as unknown as never,
        });
        if (!error) inserted++;
      } catch (e) {
        console.error("[embed]", e);
      }
    }

    return {
      ok: true,
      summary: extraction.summary,
      entities: entityNames.length,
      events: extraction.events.length,
      chunks: inserted,
    };
  });
