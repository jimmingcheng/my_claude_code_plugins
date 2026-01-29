# Claude Code Plugins - Development Notes

## Git Workflow Reminders

### Before `git push`:
⚠️ **IMPORTANT**: Always check whether the version number in `package.json` needs to be bumped first before pushing changes.

- Check each plugin's `package.json` version number
- Update version according to semantic versioning (semver):
  - **Patch** (x.x.X): Bug fixes, minor improvements
  - **Minor** (x.X.x): New features, backwards-compatible changes
  - **Major** (X.x.x): Breaking changes, major feature overhauls
- Update the corresponding version in `.claude-plugin/marketplace.json` to match
- Commit version changes before pushing

### Plugin Structure
- Each plugin should have its own `package.json` with appropriate version
- Marketplace entry in `.claude-plugin/marketplace.json` should reference the same version
- Keep versions in sync between plugin and marketplace entry

## Development Guidelines

### Plugin Types
- **Skills**: On-demand functionality (e.g., `/ping-me` command)
- **Hooks**: Automatic functionality triggered by events (use sparingly)

### Best Practices
- Prefer on-demand skills over automatic hooks for better user control
- Keep plugin dependencies minimal and up-to-date
- Include comprehensive README.md for each plugin
- Use TypeScript for better type safety and development experience