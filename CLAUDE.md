# Claude Code Plugins - Development Notes

## Git Workflow

### Before Pushing

**Always bump plugin.json version** before pushing changes to ensure Claude Code Plugin Manager recognizes updates:

```bash
# Update version in plugin.json
vim plugins/plugin-name/.claude-plugin/plugin.json  # version: "1.x.x"

# Commit and push
git add . && git commit -m "Bump version to 1.x.x"
git push
```

Claude Code Plugin Manager uses the `version` field in `plugin.json` to detect available updates.