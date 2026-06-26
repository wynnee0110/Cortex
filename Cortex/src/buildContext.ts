import { rankMemories, loadSummaries } from "./retrieveMemory.js";

export function buildContext(query?: string): string {
  const ranked = rankMemories(query);

  const generalMemories = ranked.filter((m) => m.type !== "architecture" && m.type !== "summary").slice(0, 10);
  const archMemories = ranked.filter((m) => m.type === "architecture").slice(0, 5);
  const recentSummaries = loadSummaries().slice(0, 3);

  const formattedGeneral = generalMemories
    .map((m) => `- [${m.type.toUpperCase()}] ${m.content}`)
    .join("\n") || "None";

  const formattedArch = archMemories
    .map((m) => `- ${m.content}`)
    .join("\n") || "None";

  const formattedSummaries = recentSummaries
    .map((s) => {
      const dateStr = new Date(s.timestamp).toLocaleDateString();
      const parts = [`- [${dateStr}] ${s.summary}`];
      if (s.decisions && s.decisions.length > 0) {
        parts.push(`  • Decisions: ${s.decisions.slice(0, 3).join(", ")}`);
      }
      if (s.mistakes && s.mistakes.length > 0) {
        parts.push(`  • Lessons: ${s.mistakes.slice(0, 3).join(", ")}`);
      }
      return parts.join("\n");
    })
    .join("\n") || "None";

  return `
=== CORTEX COMPRESSED CONTEXT ===

RECENT RELEVANT MEMORIES (Decisions & Lessons)
${formattedGeneral}

SYSTEM ARCHITECTURE
${formattedArch}

RECENT SESSION SUMMARIES
${formattedSummaries}

=================================
`;
}
