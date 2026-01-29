# TTS Notification Hook for Claude Code

A Claude Code plugin that provides Text-to-Speech notifications for tool completions using the ElevenLabs API. Get audible feedback when Claude finishes executing commands, making it easier to stay informed about task progress.

## Features

- **Real-time TTS Notifications**: Get spoken notifications when Claude Code tools complete
- **ElevenLabs Integration**: High-quality speech synthesis using ElevenLabs API
- **Configurable Voice**: Uses Rachel voice by default (matches original Python implementation)
- **Smart Filtering**: Skip notifications for frequent, low-value tools like `Read` and `Glob`
- **Background Processing**: Non-blocking audio generation and playback
- **Auto Cleanup**: Automatic cleanup of temporary audio files
- **Error Resilience**: Graceful error handling that never interrupts Claude's workflow

## Requirements

- **macOS**: This plugin requires macOS for `afplay` audio support
- **Node.js**: Version 16.0.0 or higher
- **ElevenLabs API Key**: Required for TTS service

## Installation

1. **Clone or download** this plugin to your Claude Code plugins directory
2. **Install dependencies**:
   ```bash
   cd plugins/tts-notification-hook
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

| Variable | Default | Description |
|----------|---------|-------------|
| `TTS_VOICE_ID` | `Xb7hH8MSUJpSbSDYk0k2` | ElevenLabs voice ID (Rachel) |
| `TTS_MODEL` | `eleven_turbo_v2_5` | ElevenLabs TTS model |
| `TTS_ENABLED` | `true` | Enable/disable notifications |
| `TTS_SKIP_TOOLS` | `Read,Glob` | Tools to skip (comma-separated) |
| `TTS_STABILITY` | `0.5` | Voice stability (0-1) |
| `TTS_SIMILARITY_BOOST` | `0.75` | Voice similarity boost (0-1) |
| `TTS_TIMEOUT` | `10000` | Request timeout (ms) |
| `TTS_MAX_RETRIES` | `2` | Maximum retry attempts |
| `TTS_CLEANUP` | `true` | Auto-cleanup temp files |

### Custom Messages

You can customize notification messages for specific tools:

```bash
TTS_CUSTOM_MESSAGES={"Write":"File saved","Edit":"Changes applied","Bash":"Command finished"}
```

## Usage

Once installed and configured, the plugin automatically provides TTS notifications when Claude Code tools complete. No manual intervention required.

### Common Tool Notifications

- **Write**: "File written successfully"
- **Edit**: "File edited successfully"
- **Bash**: "Command executed"
- **Grep**: "Search completed"
- **Task**: "Task completed"
- And more...

### Filtering Tools

By default, frequent tools like `Read` and `Glob` are skipped to avoid notification overload. You can customize this behavior:

```bash
# Skip no tools
TTS_SKIP_TOOLS=

# Skip specific tools
TTS_SKIP_TOOLS=Read,Glob,Grep

# Skip all tools (disable)
TTS_SKIP_TOOLS=*
```

## Development

### Build Commands

```bash
# Build once
npm run build

# Watch for changes
npm run dev

# Clean build artifacts
npm run clean

# Test hook execution
npm run test
```

### Project Structure

```
plugins/tts-notification-hook/
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── .env.example              # Environment template
├── README.md                 # This file
├── hooks/
│   └── hooks.json            # Claude Code hook configuration
├── src/                      # TypeScript source files
│   ├── post-tool-use.ts      # Main hook entry point
│   ├── tts-service.ts        # ElevenLabs API integration
│   ├── audio-player.ts       # macOS audio playback
│   ├── config.ts             # Configuration management
│   ├── types.ts              # TypeScript interfaces
│   └── utils.ts              # Helper functions
├── dist/                     # Compiled JavaScript
└── temp/                     # Temporary audio files
```

### Architecture

1. **Hook Integration**: Claude Code calls the compiled `dist/post-tool-use.js` after each tool completion
2. **TTS Generation**: The hook uses ElevenLabs API to generate speech from notification text
3. **Audio Playback**: Generated audio is played using macOS `afplay` command
4. **Background Processing**: All TTS and audio operations run in background to not block Claude
5. **Error Handling**: Comprehensive error handling ensures Claude's workflow is never interrupted

## Troubleshooting

### No Audio Playback

- **Check macOS**: This plugin only works on macOS
- **Test afplay**: Run `afplay /System/Library/Sounds/Ping.aiff` to test audio
- **Check volume**: Ensure system volume is not muted

### TTS Generation Fails

- **Verify API Key**: Ensure your ElevenLabs API key is valid
- **Check Connectivity**: Verify internet connection to ElevenLabs API
- **Review Logs**: Check console output for error messages

### Hook Not Triggering

- **Check Installation**: Ensure plugin is properly installed and built
- **Verify Configuration**: Check that `hooks.json` is properly formatted
- **Review Claude Code Settings**: Ensure hooks are enabled in Claude Code

### Performance Issues

- **Skip Frequent Tools**: Add tools like `Read,Glob,Grep` to `TTS_SKIP_TOOLS`
- **Reduce Quality**: Lower `TTS_STABILITY` and `TTS_SIMILARITY_BOOST` values
- **Enable Cleanup**: Ensure `TTS_CLEANUP=true` to prevent temp file buildup

## API Costs

This plugin uses the ElevenLabs API which charges per character. Typical usage:
- ~10-30 characters per notification
- ~100-500 notifications per hour (depending on usage)
- Consider using `TTS_SKIP_TOOLS` to reduce API costs

## Compatibility

- **Claude Code**: All versions with hook support
- **Platform**: macOS only (requires `afplay`)
- **Node.js**: 16.0.0 or higher
- **ElevenLabs API**: Current API version

## License

MIT License - see package.json for details.

## Support

For issues, feature requests, or questions:
1. Check the troubleshooting section above
2. Review the logs for error messages
3. Create an issue in the plugin repository

## Migration from Python Version

This Node.js plugin is a direct replacement for the Python `claude_code_tts` tool with the same functionality:
- Same voice (Rachel) and model settings
- Same audio quality configuration
- Same `afplay` integration
- Improved integration with Claude Code hook system
- Reduced dependencies (no Python packages required)