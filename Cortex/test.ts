import { captureOutput } from "./src/captureOutput.js";

const output = `
DECISIONS:
- Use PostgreSQL
- Use Supabase Auth

MISTAKES:
- Forgot JWT secret

ARCHITECTURE:
- Added auth layer

TASK SUMMARY:
Built login system
`;

console.log(captureOutput(output));
