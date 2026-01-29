/**
 * Configuration management for TTS Notification Hook
 */

import * as path from 'path';
import * as dotenv from 'dotenv';
import { PluginConfig, ToolMessage } from './types';
import { ensureDirectoryExists } from './utils';

// Load environment variables from .env file
dotenv.config({
  path: path.join(__dirname, '..', '.env')
});

/**
 * Load and validate plugin configuration
 */
export function loadConfig(): PluginConfig {
  // Get plugin root directory
  const pluginRoot = path.join(__dirname, '..');
  const tempDir = path.join(pluginRoot, 'temp');

  // Ensure temp directory exists
  ensureDirectoryExists(tempDir);

  // Parse skip tools from environment variable
  const skipToolsEnv = process.env.TTS_SKIP_TOOLS || '';
  const skipTools = skipToolsEnv ? skipToolsEnv.split(',').map(tool => tool.trim()) : [];

  // Parse custom messages if provided
  let customMessages: ToolMessage | undefined;
  if (process.env.TTS_CUSTOM_MESSAGES) {
    try {
      customMessages = JSON.parse(process.env.TTS_CUSTOM_MESSAGES);
    } catch (error) {
      console.warn('[TTS-Hook] Failed to parse TTS_CUSTOM_MESSAGES, ignoring');
    }
  }

  const config: PluginConfig = {
    // Core TTS settings (matching Python version)
    apiKey: process.env.ELEVENLABS_API_KEY || '',
    voiceId: process.env.TTS_VOICE_ID || 'Xb7hH8MSUJpSbSDYk0k2', // Rachel voice
    model: process.env.TTS_MODEL || 'eleven_turbo_v2_5',
    enabled: process.env.TTS_ENABLED !== 'false',

    // Audio quality settings
    stability: parseFloat(process.env.TTS_STABILITY || '0.5'),
    similarityBoost: parseFloat(process.env.TTS_SIMILARITY_BOOST || '0.75'),

    // Plugin behavior settings
    skipTools: skipTools,
    tempDir: tempDir,
    customMessages: customMessages,
    timeout: parseInt(process.env.TTS_TIMEOUT || '10000', 10),
    maxRetries: parseInt(process.env.TTS_MAX_RETRIES || '2', 10),
    cleanup: process.env.TTS_CLEANUP !== 'false'
  };

  // Validate required settings
  if (!config.apiKey) {
    throw new Error('ELEVENLABS_API_KEY environment variable is required');
  }

  return config;
}

/**
 * Get default configuration values
 */
export function getDefaultConfig(): Partial<PluginConfig> {
  return {
    voiceId: 'Xb7hH8MSUJpSbSDYk0k2', // Rachel voice (same as Python version)
    model: 'eleven_turbo_v2_5',
    enabled: true,
    stability: 0.5,
    similarityBoost: 0.75,
    skipTools: ['Read', 'Glob'], // Skip frequent, low-value tools by default
    timeout: 10000,
    maxRetries: 2,
    cleanup: true
  };
}

/**
 * Validate configuration values
 */
export function validateConfig(config: PluginConfig): string[] {
  const errors: string[] = [];

  if (!config.apiKey) {
    errors.push('API key is required');
  }

  if (!config.voiceId) {
    errors.push('Voice ID is required');
  }

  if (!config.model) {
    errors.push('Model is required');
  }

  if (config.stability < 0 || config.stability > 1) {
    errors.push('Stability must be between 0 and 1');
  }

  if (config.similarityBoost < 0 || config.similarityBoost > 1) {
    errors.push('Similarity boost must be between 0 and 1');
  }

  if (config.timeout < 1000) {
    errors.push('Timeout must be at least 1000ms');
  }

  if (config.maxRetries < 0) {
    errors.push('Max retries must be non-negative');
  }

  return errors;
}

/**
 * Get environment variable example content for .env file
 */
export function getEnvExample(): string {
  return `# TTS Notification Hook Configuration

# Required: ElevenLabs API Key
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# Optional: Voice settings (defaults match Python version)
TTS_VOICE_ID=Xb7hH8MSUJpSbSDYk0k2
TTS_MODEL=eleven_turbo_v2_5

# Optional: Enable/disable TTS
TTS_ENABLED=true

# Optional: Audio quality settings
TTS_STABILITY=0.5
TTS_SIMILARITY_BOOST=0.75

# Optional: Skip notifications for specific tools (comma-separated)
TTS_SKIP_TOOLS=Read,Glob

# Optional: Timeout and retry settings
TTS_TIMEOUT=10000
TTS_MAX_RETRIES=2

# Optional: Enable/disable temp file cleanup
TTS_CLEANUP=true

# Optional: Custom messages per tool (JSON format)
# TTS_CUSTOM_MESSAGES={"Write":"File saved","Edit":"Changes applied"}
`;
}

/**
 * Export singleton config instance
 */
let configInstance: PluginConfig | null = null;

export function getConfig(): PluginConfig {
  if (!configInstance) {
    configInstance = loadConfig();

    const errors = validateConfig(configInstance);
    if (errors.length > 0) {
      throw new Error(`Configuration validation failed: ${errors.join(', ')}`);
    }
  }

  return configInstance;
}

/**
 * Reset config instance (useful for testing)
 */
export function resetConfig(): void {
  configInstance = null;
}