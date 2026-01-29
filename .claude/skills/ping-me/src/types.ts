/**
 * TypeScript interfaces for Ping Me Skill
 */

/**
 * Input received from Claude Code skill system
 */
export interface SkillInput {
  message?: string;
  reason?: string;
}

/**
 * Result returned by the skill to Claude Code
 */
export interface SkillResult {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * TTS Configuration settings
 */
export interface TTSConfig {
  apiKey: string;
  voiceId: string;
  model: string;
  enabled: boolean;
  stability: number;
  similarityBoost: number;
  tempDir: string;
}

/**
 * ElevenLabs API request payload
 */
export interface ElevenLabsRequest {
  text: string;
  model_id: string;
  voice_settings: {
    stability: number;
    similarity_boost: number;
  };
}

/**
 * ElevenLabs API response (audio stream)
 */
export interface ElevenLabsResponse {
  audio: Buffer;
  error?: string;
}

/**
 * Audio playback result
 */
export interface AudioPlaybackResult {
  success: boolean;
  error?: string;
  filePath?: string;
}

/**
 * Plugin configuration options
 */
export interface PluginConfig extends TTSConfig {
  timeout: number;
  maxRetries: number;
  cleanup: boolean;
}

/**
 * Logger interface for consistent logging
 */
export interface Logger {
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
  debug(message: string, ...args: any[]): void;
}