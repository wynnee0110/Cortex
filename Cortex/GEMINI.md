# Antigravity + Cortex

Read `AGENTS.md` for shared Cortex rules. Antigravity-specific setup:

## MCP

Workspace config: `.agents/mcp_config.json`

Verify in Agent Manager → Integrations → MCP Servers, or run `/mcp` in the agent panel.

## Hooks

Configured in `.agents/hooks.json`:

- **PreInvocation** → injects Cortex memory, creates session ID
- **PostToolUse** (write_to_file|edit_file|Write|Edit) → stores full file state

Run `npm run build` before first use so `dist/hooks/` exists.

## Tools

Cortex MCP exposes `get_context`, `save_memory`, `search_memory`, and `log_event`. File-change logging is automatic via hooks — only call `log_event` for decisions, mistakes, and rejections.
