#!/bin/bash
# Stop Notification Hook
# Plays a TTS summary when Claude finishes a long turn.
# Uses the OpenAI API (GPT-4o-mini) to generate a one-sentence summary from the transcript.

if [[ "$(uname)" != "Darwin" ]]; then
    exit 0
fi

INPUT=$(cat)
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // empty' 2>/dev/null)
TRANSCRIPT_PATH=$(echo "$INPUT" | jq -r '.transcript_path // empty' 2>/dev/null)
STOP_HOOK_ACTIVE=$(echo "$INPUT" | jq -r '.stop_hook_active // false' 2>/dev/null)

# Don't notify on re-stop (prevents loops if another Stop hook blocks)
if [[ "$STOP_HOOK_ACTIVE" == "true" ]]; then
    exit 0
fi

# Check elapsed time since the user submitted their prompt
THRESHOLD="${PING_ME_THRESHOLD:-30}"
START_FILE="/tmp/claude-turn-start-${SESSION_ID}"

if [[ -f "$START_FILE" ]]; then
    START=$(cat "$START_FILE")
    NOW=$(date +%s)
    ELAPSED=$((NOW - START))
    if [[ $ELAPSED -lt $THRESHOLD ]]; then
        exit 0
    fi
else
    # No start time recorded — skip
    exit 0
fi

# Generate summary message
MESSAGE="Task complete"

if [[ -n "$OPENAI_API_KEY" && -n "$TRANSCRIPT_PATH" && -f "$TRANSCRIPT_PATH" ]]; then
    TRANSCRIPT_TAIL=$(tail -c 4000 "$TRANSCRIPT_PATH" 2>/dev/null || echo "")

    if [[ -n "$TRANSCRIPT_TAIL" ]]; then
        SYSTEM_PROMPT="You are generating a short spoken TTS notification for a developer. Summarize what was just accomplished in this Claude Code session in one short sentence (under 15 words). Be specific about what was done (e.g. 'Fixed the auth bug in login handler' not 'Completed the task'). Output only the plain sentence — no quotes, no punctuation styling, no markdown."

        API_PAYLOAD=$(jq -n \
            --arg system "$SYSTEM_PROMPT" \
            --arg transcript "$TRANSCRIPT_TAIL" \
            '{
                model: "gpt-4o-mini",
                max_tokens: 100,
                messages: [
                    { role: "system", content: $system },
                    { role: "user", content: ("End of session transcript:\n" + $transcript) }
                ]
            }')

        SUMMARY_RESPONSE=$(curl -s --max-time 10 \
            "https://api.openai.com/v1/chat/completions" \
            -H "Authorization: Bearer $OPENAI_API_KEY" \
            -H "Content-Type: application/json" \
            -d "$API_PAYLOAD" 2>/dev/null)

        SUMMARY=$(echo "$SUMMARY_RESPONSE" | jq -r '.choices[0].message.content // empty' 2>/dev/null)

        if [[ -n "$SUMMARY" ]]; then
            MESSAGE="$SUMMARY"
        fi
    fi
fi

# --- TTS playback ---

SAY_VOICE="${TTS_SAY_VOICE:-Samantha}"
SAY_RATE="${TTS_SAY_RATE:-175}"

if [[ -z "$ELEVENLABS_API_KEY" ]]; then
    say -v "$SAY_VOICE" -r "$SAY_RATE" "$MESSAGE" &
    disown
    exit 0
fi

VOICE_ID="${TTS_VOICE_ID:-Xb7hH8MSUJpSbSDYk0k2}"
MODEL="${TTS_MODEL:-eleven_turbo_v2_5}"
STABILITY="${TTS_STABILITY:-0.5}"
SIMILARITY_BOOST="${TTS_SIMILARITY_BOOST:-0.75}"

TEMP_DIR=$(mktemp -d)
TEMP_FILE="$TEMP_DIR/tts.mp3"

cleanup() {
    (sleep 20 && rm -rf "$TEMP_DIR") &
}
trap cleanup EXIT

JSON_PAYLOAD=$(jq -n \
    --arg text "$MESSAGE" \
    --arg model "$MODEL" \
    --argjson stability "$STABILITY" \
    --argjson similarity "$SIMILARITY_BOOST" \
    '{
        text: $text,
        model_id: $model,
        voice_settings: {
            stability: $stability,
            similarity_boost: $similarity
        }
    }')

curl -s -o "$TEMP_FILE" \
    -X POST \
    -H "Accept: audio/mpeg" \
    -H "Content-Type: application/json" \
    -H "xi-api-key: $ELEVENLABS_API_KEY" \
    -d "$JSON_PAYLOAD" \
    "https://api.elevenlabs.io/v1/text-to-speech/$VOICE_ID" 2>/dev/null

if [[ -s "$TEMP_FILE" ]]; then
    afplay "$TEMP_FILE" &
    disown
fi

exit 0
