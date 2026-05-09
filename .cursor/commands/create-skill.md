# Create Skill

Use the `create-skill` skill to help me author a new Agent Skill for Cursor.

## What you do

1. If context (chat history, the current diff, open files) already implies the skill's purpose, infer it. Only use `AskQuestion` for the fields that are still missing:
   - purpose and primary use case
   - **location**: project (`.cursor/skills/<name>/SKILL.md`) or personal (`~/.cursor/skills/<name>/SKILL.md`)
   - trigger scenarios (when should the agent auto-activate this?)
   - whether supporting files / scripts / references are needed
2. Scaffold the directory and write `SKILL.md` with valid YAML frontmatter:
   - `name`: lowercase letters / numbers / hyphens, ≤ 64 chars, unique
   - `description`: third-person, ≤ 1024 chars, includes **what** and **when**, with concrete trigger terms
3. Keep `SKILL.md` under 500 lines. Push details into sibling files (`reference.md`, `examples.md`, `scripts/*`) and link them one level deep.
4. Run `ReadLints` on the new files and walk the summary checklist from the `create-skill` skill before finishing.

## Hard rules

- **Never** write into `~/.cursor/skills-cursor/` — that path is reserved for Cursor's built-in skills.
- Use POSIX-style paths inside skill content (`scripts/helper.py`, not `scripts\helper.py`).
- If this repo (easecity-clean2) is the target, align naming and tone with existing entries in `.cursor/skills/` and `.agents/skills/`.
