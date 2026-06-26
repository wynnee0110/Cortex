export type MemoryType = "decisions" | "mistakes" | "tasks" | "architecture";

export interface MemoryItem {
  timestamp: string;
  content: string;
  [key: string]: unknown;
}

export interface MemoryStore {
  decisions: MemoryItem[];
  mistakes: MemoryItem[];
  tasks: MemoryItem[];
  architecture: MemoryItem[];
}

export interface SearchResult {
  type: MemoryType;
  item: MemoryItem;
}

export interface SessionData {
  timestamp: string;
  decisions?: string[];
  mistakes?: string[];
  architecture?: string[];
  summary?: string;
  [key: string]: unknown;
}

export interface SessionSummaryData {
  timestamp: string;
  summary: string;
  decisions: string[];
  architecture: string[];
  mistakes: string[];
}

export type EventType =
  | "read_file"
  | "modify_file"
  | "create_file"
  | "reject_change"
  | "decision"
  | "mistake";

export interface SessionEvent {
  type: EventType;
  file?: string;
  content?: string;
  reason?: string;
  timestamp: string;
}

export interface EventSession {
  sessionId: string;
  timestamp: string;
  events: SessionEvent[];
  filesTouched: string[];
  filesRejected: string[];
  /** Latest full content of each file touched this session (state memory, not diffs). */
  fileStates: Record<string, string>;
  decisions: string[];
  mistakes: string[];
}

export interface CapturedOutput {
  decisions: string[];
  mistakes: string[];
  architecture: string[];
  summary: string;
}

export interface ExtractedMemory {
  decisions: string[];
  mistakes: string[];
  architecture: string[];
}

export interface AgentResult {
  output: string;
  exitCode?: number | null;
  error?: string;
  memory: CapturedOutput;
}
