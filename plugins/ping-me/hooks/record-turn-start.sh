#!/bin/bash
# Records the timestamp when a user prompt is submitted.
# Used by stop-notify.sh to calculate turn duration.

INPUT=$(cat)
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // empty' 2>/dev/null)

if [[ -n "$SESSION_ID" ]]; then
    echo $(date +%s) > "/tmp/claude-turn-start-${SESSION_ID}"
fi

exit 0
