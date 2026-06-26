import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { coreDir } from "./paths.js";
import type { MemoryItem, MemoryType } from "./types.js";

export function saveMemory(
  type: MemoryType,
  item: { content: string } & Record<string, unknown>
): void {
  const path = join(coreDir, `${type}.json`);
  const memories: MemoryItem[] = JSON.parse(readFileSync(path, "utf8"));

  const content = item.content.trim();
  if (memories.some((m) => m.content.trim() === content)) {
    return;
  }

  const entry: MemoryItem = {
    ...item,
    content,
    timestamp: new Date().toISOString(),
  };

  memories.push(entry);

  writeFileSync(path, JSON.stringify(memories, null, 2));
}
