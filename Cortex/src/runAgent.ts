import { spawn } from "node:child_process";
import { captureOutput } from "./captureOutput.js";
import type { AgentResult } from "./types.js";

export function runAgent(
  command: string,
  args: string[] = []
): Promise<AgentResult> {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      stdio: ["ignore", "pipe", "pipe"],
    });

    let output = "";

    child.stdout?.on("data", (data: Buffer) => {
      const text = data.toString();
      output += text;
      process.stdout.write(text);
    });

    child.stderr?.on("data", (data: Buffer) => {
      const text = data.toString();
      output += text;
      process.stderr.write(text);
    });

    child.on("error", (err: Error) => {
      console.error("Cortex runner error:", err);
      resolve({
        output,
        error: err.message,
        memory: captureOutput(output),
      });
    });

    child.on("close", (code: number | null) => {
      resolve({
        output,
        exitCode: code,
        memory: captureOutput(output),
      });
    });

    child.stdout?.on("error", () => {});
    child.stderr?.on("error", () => {});
  });
}
