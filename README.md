# My Claude Code Plugins

A personal collection of Claude Code plugins.

## Plugins

### ping-me

TTS notification plugin using the ElevenLabs API.

**Features:**
- Plays "Input needed" audio alert when permission dialogs appear
- Ask Claude to ping you during conversation (e.g., "When you're done with this task, ping me")

**Requirements:**
- macOS

**Optional:**
- ElevenLabs API Key (for premium voices; falls back to macOS `say` if not set)

**Setup:**

Add your API key to `~/.claude/settings.json`:
```json
{
  "env": {
    "ELEVENLABS_API_KEY": "your_key"
  }
}
```

Get a key: https://elevenlabs.io/app/settings/api-keys

### iterm2-tab-title

Automatically updates your iTerm2 tab title to show what Claude Code is doing.

**Features:**
- Shows your prompt text when Claude is working
- Shows "idle" with project directory when Claude finishes
- Shows notification message when Claude needs input

**Requirements:**
- iTerm2 (or any terminal supporting OSC escape sequences)
- `jq` (for parsing hook input)

## License

MIT
