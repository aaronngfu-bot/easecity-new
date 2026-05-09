# Create Subagent

Use the `create-subagent` skill to help me author a new Cursor subagent.

## What you do

1. If context already makes the subagent's purpose clear, infer it. Otherwise use `AskQuestion` only for what is still missing:
   - scope — project (`.cursor/agents/<name>.md`) or user (`~/.cursor/agents/<name>.md`)?
   - single specialized task it should excel at
   - when should the main agent delegate to it?
2. Write the `.md` file with YAML frontmatter:
   - `name`: lowercase letters + hyphens, unique
   - `description`: specific and action-oriented, includes trigger terms, prefer phrasing like _"Use proactively when …"_ so the main agent delegates automatically
3. Body = the system prompt. Structure it as:
   - role statement (`You are a …`)
   - **When invoked:** numbered steps
   - checklist / decision rules
   - output format (e.g. Critical / Warning / Suggestion)
4. Keep the subagent **focused on one task** — no generic "helper" / "utils" agents.
5. After writing, suggest a test invocation the user can paste: `Use the <name> subagent to …`.

## Hard rules

- Project subagents (`.cursor/agents/`) win over user subagents (`~/.cursor/agents/`) when names collide.
- Never commit secrets or tokens into a subagent body.
