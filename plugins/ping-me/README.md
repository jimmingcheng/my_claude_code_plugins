# Ping Me - TTS Notification Skill for Claude Code

A Claude Code skill that provides on-demand Text-to-Speech notifications using the ElevenLabs API. Claude can invoke the `/ping-me` skill to generate contextual audio notifications when completing significant tasks.

## Features

- **On-Demand Notifications**: Claude invokes `/ping-me` skill when appropriate
- **Contextual Messages**: Generates relevant messages based on task context
- **ElevenLabs Integration**: High-quality speech synthesis using ElevenLabs API
- **Self-Contained**: Single bash script with no dependencies beyond curl and afplay
- **Auto Cleanup**: Automatic cleanup of temporary audio files

## Requirements

- **macOS**: This skill requires macOS for `afplay` audio support
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

### Required Settings

Create a `.env` file in the plugin directory with your ElevenLabs API key:

```bash
ELEVENLABS_API_KEY=your_api_key_here
```

Get your API key from: https://elevenlabs.io/app/settings/api-keys

### Optional Settings

```bash
# Voice settings
TTS_VOICE_ID=Xb7hH8MSUJpSbSDYk0k2  # Rachel voice (default)
TTS_MODEL=eleven_turbo_v2_5

# Enable/disable TTS
TTS_ENABLED=true
```

## Usage

Claude Code will automatically invoke the `/ping-me` skill when appropriate. The skill supports:

### Direct Messages
```bash
/ping-me message="Task completed successfully"
```

## How It Works

1. Claude determines when a notification would be helpful
2. Claude invokes `/ping-me` with appropriate message
3. The script calls ElevenLabs API to convert text to speech
4. Audio plays through macOS `afplay` in the background
5. Temporary files are automatically cleaned up

## File Structure

```
plugins/ping-me/
├── .claude-plugin/
│   └── plugin.json           # Plugin metadata
├── skills/
│   └── ping-me/
│       ├── SKILL.md          # Skill definition
│       └── scripts/
│           └── notify.sh     # TTS notification script
├── .env.example              # Environment template
└── README.md                 # This file
```

## Testing

Test the skill manually:

```bash
cd plugins/ping-me/skills/ping-me && bash ./scripts/notify.sh message="Hello world"
```

## Troubleshooting

### Common Issues

1. **No audio playback**: Ensure you're on macOS with `afplay` available
2. **API errors**: Verify your ElevenLabs API key is correct and has credits
3. **Permission errors**: Check file permissions on notify.sh

## License

MIT License - see LICENSE file for details

## Credits

- Built for Claude Code by Jimming Cheng
- Powered by ElevenLabs TTS API
