import { writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { coreDir, summariesDir } from "./paths.js";
import { loadSession } from "./sessionStore.js";
import { saveMemory } from "./saveMemory.js";
import { clearSessionMeta } from "./hooks/cortexSession.js";
import type { SessionSummaryData } from "./types.js";

export function finalizeAndSummarizeSession(
  sessionId: string,
  agentOutput?: string
): SessionSummaryData {
  const session = loadSession(sessionId);

  // 1. Gather all decisions, mistakes, architecture updates
  const decisions = new Set<string>(session.decisions);
  const mistakes = new Set<string>(session.mistakes);
  const architecture = new Set<string>();

  // 2. Parse from agent output (if any)
  if (agentOutput) {
    const lines = agentOutput.split("\n");
    let currentSection: "decisions" | "mistakes" | "architecture" | "summary" | null = null;

    for (const line of lines) {
      const clean = line.trim();
      const lower = clean.toLowerCase();

      if (lower.startsWith("decisions:")) {
        currentSection = "decisions";
        continue;
      }
      if (lower.startsWith("mistakes:") || lower.startsWith("lessons:")) {
        currentSection = "mistakes";
        continue;
      }
      if (lower.startsWith("architecture:")) {
        currentSection = "architecture";
        continue;
      }
      if (lower.startsWith("task summary:") || lower.startsWith("summary:")) {
        currentSection = "summary";
        continue;
      }

      if (clean.startsWith("-") || clean.startsWith("*")) {
        const item = clean.substring(1).trim();
        if (item) {
          if (currentSection === "decisions") decisions.add(item);
          if (currentSection === "mistakes") mistakes.add(item);
          if (currentSection === "architecture") architecture.add(item);
        }
      } else if (clean && !clean.includes(":") && currentSection) {
        if (currentSection === "decisions") decisions.add(clean);
        if (currentSection === "mistakes") mistakes.add(clean);
        if (currentSection === "architecture") architecture.add(clean);
      }
    }
  }

  // 3. Scan events for inline decisions/mistakes/architecture changes
  for (const event of session.events) {
    if (event.type === "decision" && event.content) {
      decisions.add(event.content);
    }
    if (event.type === "mistake" && event.content) {
      mistakes.add(event.content);
    }
    if (event.reason) {
      const reasonLower = event.reason.toLowerCase();
      if (reasonLower.includes("decided to") || reasonLower.includes("chose to")) {
        decisions.add(event.reason);
      }
      if (reasonLower.includes("forgot") || reasonLower.includes("mistake") || reasonLower.includes("bug")) {
        mistakes.add(event.reason);
      }
    }
  }

  // 4. Heuristically scan modified/created files for decisions, architecture, and mistakes
  for (const file of session.filesTouched) {
    const fileLower = file.toLowerCase();

    // Heuristics for Decisions
    if (fileLower.includes("tailwind")) {
      decisions.add("Use Tailwind CSS for styling and utility classes.");
      architecture.add("Configured Tailwind CSS in the project.");
    }
    if (fileLower.includes("package.json")) {
      const content = session.fileStates[file];
      if (content) {
        if (content.includes('"tailwindcss"')) {
          decisions.add("Use Tailwind CSS dependency.");
        }
        if (content.includes('"typescript"')) {
          decisions.add("Use TypeScript for type safety.");
        }
      }
    }

    // Heuristics for Architecture
    if (fileLower.includes("mcp/server") || fileLower.includes("mcp/tools")) {
      architecture.add("Refactored MCP server tools and handler registration.");
    } else if (fileLower.includes("watcher")) {
      architecture.add("Updated file watcher integration and hooks.");
    } else if (fileLower.includes("paths")) {
      architecture.add("Updated file system paths for project-level isolation.");
    } else if (fileLower.includes("session")) {
      architecture.add("Enhanced session state tracking and lifecycle hooks.");
    } else if (fileLower.includes("index.html")) {
      architecture.add("Updated the main HTML structure of the landing page.");
    } else if (fileLower.includes("styles.css")) {
      architecture.add("Updated styles.css with styling adjustments.");
    }
  }

  // Heuristics for Mistakes/Lessons from rejected files
  for (const file of session.filesRejected) {
    mistakes.add(`Changes rejected on file: ${file}. Resolved issues and aligned implementation with requirements.`);
  }

  // 5. Generate Session Summary Paragraph
  let summaryText = "";
  if (session.filesTouched.length > 0) {
    const filesList = session.filesTouched.slice(0, 3).join(", ") + 
                      (session.filesTouched.length > 3 ? ` and ${session.filesTouched.length - 3} other files` : "");
    summaryText = `Successfully completed task by modifying ${filesList}. `;
  } else {
    summaryText = `Reviewed project workspace and updated long-term memory. `;
  }

  if (decisions.size > 0) {
    const decList = Array.from(decisions).slice(0, 2).join(" and ");
    summaryText += `Key decisions made: ${decList}. `;
  }
  if (mistakes.size > 0) {
    const misList = Array.from(mistakes).slice(0, 1).join("");
    summaryText += `Addressed mistake/lesson: ${misList}. `;
  }

  if (summaryText.length > 250) {
    summaryText = summaryText.substring(0, 247) + "...";
  }

  // 6. Save new decisions/mistakes/architecture items to long-term memory files
  for (const dec of decisions) {
    saveMemory("decisions", { content: dec });
  }
  for (const mis of mistakes) {
    saveMemory("mistakes", { content: mis });
  }
  for (const arch of architecture) {
    saveMemory("architecture", { content: arch });
  }

  // Generate a task entry too
  if (session.filesTouched.length > 0) {
    saveMemory("tasks", { content: `Completed work on: ${session.filesTouched.join(", ")}` });
  }

  // 7. Write Summary JSON
  const summaryData: SessionSummaryData = {
    timestamp: new Date().toISOString(),
    summary: summaryText,
    decisions: Array.from(decisions),
    architecture: Array.from(architecture),
    mistakes: Array.from(mistakes),
  };

  const filePath = join(summariesDir, `${sessionId}.json`);
  writeFileSync(filePath, JSON.stringify(summaryData, null, 2), "utf8");

  // 8. Finalize session by clearing active metadata
  clearSessionMeta();

  return summaryData;
}
