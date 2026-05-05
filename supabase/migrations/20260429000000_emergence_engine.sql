-- Emergence Engine: 4 tables that make Raincast smarter with every build.

-- build_memories: log of every successful AI build, with extracted patterns
CREATE TABLE public.build_memories (
  id          UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID NOT NULL,
  project_id  UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  prompt      TEXT NOT NULL,
  model       TEXT,
  component_types TEXT[] NOT NULL DEFAULT '{}',
  style_tags  TEXT[] NOT NULL DEFAULT '{}',
  color_palette TEXT[] NOT NULL DEFAULT '{}',
  created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.build_memories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own build_memories"   ON public.build_memories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own build_memories" ON public.build_memories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own build_memories" ON public.build_memories FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_build_memories_user_id   ON public.build_memories(user_id);
CREATE INDEX idx_build_memories_created   ON public.build_memories(created_at DESC);

-- prompt_patterns: aggregated pattern frequency across all builds (per user)
CREATE TABLE public.prompt_patterns (
  id           UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID NOT NULL,
  pattern_key  TEXT NOT NULL,
  category     TEXT NOT NULL,
  count        INTEGER NOT NULL DEFAULT 1,
  last_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, pattern_key)
);
ALTER TABLE public.prompt_patterns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own prompt_patterns"   ON public.prompt_patterns FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own prompt_patterns" ON public.prompt_patterns FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own prompt_patterns" ON public.prompt_patterns FOR UPDATE USING (auth.uid() = user_id);
CREATE INDEX idx_prompt_patterns_user_id ON public.prompt_patterns(user_id);
CREATE INDEX idx_prompt_patterns_count   ON public.prompt_patterns(user_id, count DESC);

-- user_fingerprints: distilled style profile per user
CREATE TABLE public.user_fingerprints (
  id              UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID NOT NULL UNIQUE,
  preferred_styles JSONB NOT NULL DEFAULT '{}',
  total_builds    INTEGER NOT NULL DEFAULT 0,
  updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.user_fingerprints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own fingerprint"   ON public.user_fingerprints FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own fingerprint" ON public.user_fingerprints FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own fingerprint" ON public.user_fingerprints FOR UPDATE USING (auth.uid() = user_id);
CREATE INDEX idx_user_fingerprints_user_id ON public.user_fingerprints(user_id);

-- design_dna: cached reverse-engineer results for URLs
CREATE TABLE public.design_dna (
  id          UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID NOT NULL,
  url         TEXT NOT NULL,
  title       TEXT,
  dna         JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.design_dna ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own design_dna"   ON public.design_dna FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own design_dna" ON public.design_dna FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own design_dna" ON public.design_dna FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_design_dna_user_id ON public.design_dna(user_id);
CREATE INDEX idx_design_dna_url     ON public.design_dna(user_id, url);
