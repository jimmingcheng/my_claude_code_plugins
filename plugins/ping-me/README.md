# Ping Me - TTS Notification Plugin for Claude Code

A Claude Code plugin that provides Text-to-Speech notifications using the ElevenLabs API.

## Features

- **Permission Request Alerts**: Automatically plays "Permission needed" when Claude shows a permission dialog
- **On-Demand Notifications**: Claude can invoke `/ping-me` skill for custom messages
- **ElevenLabs Integration**: High-quality speech synthesis
- **Self-Contained**: Bash scripts with no dependencies beyond curl and afplay

## Requirements

- **macOS**: Requires `afplay` for audio playback
- **curl**: For API requests (pre-installed on macOS)
- **ElevenLabs API Key**: Required for TTS service

## Installation

1. **Clone or download** this plugin to your Claude Code plugins directory
2. **Configure environment**:
   ```bash
   cp plugins/ping-me/.env.example plugins/ping-me/.env
   # Edit .env and add your ElevenLabs API key
   ```

## Configuration

Create a `.env` file in the plugin directory:

```bash
# Required
ELEVENLABS_API_KEY=your_api_key_here

# Optional
TTS_VOICE_ID=Xb7hH8MSUJpSbSDYk0k2  # Rachel voice (default)
TTS_MODEL=eleven_turbo_v2_5
```

Get your API key from: https://elevenlabs.io/app/settings/api-keys

## Usage

### Automatic Permission Notifications

Once installed, the plugin automatically plays a TTS notification whenever Claude Code shows a permission dialog. This helps you know when Claude needs your attention.

### On-Demand Skill

Claude can also invoke the `/ping-me` skill directly:

```bash
/ping-me message="Task completed successfully"
```

## File Structure

```
plugins/ping-me/
├── .claude-plugin/
│   └── plugin.json           # Plugin metadata
├── hooks/
│   ├── hooks.json            # Hook configuration
│   └── permission-notify.sh  # Permission notification script
├── skills/
│   └── ping-me/
│       ├── SKILL.md          # Skill definition
│       └── scripts/
│           └── notify.sh     # TTS notification script
├── .env.example              # Environment template
└── README.md                 # This file
```

## Troubleshooting

1. **No audio playback**: Ensure you're on macOS with `afplay` available
2. **API errors**: Verify your ElevenLabs API key is correct and has credits
3. **Hook not firing**: Restart Claude Code to load hook changes

## License

MIT License

## Credits

- Built for Claude Code by Jimming Cheng
- Powered by ElevenLabs TTS API
