---
name: ping-me
description: Generate a TTS notification with contextual message using ElevenLabs API
argument-hint: [message="text"] [reason="context"]
disable-model-invocation: true
user-invocable: true
allowed-tools: Bash(node *)
---

# Ping Me - TTS Notification Skill

Generate high-quality text-to-speech notifications using ElevenLabs API and play them on macOS.

## Usage

This skill can be invoked with optional arguments:

```bash
/ping-me message="Task completed successfully"
/ping-me reason="build_finished"
/ping-me  # Default notification
```

## Parameters

- `message`: Custom message to speak via TTS (optional)
- `reason`: Context or reason for the notification (optional)

## Contextual Messages

When using the `reason` parameter, the skill recognizes these contexts:

- `task_completed` → "Task completed successfully"
- `build_finished` → "Build completed"
- `tests_passed` → "All tests passing"
- `deployment_done` → "Deployment finished"
- `error_fixed` → "Error resolved"
- `analysis_complete` → "Analysis completed"
- `processing_done` → "Processing finished"

## Requirements

- **macOS**: Required for `afplay` audio support
- **Node.js**: Version 16.0.0 or higher
- **ElevenLabs API Key**: Set in environment variables

## Configuration

Ensure you have an `.env` file in the skill directory with:

```bash
ELEVENLABS_API_KEY=your_api_key_here
TTS_ENABLED=true
```

## Execution

When invoked, execute the TTS notification script from the skill directory:

```bash
cd ~/.claude/skills/ping-me
node dist/ping-me.js $ARGUMENTS
```

The script will parse arguments in the format `message="text"` or `reason="context"`.

## Supporting Files

This skill includes:
- `dist/ping-me.js` - Main TTS notification script (compiled from TypeScript)
- `dist/` - All compiled JavaScript modules and dependencies
- `src/` - Source TypeScript files for development and maintenance
- `package.json` - Dependencies for ElevenLabs API integration
- `package-lock.json` - Locked dependency versions
- `tsconfig.json` - TypeScript compilation configuration
- `.env.example` - Environment configuration template

The script handles:
- ElevenLabs API integration for speech synthesis
- macOS audio playback via `afplay`
- Error handling and graceful failures
- Temporary file cleanup
- Contextual message generation

## Installation

To use this skill:

1. Copy this directory to `~/.claude/skills/ping-me/`
2. Install dependencies: `cd ~/.claude/skills/ping-me && npm install`
3. Create `.env` file with your ElevenLabs API key
4. The skill will be available as `/ping-me` in Claude Code