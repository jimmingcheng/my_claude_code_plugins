# Claude Code Plugin Marketplace

A community marketplace for Claude Code plugins.

## Project Structure

```
my_claude_code_plugins/
├── .claude-plugin/
│   └── marketplace.json     # Marketplace configuration listing available plugins
├── plugins/
│   └── ping-me/             # TTS notification plugin
│       ├── .claude-plugin/
│       │   └── plugin.json  # Plugin metadata
│       ├── hooks/           # Claude Code hooks
│       ├── skills/          # Claude Code skills
│       └── README.md        # Plugin documentation
├── CLAUDE.md                # Development notes
└── README.md
```

## Available Plugins

### ping-me

On-demand notification skill for Claude Code with TTS support using ElevenLabs API.

See [plugins/ping-me/README.md](plugins/ping-me/README.md) for details.

## Adding Plugins

To add a plugin to this marketplace:

1. Create a directory under `plugins/` with your plugin name
2. Include a `.claude-plugin/plugin.json` with metadata:
   ```json
   {
     "name": "your-plugin-name",
     "description": "Plugin description",
     "version": "1.0.0",
     "author": {
       "name": "Your Name",
       "email": "your@email.com"
     }
   }
   ```
3. Add your plugin to `.claude-plugin/marketplace.json`
4. Include a README.md documenting your plugin

## License

MIT
