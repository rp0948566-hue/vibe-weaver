/*
 * EMERGENCE ENGINE
 * ================
 * Architecture:
 *
 *  useAIBuild.ts
 *    ├─ [before stream] contextInjector.ts → prepend style fingerprint to messages
 *    └─ [after build]   buildMemory.ts     → save build + update patterns
 *
 *  buildMemory.ts
 *    └─ patternDetector.ts  → extract component/style/color tags from raw code
 *
 *  userFingerprint.ts
 *    └─ computeFingerprint() from build history → StyleFingerprint object
 *    └─ loadFingerprint() / persistFingerprint() ↔ Supabase user_fingerprints
 *
 *  reverseEngineer.ts
 *    └─ URL → DesignDNA (heuristic + optional edge function)
 *    └─ Cached in Supabase design_dna
 *
 *  EmergencePanel.tsx   → reads emergenceStats from Zustand, shows live dashboard
 *  ReverseEngineerInput.tsx → URL input → injects DesignDNA prompt into ChatPanel
 */

export { saveBuildMemory, getRecentBuilds, getTopPatterns, getEmergenceStats } from "./buildMemory";
export type { BuildMemory } from "./buildMemory";

export { detectPatterns } from "./patternDetector";
export type { PatternResult } from "./patternDetector";

export { computeFingerprint, loadFingerprint, persistFingerprint } from "./userFingerprint";
export type { StyleFingerprint } from "./userFingerprint";

export { injectEmergenceContext } from "./contextInjector";

export { reverseEngineerUrl } from "./reverseEngineer";
export type { DesignDNA } from "./reverseEngineer";
