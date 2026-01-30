#!/bin/bash
# Permission Request Notification Hook
# Plays a TTS notification when Claude Code shows a permission dialog
# Speaks Claude's description of what it's doing

# Check for API key (set via ~/.claude/settings.json env)
if [[ -z "$ELEVENLABS_API_KEY" ]]; then
    exit 0  # Silently skip if no API key
fi

# Check for macOS
if [[ "$(uname)" != "Darwin" ]]; then
    exit 0
fi

# Read hook input JSON from stdin
HOOK_INPUT=$(cat)

# Extract tool name and description
TOOL_NAME=$(echo "$HOOK_INPUT" | jq -r '.tool_name // empty')
DESCRIPTION=$(echo "$HOOK_INPUT" | jq -r '.tool_input.description // empty')

# Build message based on available info
if [[ -n "$DESCRIPTION" ]]; then
    # Use Claude's description directly
    MESSAGE="$DESCRIPTION"
elif [[ "$TOOL_NAME" == "Edit" || "$TOOL_NAME" == "Write" ]]; then
    # For file operations, try to get the filename
    FILE_PATH=$(echo "$HOOK_INPUT" | jq -r '.tool_input.file_path // empty')
    if [[ -n "$FILE_PATH" ]]; then
        FILENAME=$(basename "$FILE_PATH")
        MESSAGE="Permission needed to ${TOOL_NAME,,} $FILENAME"
    else
        MESSAGE="Permission needed for $TOOL_NAME"
    fi
else
    # Fallback to tool name
    MESSAGE="${TOOL_NAME:-Permission needed}"
fi

# Default settings
VOICE_ID="${TTS_VOICE_ID:-Xb7hH8MSUJpSbSDYk0k2}"
MODEL="${TTS_MODEL:-eleven_turbo_v2_5}"
STABILITY="${TTS_STABILITY:-0.5}"
SIMILARITY_BOOST="${TTS_SIMILARITY_BOOST:-0.75}"

# Create temp file
TEMP_FILE=$(mktemp /tmp/tts_XXXXXX.mp3)

# Cleanup function
cleanup() {
    (sleep 20 && rm -f "$TEMP_FILE") &
}
trap cleanup EXIT

# Escape message for JSON (handle quotes and special chars)
ESCAPED_MESSAGE=$(echo "$MESSAGE" | jq -Rs '.')

# Build JSON payload
JSON_PAYLOAD=$(cat <<EOF
{
    "text": $ESCAPED_MESSAGE,
    "model_id": "$MODEL",
    "voice_settings": {
        "stability": $STABILITY,
        "similarity_boost": $SIMILARITY_BOOST
    }
}
EOF
)

# Call ElevenLabs API
curl -s -o "$TEMP_FILE" \
    -X POST \
    -H "Accept: audio/mpeg" \
    -H "Content-Type: application/json" \
    -H "xi-api-key: $ELEVENLABS_API_KEY" \
    -d "$JSON_PAYLOAD" \
    "https://api.elevenlabs.io/v1/text-to-speech/$VOICE_ID" 2>/dev/null

# Play audio in background if file has content
if [[ -s "$TEMP_FILE" ]]; then
    afplay "$TEMP_FILE" &
    disown
fi

exit 0
