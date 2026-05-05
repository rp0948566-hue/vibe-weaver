import { supabase } from "@/integrations/supabase/client";
import { detectPatterns } from "./patternDetector";

export interface BuildMemory {
  id: string;
  userId: string;
  projectId: string | null;
  prompt: string;
  model: string;
  componentTypes: string[];
  styleTags: string[];
  colorPalette: string[];
  createdAt: string;
}

export async function saveBuildMemory(args: {
  userId: string;
  projectId: string | null;
  prompt: string;
  code: string;
  model: string;
}): Promise<void> {
  const { userId, projectId, prompt, code, model } = args;
  const patterns = detectPatterns(code);

  const { error: memErr } = await supabase.from("build_memories").insert({
    user_id: userId,
    project_id: projectId,
    prompt,
    model,
    component_types: patterns.componentTypes,
    style_tags: patterns.styleTags,
    color_palette: patterns.colorPalette,
  });
  if (memErr) console.warn("emergence: saveBuildMemory", memErr.message);

  // Upsert pattern counts
  for (const tag of [...patterns.componentTypes, ...patterns.styleTags]) {
    const { error } = await supabase.rpc("upsert_pattern" as never, {
      p_user_id: userId,
      p_pattern_key: tag,
      p_category: patterns.componentTypes.includes(tag) ? "component" : "style",
    } as never);
    if (error) {
      // Fallback: manual upsert
      await supabase
        .from("prompt_patterns")
        .upsert(
          {
            user_id: userId,
            pattern_key: tag,
            category: patterns.componentTypes.includes(tag) ? "component" : "style",
            count: 1,
            last_seen_at: new Date().toISOString(),
          },
          { onConflict: "user_id,pattern_key", ignoreDuplicates: false },
        )
        .then(() => {});
    }
  }

  // Increment fingerprint total_builds
  await supabase
    .from("user_fingerprints")
    .upsert(
      { user_id: userId, total_builds: 1, preferred_styles: {}, updated_at: new Date().toISOString() },
      { onConflict: "user_id", ignoreDuplicates: false },
    );
}

export async function getRecentBuilds(
  userId: string,
  limit = 20,
): Promise<BuildMemory[]> {
  const { data, error } = await supabase
    .from("build_memories")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.warn("emergence: getRecentBuilds", error.message);
    return [];
  }
  return (data ?? []).map((r) => ({
    id: r.id,
    userId: r.user_id,
    projectId: r.project_id ?? null,
    prompt: r.prompt,
    model: r.model ?? "",
    componentTypes: r.component_types ?? [],
    styleTags: r.style_tags ?? [],
    colorPalette: r.color_palette ?? [],
    createdAt: r.created_at,
  }));
}

export async function getTopPatterns(
  userId: string,
  limit = 10,
): Promise<Array<{ key: string; category: string; count: number }>> {
  const { data, error } = await supabase
    .from("prompt_patterns")
    .select("pattern_key, category, count")
    .eq("user_id", userId)
    .order("count", { ascending: false })
    .limit(limit);
  if (error) {
    console.warn("emergence: getTopPatterns", error.message);
    return [];
  }
  return (data ?? []).map((r) => ({
    key: r.pattern_key,
    category: r.category,
    count: r.count,
  }));
}

export async function getEmergenceStats(userId: string): Promise<{
  totalBuilds: number;
  topPatterns: Array<{ key: string; category: string; count: number }>;
}> {
  const [fingerprint, patterns] = await Promise.all([
    supabase
      .from("user_fingerprints")
      .select("total_builds")
      .eq("user_id", userId)
      .maybeSingle(),
    getTopPatterns(userId, 8),
  ]);
  return {
    totalBuilds: fingerprint.data?.total_builds ?? 0,
    topPatterns: patterns,
  };
}
