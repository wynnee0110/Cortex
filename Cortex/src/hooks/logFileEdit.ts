#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { logEvent } from "../mcp/tools/logEvent.js";
import { loadSession } from "../sessionStore.js";
import { getOrCreateSessionId } from "./cortexSession.js";
import { parseHookInput } from "./parseHookInput.js";
import { readStdin } from "./readStdin.js";

const SKIP_PREFIXES = [".cortex/", "core/sessions/", "node_modules/", "dist/"];

function shouldSkip(relativePath: string): boolean {
  return SKIP_PREFIXES.some((prefix) => relativePath.startsWith(prefix));
}

async function main(): Promise<void> {
  const raw = await readStdin();
  if (!raw.trim()) {
    return;
  }

  const parsed = parseHookInput(raw);
  if (!parsed) {
    return;
  }

  const { filePath, relativePath } = parsed;
  if (shouldSkip(relativePath) || !existsSync(filePath)) {
    return;
  }

  const sessionId = getOrCreateSessionId();
  const session = loadSession(sessionId);
  const content = readFileSync(filePath, "utf8");
  const type = session.fileStates[relativePath] ? "modify_file" : "create_file";

  logEvent({ sessionId, type, file: relativePath, content });
}

main().catch(() => {
  process.exit(0);
});
