---
name: ping-me
description: Generate a single-sentence TTS notification with contextual message using ElevenLabs API or macOS say
argument-hint: [message="text"]
disable-model-invocation: false
user-invocable: false
allowed-tools: Bash(bash *), Bash(./scripts/*)
---

# Ping Me - TTS Notification Skill

Generate text-to-speech notifications and play them on macOS. Uses ElevenLabs API for premium voices, or falls back to macOS's built-in `say` command for zero-configuration usage.

## Usage

This skill can be invoked with an optional message argument:

```bash
/ping-me message="Task completed successfully"
/ping-me message="Build finished with all tests passing"
/ping-me  # Default notification
```

## Parameters

- `message`: Custom message to speak via TTS (must be a single sentence, maximum one sentence only)

## Message Guidelines

**Important: All messages must be single sentences only.**

- Keep messages concise and focused
- If you have multiple pieces of information, summarize into one sentence
- Example: Instead of "Build completed. Tests passed. Ready for deployment." use "Build completed successfully with all tests passing"

## Requirements

- **macOS**: Required for audio playback

## TTS Backends

### ElevenLabs (Optional - Premium Quality)

Set the API key for high-quality neural voices:

```bash
export ELEVENLABS_API_KEY=your_api_key_here
```

ElevenLabs settings:
- `TTS_VOICE_ID` - ElevenLabs voice ID (default: Rachel)
- `TTS_MODEL` - Model to use (default: eleven_turbo_v2_5)
- `TTS_STABILITY` - Voice stability 0-1 (default: 0.5)
- `TTS_SIMILARITY_BOOST` - Similarity boost 0-1 (default: 0.75)

### macOS `say` (Fallback - No Setup)

When `ELEVENLABS_API_KEY` is not set, the plugin automatically uses macOS's built-in `say` command. No configuration required.

macOS say settings:
- `TTS_SAY_VOICE` - Voice name (default: Samantha). Run `say -v ?` to list available voices.
- `TTS_SAY_RATE` - Words per minute (default: 175)

## Execution

Run the bundled notification script:

```bash
bash ./scripts/notify.sh $ARGUMENTS
```

## Script Details

The bundled `scripts/notify.sh` handles:
- ElevenLabs API integration for speech synthesis
- macOS audio playback via `afplay`
- Error handling and graceful failures
- Automatic temp file cleanup after 20 seconds
