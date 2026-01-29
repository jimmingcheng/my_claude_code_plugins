# Ping Me - TTS Notification Skill for Claude Code

A Claude Code skill that provides on-demand Text-to-Speech notifications using the ElevenLabs API. Claude can invoke the `/ping-me` skill to generate contextual audio notifications when completing significant tasks.

## Features

- **On-Demand Notifications**: Claude invokes `/ping-me` skill when appropriate
- **Contextual Messages**: Generates relevant messages based on task context
- **ElevenLabs Integration**: High-quality speech synthesis using ElevenLabs API
- **Configurable Voice**: Uses Rachel voice by default with customizable settings
- **Background Processing**: Non-blocking audio generation and playbook
- **Auto Cleanup**: Automatic cleanup of temporary audio files
- **Error Resilience**: Graceful error handling with proper skill result reporting

## Requirements

- **macOS**: This skill requires macOS for `afplay` audio support
- **Node.js**: Version 16.0.0 or higher
- **ElevenLabs API Key**: Required for TTS service

## Installation

1. **Clone or download** this plugin to your Claude Code plugins directory
2. **Install dependencies**:
   ```bash
   cd plugins/ping-me
   npm install
   ```
3. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env and add your ElevenLabs API key
   ```
4. **Build the plugin**:
   ```bash
   npm run build
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
TTS_VOICE_ID=Xb7hH8MSUJpSbSDYk0k2  # Rachel voice
TTS_MODEL=eleven_turbo_v2_5

# Enable/disable TTS
TTS_ENABLED=true

# Audio quality settings (0.0 to 1.0)
TTS_STABILITY=0.5
TTS_SIMILARITY_BOOST=0.75

# Timeout and retry settings
TTS_TIMEOUT=10000         # 10 seconds
TTS_MAX_RETRIES=2

# Cleanup settings
TTS_CLEANUP=true          # Auto-delete old audio files
```

## Usage

Claude Code will automatically invoke the `/ping-me` skill when appropriate. The skill supports:

### Direct Messages
```bash
/ping-me message="Task completed successfully"
```

### Contextual Reasons
```bash
/ping-me reason="build_finished"
/ping-me reason="tests_passed"
/ping-me reason="deployment_done"
```

### Predefined Contexts
The skill recognizes common contexts and generates appropriate messages:

- `task_completed` → "Task completed successfully"
- `build_finished` → "Build completed"
- `tests_passed` → "All tests passing"
- `deployment_done` → "Deployment finished"
- `error_fixed` → "Error resolved"
- `analysis_complete` → "Analysis completed"
- `processing_done` → "Processing finished"
- `update_finished` → "Update completed"
- `backup_complete` → "Backup completed"
- `sync_finished` → "Sync completed"

## How It Works

1. Claude determines when a notification would be helpful
2. Claude invokes `/ping-me` with appropriate context or message
3. The skill generates contextual notification text
4. ElevenLabs API converts text to high-quality speech
5. Audio plays through macOS `afplay` in the background
6. Temporary files are automatically cleaned up

## Development

### Build Commands

```bash
npm run build    # Compile TypeScript
npm run dev      # Watch mode for development
npm run clean    # Clean build artifacts and temp files
npm run test     # Test the skill (requires API key)
```

### Testing

Test the skill manually:

```bash
# Test with direct message
node dist/ping-me.js message="Hello world"

# Test with contextual reason
node dist/ping-me.js reason="build_finished"

# Test with no arguments (default notification)
node dist/ping-me.js
```

## File Structure

```
plugins/ping-me/
├── skills/
│   └── skills.json          # Skill definition for Claude Code
├── src/
│   ├── ping-me.ts           # Main skill entry point
│   ├── tts-service.ts       # ElevenLabs API integration
│   ├── audio-player.ts      # macOS audio playback
│   ├── config.ts            # Configuration management
│   ├── utils.ts             # Utility functions
│   └── types.ts             # TypeScript interfaces
├── dist/                    # Compiled JavaScript
├── temp/                    # Temporary audio files
├── package.json             # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── .env.example            # Environment template
└── README.md               # This file
```

## Error Handling

The skill is designed to fail gracefully:

- Missing API key: Clear error message returned
- ElevenLabs API errors: Retry logic with exponential backoff
- Network issues: Timeout and retry handling
- macOS unavailable: Informative error message
- Invalid input: Sanitization and validation

All errors are properly logged and returned as skill results to Claude Code.

## Troubleshooting

### Common Issues

1. **No audio playback**: Ensure you're on macOS with `afplay` available
2. **API errors**: Verify your ElevenLabs API key is correct and has credits
3. **Skill not found**: Ensure the plugin is built (`npm run build`)
4. **Permission errors**: Check file permissions in the plugin directory

### Debug Mode

Enable debug logging:

```bash
NODE_ENV=development node dist/ping-me.js message="test"
# or
DEBUG=1 node dist/ping-me.js message="test"
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and ensure they pass
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Credits

- Built for Claude Code by Jimming Cheng
- Powered by ElevenLabs TTS API
- Converted from TTS notification hook to on-demand skill