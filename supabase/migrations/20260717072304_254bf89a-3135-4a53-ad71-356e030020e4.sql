
-- Extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =============== profiles ===============
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles readable by authenticated" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles updatable by owner" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles insertable by self" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at helper
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =============== cases ===============
CREATE TABLE public.cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  priority TEXT NOT NULL DEFAULT 'medium',
  tags TEXT[] NOT NULL DEFAULT '{}',
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cases TO authenticated;
GRANT ALL ON public.cases TO service_role;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cases readable by authenticated" ON public.cases FOR SELECT TO authenticated USING (true);
CREATE POLICY "cases insertable by owner" ON public.cases FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "cases updatable by owner" ON public.cases FOR UPDATE TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "cases deletable by owner" ON public.cases FOR DELETE TO authenticated USING (auth.uid() = owner_id);
CREATE TRIGGER trg_cases_updated_at BEFORE UPDATE ON public.cases FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE INDEX cases_owner_idx ON public.cases(owner_id);
CREATE INDEX cases_status_idx ON public.cases(status);

-- =============== evidence ===============
CREATE TABLE public.evidence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  uploader_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'pdf',
  size_bytes BIGINT,
  storage_path TEXT,
  mime_type TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  confidence REAL,
  summary TEXT,
  extracted_text TEXT,
  entities TEXT[] NOT NULL DEFAULT '{}',
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.evidence TO authenticated;
GRANT ALL ON public.evidence TO service_role;
ALTER TABLE public.evidence ENABLE ROW LEVEL SECURITY;
CREATE POLICY "evidence readable by authenticated" ON public.evidence FOR SELECT TO authenticated USING (true);
CREATE POLICY "evidence insertable by uploader" ON public.evidence FOR INSERT TO authenticated WITH CHECK (auth.uid() = uploader_id);
CREATE POLICY "evidence updatable by uploader" ON public.evidence FOR UPDATE TO authenticated USING (auth.uid() = uploader_id) WITH CHECK (auth.uid() = uploader_id);
CREATE POLICY "evidence deletable by uploader" ON public.evidence FOR DELETE TO authenticated USING (auth.uid() = uploader_id);
CREATE TRIGGER trg_evidence_updated_at BEFORE UPDATE ON public.evidence FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE INDEX evidence_case_idx ON public.evidence(case_id);
CREATE INDEX evidence_status_idx ON public.evidence(status);

-- =============== evidence_chunks (pgvector) ===============
CREATE TABLE public.evidence_chunks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  evidence_id UUID NOT NULL REFERENCES public.evidence(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  chunk_index INT NOT NULL,
  content TEXT NOT NULL,
  embedding halfvec(3072),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.evidence_chunks TO authenticated;
GRANT ALL ON public.evidence_chunks TO service_role;
ALTER TABLE public.evidence_chunks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "chunks readable by authenticated" ON public.evidence_chunks FOR SELECT TO authenticated USING (true);
CREATE POLICY "chunks insertable by authenticated" ON public.evidence_chunks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "chunks deletable via owning evidence" ON public.evidence_chunks FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.evidence e WHERE e.id = evidence_id AND e.uploader_id = auth.uid()));
CREATE INDEX evidence_chunks_evidence_idx ON public.evidence_chunks(evidence_id);
CREATE INDEX evidence_chunks_case_idx ON public.evidence_chunks(case_id);
CREATE INDEX evidence_chunks_hnsw ON public.evidence_chunks
  USING hnsw (embedding halfvec_cosine_ops) WITH (m = 16, ef_construction = 64);

-- Match function
CREATE OR REPLACE FUNCTION public.match_evidence_chunks(
  query_embedding halfvec(3072),
  match_count INT DEFAULT 8,
  filter_case_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  evidence_id UUID,
  case_id UUID,
  content TEXT,
  similarity REAL
)
LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT
    c.id,
    c.evidence_id,
    c.case_id,
    c.content,
    (1 - (c.embedding <=> query_embedding))::real AS similarity
  FROM public.evidence_chunks c
  WHERE c.embedding IS NOT NULL
    AND (filter_case_id IS NULL OR c.case_id = filter_case_id)
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count
$$;
GRANT EXECUTE ON FUNCTION public.match_evidence_chunks(halfvec, INT, UUID) TO authenticated, service_role;

-- =============== entities ===============
CREATE TABLE public.entities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  kind TEXT NOT NULL,
  mentions INT NOT NULL DEFAULT 1,
  confidence REAL NOT NULL DEFAULT 0.5,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.entities TO authenticated;
GRANT ALL ON public.entities TO service_role;
ALTER TABLE public.entities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "entities readable by authenticated" ON public.entities FOR SELECT TO authenticated USING (true);
CREATE POLICY "entities writable by authenticated" ON public.entities FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "entities updatable by authenticated" ON public.entities FOR UPDATE TO authenticated USING (true);
CREATE INDEX entities_case_idx ON public.entities(case_id);
CREATE UNIQUE INDEX entities_case_name_idx ON public.entities(case_id, lower(name));

-- =============== timeline_events ===============
CREATE TABLE public.timeline_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  evidence_id UUID REFERENCES public.evidence(id) ON DELETE SET NULL,
  occurred_at TIMESTAMPTZ NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'document',
  entities TEXT[] NOT NULL DEFAULT '{}',
  confidence REAL NOT NULL DEFAULT 0.5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.timeline_events TO authenticated;
GRANT ALL ON public.timeline_events TO service_role;
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "timeline readable by authenticated" ON public.timeline_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "timeline writable by authenticated" ON public.timeline_events FOR INSERT TO authenticated WITH CHECK (true);
CREATE INDEX timeline_case_idx ON public.timeline_events(case_id);
CREATE INDEX timeline_occurred_idx ON public.timeline_events(occurred_at);

-- =============== contradictions ===============
CREATE TABLE public.contradictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL DEFAULT 'medium',
  confidence REAL NOT NULL DEFAULT 0.5,
  evidence_a_id UUID REFERENCES public.evidence(id) ON DELETE SET NULL,
  evidence_a_excerpt TEXT,
  evidence_b_id UUID REFERENCES public.evidence(id) ON DELETE SET NULL,
  evidence_b_excerpt TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contradictions TO authenticated;
GRANT ALL ON public.contradictions TO service_role;
ALTER TABLE public.contradictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contradictions readable by authenticated" ON public.contradictions FOR SELECT TO authenticated USING (true);
CREATE POLICY "contradictions writable by authenticated" ON public.contradictions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "contradictions updatable by authenticated" ON public.contradictions FOR UPDATE TO authenticated USING (true);
CREATE INDEX contradictions_case_idx ON public.contradictions(case_id);

-- =============== chat_messages ===============
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  role TEXT NOT NULL CHECK (role IN ('user','assistant')),
  content TEXT NOT NULL,
  citations JSONB NOT NULL DEFAULT '[]'::jsonb,
  confidence REAL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.chat_messages TO authenticated;
GRANT ALL ON public.chat_messages TO service_role;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "chat readable by author" ON public.chat_messages FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "chat insertable by author" ON public.chat_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "chat deletable by author" ON public.chat_messages FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX chat_user_case_idx ON public.chat_messages(user_id, case_id, created_at);

-- Storage policies for the 'evidence' bucket
CREATE POLICY "evidence bucket read for authenticated"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'evidence');

CREATE POLICY "evidence bucket insert for authenticated"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'evidence' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "evidence bucket delete for uploader"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'evidence' AND (auth.uid())::text = (storage.foldername(name))[1]);
