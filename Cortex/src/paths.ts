import { fileURLToPath } from "node:url";
import { dirname, join, basename } from "node:path";
import { existsSync, mkdirSync, writeFileSync, readdirSync, readFileSync } from "node:fs";

const srcDir = dirname(fileURLToPath(import.meta.url));

export function getProjectRoot(): string {
  if (process.env.CLAUDE_PROJECT_DIR) return process.env.CLAUDE_PROJECT_DIR;
  if (process.env.CURSOR_PROJECT_DIR) return process.env.CURSOR_PROJECT_DIR;

  let current = process.cwd();
  while (true) {
    if (basename(current) === "Cortex") {
      return dirname(current);
    }
    if (
      existsSync(join(current, "Cortex")) ||
      existsSync(join(current, ".git")) ||
      existsSync(join(current, ".mcp.json"))
    ) {
      return current;
    }
    const parent = dirname(current);
    if (parent === current) {
      break;
    }
    current = parent;
  }

  const defaultRoot = join(srcDir, "..");
  if (basename(defaultRoot) === "Cortex") {
    return dirname(defaultRoot);
  }
  return defaultRoot;
}

export const projectRoot = getProjectRoot();
export const cortexDir = join(projectRoot, ".cortex");
export const coreDir = join(cortexDir, "core");
export const sessionsDir = join(coreDir, "sessions");
export const summariesDir = join(coreDir, "summaries");

export function ensureCortexInitialized(): void {
  if (!existsSync(cortexDir)) {
    mkdirSync(cortexDir, { recursive: true });
  }
  if (!existsSync(coreDir)) {
    mkdirSync(coreDir, { recursive: true });
  }
  if (!existsSync(sessionsDir)) {
    mkdirSync(sessionsDir, { recursive: true });
  }
  if (!existsSync(summariesDir)) {
    mkdirSync(summariesDir, { recursive: true });
  }

  const defaultFiles = ["decisions.json", "mistakes.json", "tasks.json", "architecture.json"];
  const oldCoreDir = join(projectRoot, "Cortex", "core");

  for (const file of defaultFiles) {
    const filePath = join(coreDir, file);
    if (!existsSync(filePath)) {
      const oldPath = join(oldCoreDir, file);
      if (existsSync(oldPath)) {
        try {
          const content = readFileSync(oldPath, "utf8");
          writeFileSync(filePath, content, "utf8");
          console.error(`[Cortex] Migrated ${file} to project .cortex`);
        } catch {
          writeFileSync(filePath, "[]", "utf8");
        }
      } else {
        writeFileSync(filePath, "[]", "utf8");
      }
    }
  }

  const oldSessionsDir = join(oldCoreDir, "sessions");
  if (existsSync(oldSessionsDir) && existsSync(sessionsDir)) {
    try {
      const files = readdirSync(oldSessionsDir);
      for (const file of files) {
        const dest = join(sessionsDir, file);
        if (!existsSync(dest)) {
          const src = join(oldSessionsDir, file);
          writeFileSync(dest, readFileSync(src));
          console.error(`[Cortex] Migrated session ${file} to project .cortex`);
        }
      }
    } catch {
      // Ignore migration errors
    }
  }
}

ensureCortexInitialized();
