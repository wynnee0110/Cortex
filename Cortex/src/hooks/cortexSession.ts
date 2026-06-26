import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { cortexDir } from "../paths.js";

const sessionFile = join(cortexDir, "session.json");

export function clearSessionMeta(): void {
  if (existsSync(sessionFile)) {
    try {
      unlinkSync(sessionFile);
    } catch {
      // Ignore
    }
  }
}

export interface CortexSessionMeta {
  sessionId: string;
  startedAt: string;
}

export function newSessionId(): string {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

export function saveSessionMeta(meta: CortexSessionMeta): void {
  if (!existsSync(cortexDir)) {
    mkdirSync(cortexDir, { recursive: true });
  }
  writeFileSync(sessionFile, JSON.stringify(meta, null, 2));
}

export function loadSessionMeta(): CortexSessionMeta | null {
  if (!existsSync(sessionFile)) {
    return null;
  }

  return JSON.parse(readFileSync(sessionFile, "utf8")) as CortexSessionMeta;
}

export function getOrCreateSessionId(platformId?: string): string {
  const existing = loadSessionMeta();
  if (existing) {
    return existing.sessionId;
  }

  const sessionId = platformId ?? newSessionId();
  saveSessionMeta({ sessionId, startedAt: new Date().toISOString() });
  return sessionId;
}
