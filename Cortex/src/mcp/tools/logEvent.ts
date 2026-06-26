import { loadSession, saveSession } from "../../sessionStore.js";
import type { EventType } from "../../types.js";

const FILE_CHANGE_TYPES = new Set<EventType>(["modify_file", "create_file"]);

export interface LogEventInput {
  sessionId: string;
  type: EventType;
  file?: string;
  content?: string;
  reason?: string;
}

export function logEvent({
  sessionId,
  type,
  file,
  content,
  reason,
}: LogEventInput): string {
  if (FILE_CHANGE_TYPES.has(type)) {
    if (!file) {
      return `Error: ${type} requires a file path`;
    }
    if (!content) {
      return `Error: ${type} requires full file content (state memory)`;
    }
  }

  const session = loadSession(sessionId);

  session.events.push({
    type,
    file,
    content: FILE_CHANGE_TYPES.has(type) ? undefined : content,
    reason,
    timestamp: new Date().toISOString(),
  });

  if (file && type !== "reject_change") {
    if (!session.filesTouched.includes(file)) {
      session.filesTouched.push(file);
    }
  }

  if (FILE_CHANGE_TYPES.has(type) && file && content) {
    session.fileStates[file] = content;
  }

  if (type === "reject_change" && file) {
    if (!session.filesRejected.includes(file)) {
      session.filesRejected.push(file);
    }
  }

  if (type === "decision" && content && !session.decisions.includes(content)) {
    session.decisions.push(content);
  }

  if (type === "mistake" && content && !session.mistakes.includes(content)) {
    session.mistakes.push(content);
  }

  saveSession(session);

  if (FILE_CHANGE_TYPES.has(type) && file) {
    return `Logged ${type} for ${file} — stored full file state in session ${sessionId}`;
  }

  return `Logged ${type} in session ${sessionId}`;
}
