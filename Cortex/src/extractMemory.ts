import { saveMemory } from "./saveMemory.js";
import type { ExtractedMemory } from "./types.js";

export function extractMemory(text: string): ExtractedMemory {
  const lines = text.split("\n");

  const extracted: ExtractedMemory = {
    decisions: [],
    mistakes: [],
    architecture: [],
  };

  for (const line of lines) {
    const clean = line.trim();

    if (clean.startsWith("Decision:")) {
      extracted.decisions.push(clean.replace("Decision:", "").trim());
    }

    if (clean.startsWith("Mistake:")) {
      extracted.mistakes.push(clean.replace("Mistake:", "").trim());
    }

    if (clean.startsWith("Architecture:")) {
      extracted.architecture.push(clean.replace("Architecture:", "").trim());
    }
  }

  for (const content of extracted.decisions) {
    saveMemory("decisions", { content });
  }

  for (const content of extracted.mistakes) {
    saveMemory("mistakes", { content });
  }

  for (const content of extracted.architecture) {
    saveMemory("architecture", { content });
  }

  return extracted;
}
