import { watch, statSync } from "node:fs";
import { exec } from "node:child_process";
import { join, resolve } from "node:path";

const workspaceRoot = resolve("..");
const cortexRoot = resolve(".");

console.log(`[Cortex Watcher] Starting workspace watcher...`);
console.log(`[Cortex Watcher] Watching directory: ${workspaceRoot}`);

const IGNORE_DIRS = [".git", "node_modules", "Cortex", ".cursor", ".agents"];

function shouldWatch(relPath: string): boolean {
  if (!relPath) return false;
  return !IGNORE_DIRS.some(dir => relPath.startsWith(dir) || relPath.includes("/" + dir + "/"));
}

const changeTimes = new Map<string, number>();

const watcher = watch(workspaceRoot, { recursive: true }, (eventType, filename) => {
  if (!filename || !shouldWatch(filename)) return;

  const fullPath = join(workspaceRoot, filename);
  
  try {
    const stats = statSync(fullPath);
    if (stats.isDirectory()) return;
  } catch {
    return; // Ignore deletions / non-existent files
  }

  const now = Date.now();
  const lastChange = changeTimes.get(filename) || 0;
  if (now - lastChange < 500) return; // Debounce events within 500ms
  changeTimes.set(filename, now);

  console.log(`[Cortex Watcher] Change detected in: ${filename}`);

  const payload = JSON.stringify({
    workspace_roots: [workspaceRoot],
    file_path: filename
  });

  const proc = exec("node dist/hooks/logFileEdit.js", { cwd: cortexRoot });
  proc.stdin?.write(payload);
  proc.stdin?.end();
});

process.on("SIGINT", () => {
  console.log("[Cortex Watcher] Stopping watcher...");
  watcher.close();
  process.exit(0);
});
