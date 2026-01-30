# Ping Me - TTS Notification Plugin for Claude Code

A Claude Code plugin that provides Text-to-Speech notifications using the ElevenLabs API.

## Features

- **Permission Request Alerts**: Automatically speaks Claude's description of what it's doing when a permission dialog appears
- **On-Demand Notifications**: Claude can invoke `/ping-me` skill for custom messages

## Requirements

- macOS (requires `afplay` for audio playback)
- jq (install via `brew install jq`)
- ElevenLabs API Key

## Installation

1. Install the plugin via Claude Code Plugin Manager or clone to your plugins directory
2. Add your ElevenLabs API key to `~/.claude/settings.json`:
   ```json
   {
     "env": {
       "ELEVENLABS_API_KEY": "your_api_key_here"
     }
   }
   ```

Get your API key from: https://elevenlabs.io/app/settings/api-keys

## Usage

The plugin automatically plays TTS when Claude shows a permission dialog (e.g., "Install package dependencies").

You can also invoke it directly:
```
/ping-me message="Task completed"
```

## Troubleshooting

- **No audio**: Ensure `afplay` is available (macOS only)
- **API errors**: Check your ElevenLabs API key and credits
- **Hook not firing**: Restart Claude Code
