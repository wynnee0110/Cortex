#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { getContext } from "./tools/getContext.js";
import { logEvent } from "./tools/logEvent.js";
import { saveMemoryEntry } from "./tools/saveMemoryTool.js";
import { searchMemory } from "./tools/searchMemory.js";
import { getOrCreateSessionId } from "../hooks/cortexSession.js";
import { finalizeAndSummarizeSession } from "../sessionSummarizer.js";

const memoryTypeSchema = z.enum([
  "decisions",
  "mistakes",
  "tasks",
  "architecture",
]);

const server = new McpServer({
  name: "cortex",
  version: "1.0.0",
});

server.registerTool(
  "get_context",
  {
    description:
      "Load ranked project memory (decisions, mistakes, architecture, tasks, summaries) relevant to the current task or files",
    inputSchema: z.object({
      query: z.string().optional().describe("Search query, active file, or task description to rank relevance"),
    }),
  },
  async ({ query }) => ({
    content: [{ type: "text", text: getContext(query) }],
  })
);

server.registerTool(
  "end_session",
  {
    description: "Finalize the current session, automatically capture memories, generate a summary, and save it",
    inputSchema: z.object({
      sessionId: z.string().optional().describe("The active session ID to finalize. If not provided, resolves active session automatically."),
    }),
  },
  async ({ sessionId }) => {
    const activeId = sessionId ?? getOrCreateSessionId();
    const summary = finalizeAndSummarizeSession(activeId);
    return {
      content: [
        {
          type: "text",
          text: `Session ${activeId} finalized and summarized successfully.\n\nSummary:\n${summary.summary}\n\nDecisions captured: ${summary.decisions.length}\nLessons learned: ${summary.mistakes.length}`,
        },
      ],
    };
  }
);

server.registerTool(
  "save_memory",
  {
    description: "Save a new memory entry to Cortex long-term storage",
    inputSchema: z.object({
      type: memoryTypeSchema,
      content: z.string().describe("The memory content to save"),
    }),
  },
  async ({ type, content }) => {
    saveMemoryEntry(type, content);
    return {
      content: [
        {
          type: "text",
          text: `Saved to ${type}: ${content}`,
        },
      ],
    };
  }
);

server.registerTool(
  "search_memory",
  {
    description: "Search Cortex memories by keyword",
    inputSchema: z.object({
      keyword: z.string().describe("Search term to match against memory entries"),
    }),
  },
  async ({ keyword }) => {
    const results = searchMemory(keyword);

    if (results.length === 0) {
      return {
        content: [{ type: "text", text: `No memories found for "${keyword}"` }],
      };
    }

    const text = results
      .map(
        (r) =>
          `[${r.type}] ${r.item.timestamp}: ${r.item.content ?? JSON.stringify(r.item)}`
      )
      .join("\n");

    return {
      content: [{ type: "text", text }],
    };
  }
);

server.registerTool(
  "log_event",
  {
    description:
      "Log session events. For modify_file and create_file, pass the full updated file as content — Cortex stores complete file state (not diffs) in session memory.",
    inputSchema: z.object({
      sessionId: z.string(),
      type: z.enum([
        "read_file",
        "modify_file",
        "create_file",
        "reject_change",
        "decision",
        "mistake",
      ]),
      file: z.string().optional(),
      content: z
        .string()
        .optional()
        .describe(
          "Full file content for modify_file/create_file; decision/mistake text otherwise"
        ),
      reason: z.string().optional(),
    }),
  },
  async ({ sessionId, type, file, content, reason }) => {
    const message = logEvent({ sessionId, type, file, content, reason });

    return {
      content: [{ type: "text", text: message }],
    };
  }
);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Cortex MCP server running on stdio");
}

main().catch((err: unknown) => {
  console.error("Cortex MCP server failed:", err);
  process.exit(1);
});