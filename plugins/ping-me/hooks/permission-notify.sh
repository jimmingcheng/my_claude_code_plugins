#!/bin/bash
# Permission Request Notification Hook
# Plays a TTS notification when Claude Code shows a permission dialog

# Load .env from plugin root if it exists
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_ROOT="$(dirname "$SCRIPT_DIR")"

if [[ -f "$PLUGIN_ROOT/.env" ]]; then
    source "$PLUGIN_ROOT/.env"
fi

# Check for API key
if [[ -z "$ELEVENLABS_API_KEY" ]]; then
    exit 0  # Silently skip if no API key
fi

# Check for macOS
if [[ "$(uname)" != "Darwin" ]]; then
    exit 0
fi

# Default settings
MESSAGE="Permission needed"
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
