#!/usr/bin/env node
import { buildContext } from "../buildContext.js";
import { newSessionId, saveSessionMeta } from "./cortexSession.js";
import { readStdin } from "./readStdin.js";

function isCursorSessionStart(data: Record<string, unknown>): boolean {
  return (
    data.hook_event_name === "sessionStart" || "composer_mode" in data
  );
}

function extractPlatformSessionId(data: Record<string, unknown>): string | undefined {
  if (typeof data.session_id === "string") {
    return data.session_id;
  }
  if (typeof data.sessionId === "string") {
    return data.sessionId;
  }
  return undefined;
}

async function main(): Promise<void> {
  const raw = await readStdin();
  let data: Record<string, unknown> = {};

  if (raw.trim()) {
    try {
      data = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      data = {};
    }
  }

  const sessionId = extractPlatformSessionId(data) ?? newSessionId();
  saveSessionMeta({ sessionId, startedAt: new Date().toISOString() });

  const context = buildContext();
  const message = `${context}\n\nCortex session: ${sessionId}. File edits are auto-logged to session memory (full file state).`;

  if (isCursorSessionStart(data)) {
    console.log(
      JSON.stringify({
        additional_context: message,
        env: { CORTEX_SESSION_ID: sessionId },
      })
    );
    return;
  }

  console.log(message);
}

main().catch(() => {
  process.exit(0);
});
