#!/bin/bash
# Permission Request Notification Hook
# Plays a TTS notification when Claude Code shows a permission dialog

# Check for API key (set via ~/.claude/settings.json env)
if [[ -z "$ELEVENLABS_API_KEY" ]]; then
    exit 0  # Silently skip if no API key
fi

# Check for macOS
if [[ "$(uname)" != "Darwin" ]]; then
    exit 0
fi

# Consume stdin (hook input) - not used but must be read
cat > /dev/null

MESSAGE="Input needed"

# Default settings
VOICE_ID="${TTS_VOICE_ID:-Xb7hH8MSUJpSbSDYk0k2}"
MODEL="${TTS_MODEL:-eleven_turbo_v2_5}"
STABILITY="${TTS_STABILITY:-0.5}"
SIMILARITY_BOOST="${TTS_SIMILARITY_BOOST:-0.75}"

# Create temp file (macOS mktemp doesn't support extensions in template)
TEMP_DIR=$(mktemp -d)
TEMP_FILE="$TEMP_DIR/tts.mp3"

# Cleanup function
cleanup() {
    (sleep 20 && rm -rf "$TEMP_DIR") &
}
trap cleanup EXIT

# Build JSON payload
JSON_PAYLOAD=$(cat <<EOF
{
    "text": "$MESSAGE",
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
