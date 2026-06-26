import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { sessionsDir } from "./paths.js";
import type { SessionData } from "./types.js";

export function loadSessions(): SessionData[] {
  const files = readdirSync(sessionsDir);

  return files.map((file) => {
    const filePath = join(sessionsDir, file);
    return JSON.parse(readFileSync(filePath, "utf8")) as SessionData;
  });
}
