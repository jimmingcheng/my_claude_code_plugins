# Claude Code Plugins - Development Notes

## Git Workflow

### Deploying

When asked to **deploy**, do the following:

1. Bump the `version` field in the relevant `plugins/<plugin-name>/.claude-plugin/plugin.json`
2. Commit the changes
3. Push to the remote

Claude Code Plugin Manager uses the `version` field in `plugin.json` to detect available updates.