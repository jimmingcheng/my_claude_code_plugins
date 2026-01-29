/**
 * TypeScript interfaces for TTS Notification Hook
 */

/**
 * Input received from Claude Code hook system
 */
export interface HookInput {
  tool_name: string;
  tool_result: any;
  session_id: string;
  timestamp?: string;
  error?: string;
}

/**
 * TTS Configuration settings
 */
export interface TTSConfig {
  apiKey: string;
  voiceId: string;
  model: string;
  enabled: boolean;
  skipTools: string[];
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
 * Tool notification message configuration
 */
export interface ToolMessage {
  [toolName: string]: string;
}

/**
 * Plugin configuration options
 */
export interface PluginConfig extends TTSConfig {
  customMessages?: ToolMessage;
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