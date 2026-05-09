---
name: install-everything-claude-code
description: Installs or refreshes the affaan-m/everything-claude-code skill bundle into this repo using the skills CLI, including non-interactive flags and where files land. Use when the user wants everything-claude-code, skills.sh add flows, or to reproduce the easecity-clean2 skill install.
---

# Install everything-claude-code (skills CLI)

## When to use

- Adding [affaan-m/everything-claude-code](https://github.com/affaan-m/everything-claude-code) to this project
- Re-running a non-interactive install after clone
- Explaining where the CLI writes files for Cursor

## Install (project scope)

From the repository root (`easecity-clean2`):

```bash
npx --yes skills add affaan-m/everything-claude-code -y -a cursor -s "*"
```

- `-y`: skip confirmation prompts (required for automation)
- `-a cursor`: install into Cursor agent paths only
- `-s "*"`: install every skill from the package (183 items; omit or narrow for a subset)

**Shorter equivalent** (all agents, all skills, yes):

```bash
npx --yes skills add affaan-m/everything-claude-code --all
```

Use `--all` only if you intend skills for every supported agent, not just Cursor.

## Outputs

| Artifact | Role |
|----------|------|
| `.agents/skills/<skill-name>/` | Per-skill trees copied for Cursor |
| `skills-lock.json` | Locked source + hash per installed skill |

Interactive default (`npx skills add …` without `-y`) opens a picker; prefer `-y` in scripts and agents.

## After install

Review unfamiliar skills before relying on them; third-party instructions run with normal agent permissions. Update later with:

```bash
npx --yes skills update -p -y
```

(`-p` = project scope; adjust flags per `skills --help`.)
