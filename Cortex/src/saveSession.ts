import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { sessionsDir } from "./paths.js";
import type { SessionData } from "./types.js";

export function saveSession(session: Omit<SessionData, "timestamp">): void {
  const timestamp = new Date().toISOString();
  const filename = `${timestamp.replace(/[:.]/g, "-")}.json`;
  const filePath = join(sessionsDir, filename);

  const sessionData: SessionData = {
    timestamp,
    ...session,
  };

  writeFileSync(filePath, JSON.stringify(sessionData, null, 2));
}
