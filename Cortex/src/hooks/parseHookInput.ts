import { resolve, relative } from "node:path";

export interface ParsedFileEdit {
  filePath: string;
  relativePath: string;
}

function getProjectRoot(data: Record<string, unknown>): string {
  const workspaceRoots = data.workspace_roots;
  if (Array.isArray(workspaceRoots) && typeof workspaceRoots[0] === "string") {
    return workspaceRoots[0];
  }

  return (
    process.env.CLAUDE_PROJECT_DIR ||
    process.env.CURSOR_PROJECT_DIR ||
    process.cwd()
  );
}

function resolveFilePath(raw: string, projectRoot: string): string {
  return resolve(projectRoot, raw);
}

export function toRelativePath(filePath: string, projectRoot: string): string {
  const rel = relative(projectRoot, resolve(filePath));
  return rel.startsWith("..") ? filePath : rel;
}

export function parseHookInput(raw: string): ParsedFileEdit | null {
  let data: Record<string, unknown>;
  try {
    data = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }

  const projectRoot = getProjectRoot(data);
  const toolInput = (data.tool_input ?? {}) as Record<string, unknown>;

  let filePathRaw: string | undefined;

  if (typeof data.file_path === "string") {
    filePathRaw = data.file_path;
  } else if (typeof toolInput.file_path === "string") {
    filePathRaw = toolInput.file_path;
  } else if (typeof toolInput.path === "string") {
    filePathRaw = toolInput.path;
  }

  if (!filePathRaw) {
    return null;
  }

  const filePath = resolveFilePath(filePathRaw, projectRoot);
  return {
    filePath,
    relativePath: toRelativePath(filePath, projectRoot),
  };
}
