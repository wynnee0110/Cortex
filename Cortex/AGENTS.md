# Cortex — Agent Rules

This project uses Cortex for persistent memory across AI coding sessions.

## Setup (once per machine)

```bash
npm install
npm run build
```

## Memory Architecture

| Layer            | Storage                         | Purpose                              |
| ---------------- | ------------------------------- | ------------------------------------ |
| Long-term Memory | core/decisions.json             | Permanent project decisions          |
| Long-term Memory | core/mistakes.json              | Lessons learned and recurring issues |
| Long-term Memory | core/architecture.json          | System architecture history          |
| Long-term Memory | core/tasks.json                 | Completed work history               |
| Session Memory   | core/sessions/<session-id>.json | Session timeline and file snapshots  |
| State Memory     | fileStates                      | Latest version of modified files     |

Hooks automatically capture file modifications and store full file snapshots.

Agents should never manually log file modifications.

---

## Required Startup Workflow

At the beginning of every session:

1. Load Cortex memory using `get_context`.
2. Read project decisions.
3. Read architecture history.
4. Read known mistakes.
5. Use this information before making any implementation decisions.

---

## Required Completion Workflow

Every completed task MUST follow this sequence:

Task Complete
↓
Summarize Work
↓
Save Decisions
↓
Save Architecture Updates
↓
Save Mistakes
↓
Save Task Summary
↓
Respond To User

Memory saving is mandatory.

Do not skip memory updates.

Do not wait for user approval before saving project memory.

---

## Decision Memory Rules

Save a decision whenever:

* A framework is selected
* A library is selected
* A database is selected
* An API provider is selected
* A coding standard is established
* A project convention is introduced
* A deployment strategy is chosen

Examples:

* Use Tailwind CSS
* Use Next.js App Router
* Use PostgreSQL
* Use Supabase Auth
* Use Redis Cache

Tool:

```text
save_memory(type="decisions")
```

---

## Architecture Memory Rules

Save architecture memory whenever:

* Project structure changes
* New system layers are added
* Authentication is introduced
* State management changes
* Database schema strategy changes
* Service integrations are added
* Major refactors occur

Examples:

* Added authentication middleware
* Moved JavaScript into script.js
* Introduced caching layer
* Created reusable component architecture
* Added MCP integration

Tool:

```text
save_memory(type="architecture")
```

---

## Mistake Memory Rules

Save mistakes whenever:

* Bugs are discovered
* Failed approaches occur
* Incorrect assumptions are found
* Build issues are fixed
* Configuration issues are resolved

Examples:

* Forgot JWT secret
* Missing auth middleware
* Incorrect environment variable path
* API route validation missing

Tool:

```text
save_memory(type="mistakes")
```

---

## Task Memory Rules

Every completed user request must create a task memory.

Examples:

* Created responsive navbar
* Implemented login page
* Added search feature
* Fixed build configuration
* Integrated Cortex MCP server

Tool:

```text
save_memory(type="tasks")
```

This rule applies even if no decision, architecture change, or mistake occurred.

---

## Session Event Rules

Use `log_event` for:

* decision
* mistake
* reject_change

Examples:

```text
log_event(type="decision")
log_event(type="mistake")
log_event(type="reject_change")
```

Do not use `log_event` for:

* modify_file
* create_file
* read_file

Hooks already handle file tracking.

---

## File Tracking Rules

Hooks automatically:

* Detect file edits
* Capture full file contents
* Track touched files
* Track rejected files
* Maintain session timelines

Agents must not manually duplicate this behavior.

---

## Cortex Priority

Before making a new decision:

1. Check existing Cortex memory.
2. Reuse previous project decisions.
3. Avoid repeating known mistakes.
4. Follow established architecture patterns.
5. Preserve consistency across sessions.

Cortex memory is the source of truth for project history.

Always prefer existing project knowledge over creating new patterns without justification.
