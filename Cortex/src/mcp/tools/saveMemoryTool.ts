import { saveMemory } from "../../saveMemory.js";
import type { MemoryType } from "../../types.js";

export function saveMemoryEntry(type: MemoryType, content: string): void {
  saveMemory(type, { content });
}
