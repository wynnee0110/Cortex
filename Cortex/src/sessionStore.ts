import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { sessionsDir } from "./paths.js";
import type { EventSession } from "./types.js";

function getSessionPath(sessionId: string): string {
  return join(sessionsDir, `${sessionId}.json`);
}

function createSession(sessionId: string): EventSession {
  return {
    sessionId,
    timestamp: new Date().toISOString(),
    events: [],
    filesTouched: [],
    filesRejected: [],
    fileStates: {},
    decisions: [],
    mistakes: [],
  };
}

export function loadSession(sessionId: string): EventSession {
  const filePath = getSessionPath(sessionId);

  if (!existsSync(filePath)) {
    return createSession(sessionId);
  }

  const session = JSON.parse(readFileSync(filePath, "utf8")) as EventSession;

  if (!session.fileStates) {
    session.fileStates = {};
  }

  return session;
}

export function saveSession(session: EventSession): void {
  const filePath = getSessionPath(session.sessionId);
  writeFileSync(filePath, JSON.stringify(session, null, 2));
}
