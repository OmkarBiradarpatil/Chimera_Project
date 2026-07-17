import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

// Create a case
export const createCase = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        title: z.string().min(1).max(200),
        code: z.string().min(1).max(32),
        description: z.string().max(4000).optional().default(""),
        priority: z.enum(["critical", "high", "medium", "low"]).default("medium"),
        tags: z.array(z.string().max(32)).max(12).default([]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("cases")
      .insert({
        title: data.title,
        code: data.code,
        description: data.description,
        priority: data.priority,
        tags: data.tags,
        owner_id: userId,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

// Register uploaded evidence (client uploads to storage first, then calls this)
export const registerEvidence = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        caseId: z.string().uuid(),
        name: z.string().min(1),
        type: z.enum(["pdf", "image", "email", "chat", "statement", "financial", "call-log", "csv"]),
        sizeBytes: z.number().int().nonnegative().nullable().optional(),
        storagePath: z.string().min(1),
        mimeType: z.string().max(200).nullable().optional(),
        extractedText: z.string().max(200000).nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("evidence")
      .insert({
        case_id: data.caseId,
        uploader_id: userId,
        name: data.name,
        type: data.type,
        size_bytes: data.sizeBytes ?? null,
        storage_path: data.storagePath,
        mime_type: data.mimeType ?? null,
        extracted_text: data.extractedText ?? null,
        status: data.extractedText ? "processing" : "pending",
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

// List cases + evidence for the shell (loader-friendly)
export const listCases = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("cases")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const listEvidence = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ caseId: z.string().uuid().nullable().optional() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    let q = supabase
      .from("evidence")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (data.caseId) q = q.eq("case_id", data.caseId);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });
