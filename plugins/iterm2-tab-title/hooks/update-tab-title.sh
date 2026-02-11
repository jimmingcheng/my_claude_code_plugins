#!/bin/bash
# iTerm2 Tab Title Hook
# Updates tab title based on Claude Code lifecycle events.

# Read hook JSON input from stdin
INPUT=$(cat)
EVENT=$(echo "$INPUT" | jq -r '.hook_event_name // empty')

# Set iTerm2 tab title via OSC escape sequence.
# Must write to /dev/tty since stdout is captured by Claude Code.
set_tab_title() {
  printf '\e]1;%s\a' "$1" > /dev/tty 2>/dev/null
}

case "$EVENT" in
  UserPromptSubmit)
    PROMPT=$(echo "$INPUT" | jq -r '.prompt // empty' | head -c 60)
    if [ -n "$PROMPT" ]; then
      set_tab_title "Claude: $PROMPT"
    fi
    ;;
  Stop)
    CWD=$(echo "$INPUT" | jq -r '.cwd // empty')
    DIR=$(basename "$CWD" 2>/dev/null)
    set_tab_title "Claude: idle${DIR:+ ($DIR)}"
    ;;
  Notification)
    MSG=$(echo "$INPUT" | jq -r '.message // "Needs input"' | head -c 40)
    set_tab_title "Claude: $MSG"
    ;;
esac

exit 0
