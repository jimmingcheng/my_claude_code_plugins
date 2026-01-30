#!/bin/bash
# Ping Me - TTS Notification Script
# Uses ElevenLabs API to generate and play TTS audio on macOS

set -e

# Default values
MESSAGE="Notification"
VOICE_ID="${TTS_VOICE_ID:-Xb7hH8MSUJpSbSDYk0k2}"
MODEL="${TTS_MODEL:-eleven_turbo_v2_5}"
STABILITY="${TTS_STABILITY:-0.5}"
SIMILARITY_BOOST="${TTS_SIMILARITY_BOOST:-0.75}"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        message=*)
            MESSAGE="${1#message=}"
            shift
            ;;
        *)
            # If no key=value format, treat as message
            MESSAGE="$1"
            shift
            ;;
    esac
done

# Check for API key
if [[ -z "$ELEVENLABS_API_KEY" ]]; then
    echo '{"success":false,"message":"ELEVENLABS_API_KEY environment variable is required"}'
    exit 1
fi

# Check for macOS
if [[ "$(uname)" != "Darwin" ]]; then
    echo '{"success":false,"message":"Audio playback requires macOS"}'
    exit 1
fi

# Create temp file
TEMP_FILE=$(mktemp /tmp/tts_XXXXXX.mp3)

# Cleanup function
cleanup() {
    # Wait a bit for audio to finish, then delete
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
HTTP_CODE=$(curl -s -w "%{http_code}" -o "$TEMP_FILE" \
    -X POST \
    -H "Accept: audio/mpeg" \
    -H "Content-Type: application/json" \
    -H "xi-api-key: $ELEVENLABS_API_KEY" \
    -d "$JSON_PAYLOAD" \
    "https://api.elevenlabs.io/v1/text-to-speech/$VOICE_ID")

if [[ "$HTTP_CODE" != "200" ]]; then
    echo "{\"success\":false,\"message\":\"ElevenLabs API error: HTTP $HTTP_CODE\"}"
    exit 1
fi

# Check if file has content
if [[ ! -s "$TEMP_FILE" ]]; then
    echo '{"success":false,"message":"Received empty audio response"}'
    exit 1
fi

# Play audio in background (detached)
afplay "$TEMP_FILE" &
disown

echo "{\"success\":true,\"message\":\"TTS notification played: \\\"$MESSAGE\\\"\"}"
