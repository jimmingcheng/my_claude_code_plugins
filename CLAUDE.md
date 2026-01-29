# Claude Code Skills - Development Notes

## Skill Structure

This repository contains Claude Code skills organized according to the official [Claude Code Skills documentation](https://code.claude.com/docs/en/skills).

### Current Skills

- **ping-me**: TTS notification skill using ElevenLabs API (`.claude/skills/ping-me/`)

## Skill Development Guidelines

### Proper Skill Structure

Claude Code skills should follow the standard structure:

```
~/.claude/skills/skill-name/
├── SKILL.md           # Main skill definition (required)
├── supporting files   # Optional: scripts, templates, etc.
└── README.md          # Optional: documentation
```

### SKILL.md Format

Each skill needs a `SKILL.md` file with:

1. **YAML frontmatter** between `---` markers with:
   - `name`: skill name (becomes `/skill-name` command)
   - `description`: what the skill does (helps Claude decide when to use it)
   - `disable-model-invocation`: set to `true` for manual-only skills
   - Other optional fields: `argument-hint`, `allowed-tools`, etc.

2. **Markdown content** with instructions for Claude

### Best Practices

- **Prefer skills over complex plugins** for Claude Code extensions
- **Use on-demand skills** (`disable-model-invocation: true`) for actions with side effects
- **Keep skills focused** on a single, clear purpose
- **Include supporting files** in the skill directory for scripts or templates
- **Follow the Agent Skills standard** (https://agentskills.io) for portability

## Git Workflow

### Simple Version Management

- Skills don't require complex versioning like plugins
- Update skill content directly in `SKILL.md`
- Use git to track changes and maintain history
- No need for marketplace.json or plugin.json files

## Deprecated Approach

The complex plugin structure with `.claude-plugin/`, `marketplace.json`, and build systems was the old approach. The new approach uses simple `SKILL.md` files as documented at https://code.claude.com/docs/en/skills.