import { readFileSync } from "node:fs";
import { join } from "node:path";
import { coreDir } from "./paths.js";
import type { MemoryStore } from "./types.js";

function loadJsonFile<T>(filename: string): T {
  const path = join(coreDir, filename);
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

export function loadMemory(): MemoryStore {
  return {
    decisions: loadJsonFile("decisions.json"),
    mistakes: loadJsonFile("mistakes.json"),
    tasks: loadJsonFile("tasks.json"),
    architecture: loadJsonFile("architecture.json"),
  };
}
