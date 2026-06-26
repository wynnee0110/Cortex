import { loadSession, saveSession } from "./sessionStore.js";
import { getOrCreateSessionId } from "./hooks/cortexSession.js";
import { finalizeAndSummarizeSession } from "./sessionSummarizer.js";
import type { CapturedOutput } from "./types.js";

type Section = "decisions" | "mistakes" | "architecture" | "summary";

export function captureOutput(text: string): CapturedOutput {
  const sections: CapturedOutput = {
    decisions: [],
    mistakes: [],
    architecture: [],
    summary: "",
  };

  let current: Section | null = null;
  const lines = text.split("\n");

  for (const line of lines) {
    const clean = line.trim();

    if (clean.startsWith("DECISIONS:")) {
      current = "decisions";
      continue;
    }

    if (clean.startsWith("MISTAKES:")) {
      current = "mistakes";
      continue;
    }

    if (clean.startsWith("ARCHITECTURE:")) {
      current = "architecture";
      continue;
    }

    if (clean.startsWith("TASK SUMMARY:")) {
      current = "summary";
      continue;
    }

    if (!clean.startsWith("-")) continue;

    const value = clean.replace("-", "").trim();

    if (current === "summary") {
      sections.summary = value;
    } else if (current) {
      sections[current].push(value);
    }
  }

  const sessionId = getOrCreateSessionId();
  const session = loadSession(sessionId);

  for (const dec of sections.decisions) {
    if (!session.decisions.includes(dec)) {
      session.decisions.push(dec);
    }
  }

  for (const mis of sections.mistakes) {
    if (!session.mistakes.includes(mis)) {
      session.mistakes.push(mis);
    }
  }

  saveSession(session);

  finalizeAndSummarizeSession(sessionId, text);

  return sections;
}
