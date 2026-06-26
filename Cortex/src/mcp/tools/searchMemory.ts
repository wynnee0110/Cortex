import { retrieveMemory } from "../../retrieveMemory.js";
import type { SearchResult } from "../../types.js";

export function searchMemory(keyword: string): SearchResult[] {
  return retrieveMemory(keyword);
}
