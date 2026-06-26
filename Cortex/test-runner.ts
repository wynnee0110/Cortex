import { runAgent } from "./src/runAgent.js";

async function main(): Promise<void> {
  const result = await runAgent("node", ["example-agent.js"]);

  console.log("\n\n=== CORTEX MEMORY CAPTURED ===");
  console.log(result.memory);
}

main();
