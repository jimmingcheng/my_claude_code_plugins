---
name: ping-me
description: Generate a TTS notification with contextual message using ElevenLabs API
argument-hint: [message="text"] [reason="context"]
disable-model-invocation: false
user-invocable: false
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
- **Pre-compiled artifacts**: Ready for instant execution without build delays

## Configuration

Ensure you have an `.env` file in the plugin directory with:

```bash
ELEVENLABS_API_KEY=your_api_key_here
TTS_ENABLED=true
```

## Execution

When invoked, execute the TTS notification script from the plugin directory:

```bash
cd "${CLAUDE_PLUGIN_ROOT}" && node dist/ping-me.js $ARGUMENTS
```

The script will parse arguments in the format `message="text"` or `reason="context"`.

## Plugin Integration

This skill is part of the ping-me plugin and uses the compiled TypeScript modules:

- `dist/ping-me.js` - Main TTS notification script
- `dist/` - All compiled JavaScript modules
- `src/` - Source TypeScript files for development
- `package.json` - Dependencies for ElevenLabs API integration

The script handles:
- ElevenLabs API integration for speech synthesis
- macOS audio playbook via `afplay`
- Error handling and graceful failures
- Temporary file cleanup
- Contextual message generation