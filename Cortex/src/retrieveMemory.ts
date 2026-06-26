import { loadMemory } from "./loadMemory.js";
import { summariesDir } from "./paths.js";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { MemoryType, SearchResult, SessionSummaryData } from "./types.js";

export interface RankedMemory {
  type: "decision" | "mistake" | "architecture" | "task" | "summary";
  content: string;
  timestamp: string;
  score: number;
}

export function loadSummaries(): SessionSummaryData[] {
  if (!existsSync(summariesDir)) return [];
  try {
    const files = readdirSync(summariesDir);
    return files
      .filter((f) => f.endsWith(".json"))
      .map((file) => {
        const filePath = join(summariesDir, file);
        return JSON.parse(readFileSync(filePath, "utf8")) as SessionSummaryData;
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch {
    return [];
  }
}

export function retrieveMemory(keyword: string): SearchResult[] {
  const memory = loadMemory();
  const results: SearchResult[] = [];

  for (const [type, items] of Object.entries(memory)) {
    for (const item of items) {
      const text = JSON.stringify(item);

      if (text.toLowerCase().includes(keyword.toLowerCase())) {
        results.push({
          type: type as MemoryType,
          item,
        });
      }
    }
  }

  return results;
}

export function rankMemories(query?: string): RankedMemory[] {
  const memory = loadMemory();
  const summaries = loadSummaries();
  const list: RankedMemory[] = [];

  for (const item of memory.decisions) {
    list.push({
      type: "decision",
      content: item.content,
      timestamp: item.timestamp || new Date(0).toISOString(),
      score: 0,
    });
  }

  for (const item of memory.mistakes) {
    list.push({
      type: "mistake",
      content: item.content,
      timestamp: item.timestamp || new Date(0).toISOString(),
      score: 0,
    });
  }

  for (const item of memory.architecture) {
    list.push({
      type: "architecture",
      content: item.content,
      timestamp: item.timestamp || new Date(0).toISOString(),
      score: 0,
    });
  }

  for (const item of memory.tasks) {
    list.push({
      type: "task",
      content: item.content,
      timestamp: item.timestamp || new Date(0).toISOString(),
      score: 0,
    });
  }

  for (const sum of summaries) {
    list.push({
      type: "summary",
      content: `Session Summary: ${sum.summary}` +
        (sum.decisions.length ? ` | Decisions: ${sum.decisions.join(", ")}` : "") +
        (sum.mistakes.length ? ` | Lessons: ${sum.mistakes.join(", ")}` : ""),
      timestamp: sum.timestamp || new Date(0).toISOString(),
      score: 0,
    });
  }

  const queryWords = query
    ? query
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .split(/\s+/)
        .filter((w) => w.length > 2)
    : [];

  const now = Date.now();

  for (const item of list) {
    let score = 0;

    if (queryWords.length > 0) {
      const contentLower = item.content.toLowerCase();
      for (const word of queryWords) {
        if (contentLower.includes(word)) {
          score += 10;
        }
      }
    }

    const ageMs = now - new Date(item.timestamp).getTime();
    const ageDays = ageMs / (1000 * 60 * 60 * 24);
    if (ageDays <= 1) {
      score += 8;
    } else if (ageDays <= 7) {
      score += 4;
    } else if (ageDays <= 30) {
      score += 2;
    }

    if (item.type === "decision") {
      score += 3;
    } else if (item.type === "mistake") {
      score += 3;
    } else if (item.type === "task") {
      score += 2;
    } else if (item.type === "summary") {
      score += 2;
    } else if (item.type === "architecture") {
      score += 1;
    }

    item.score = score;
  }

  return list.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });
}
