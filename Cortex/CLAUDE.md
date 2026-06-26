# Claude Code + Cortex

Read `AGENTS.md` for shared Cortex rules. Claude-specific setup:

## MCP

Project MCP config: `.mcp.json` — run `claude mcp list` to verify `cortex` is connected.

If not auto-loaded:

```bash
claude mcp add cortex -- node dist/mcp/server.js
```

## Hooks

Configured in `.claude/settings.json`:

- **SessionStart** → injects Cortex memory, creates session ID
- **PostToolUse** (Write|Edit|MultiEdit) → stores full file state to session memory

Run `npm run build` before first use so `dist/hooks/` exists.

## Tools

Use MCP tools `get_context`, `save_memory`, `search_memory`, and `log_event` (for decisions/mistakes only — file changes are automatic).

Do not work around or disable Cortex hooks.
