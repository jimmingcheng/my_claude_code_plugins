# Ping Me - Claude Code Skill

A Claude Code skill that provides on-demand Text-to-Speech notifications using ElevenLabs API.

## Quick Start

1. **Copy to personal skills**: `cp -r .claude/skills/ping-me ~/.claude/skills/`
2. **Install dependencies**: `cd ~/.claude/skills/ping-me && npm install`
3. **Configure API key**: Create `.env` file with `ELEVENLABS_API_KEY=your_key_here`
4. **Use the skill**: `/ping-me message="Hello world"`

## What This Skill Does

- Generates high-quality speech from text using ElevenLabs API
- Plays audio notifications on macOS using `afplay`
- Supports custom messages and contextual notifications
- Handles cleanup of temporary audio files

## Usage Examples

```bash
/ping-me message="Build completed successfully"
/ping-me reason="tests_passed"
/ping-me  # Default notification
```

## Requirements

- macOS (for audio playback)
- Node.js 16.0.0+
- ElevenLabs API key

For detailed documentation, see `SKILL.md`.