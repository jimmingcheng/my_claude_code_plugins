/**
 * ElevenLabs TTS Service for Ping Me Skill
 */

import * as fs from 'fs';
import * as path from 'path';
import fetch from 'node-fetch';
import { PluginConfig, ElevenLabsRequest, Logger } from './types';
import { generateTempFilePath, delay, sanitizeTextForTTS } from './utils';

export class TTSService {
  private config: PluginConfig;
  private logger: Logger;
  private readonly baseUrl = 'https://api.elevenlabs.io/v1';

  constructor(config: PluginConfig, logger: Logger) {
    this.config = config;
    this.logger = logger;
  }

  /**
   * Generate speech from text using ElevenLabs API
   */
  async generateSpeech(text: string): Promise<string> {
    if (!this.config.enabled) {
      throw new Error('TTS is disabled');
    }

    if (!text.trim()) {
      throw new Error('Text cannot be empty');
    }

    // Sanitize text for TTS
    const sanitizedText = sanitizeTextForTTS(text, 200);

    this.logger.debug(`Generating speech for text: "${sanitizedText}"`);

    const payload: ElevenLabsRequest = {
      text: sanitizedText,
      model_id: this.config.model,
      voice_settings: {
        stability: this.config.stability,
        similarity_boost: this.config.similarityBoost
      }
    };

    let lastError: Error | null = null;

    // Retry logic
    for (let attempt = 1; attempt <= this.config.maxRetries + 1; attempt++) {
      try {
        const audioBuffer = await this.makeElevenLabsRequest(payload);
        const filePath = await this.saveAudioToFile(audioBuffer);

        this.logger.debug(`Speech generated successfully on attempt ${attempt}: ${filePath}`);
        return filePath;
      } catch (error) {
        lastError = error as Error;
        this.logger.warn(`TTS attempt ${attempt} failed: ${error}`);

        if (attempt <= this.config.maxRetries) {
          const delayMs = attempt * 1000; // Progressive delay
          this.logger.debug(`Retrying in ${delayMs}ms...`);
          await delay(delayMs);
        }
      }
    }

    throw new Error(`TTS failed after ${this.config.maxRetries + 1} attempts: ${lastError?.message}`);
  }

  /**
   * Make request to ElevenLabs API
   */
  private async makeElevenLabsRequest(payload: ElevenLabsRequest): Promise<Buffer> {
    const url = `${this.baseUrl}/text-to-speech/${this.config.voiceId}`;

    this.logger.debug(`Making request to ElevenLabs: ${url}`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': this.config.apiKey
      },
      body: JSON.stringify(payload),
      timeout: this.config.timeout
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

      try {
        const errorData = await response.json();
        if (errorData.detail) {
          errorMessage = errorData.detail.message || errorData.detail;
        }
      } catch {
        // Ignore JSON parse errors, use HTTP status
      }

      throw new Error(`ElevenLabs API error: ${errorMessage}`);
    }

    const audioBuffer = await response.buffer();

    if (audioBuffer.length === 0) {
      throw new Error('Received empty audio response from ElevenLabs');
    }

    this.logger.debug(`Received audio buffer of ${audioBuffer.length} bytes`);
    return audioBuffer;
  }

  /**
   * Save audio buffer to temporary file
   */
  private async saveAudioToFile(audioBuffer: Buffer): Promise<string> {
    const filePath = generateTempFilePath(this.config.tempDir, 'wav');

    try {
      await fs.promises.writeFile(filePath, audioBuffer);
      this.logger.debug(`Audio saved to: ${filePath}`);
      return filePath;
    } catch (error) {
      throw new Error(`Failed to save audio file: ${error}`);
    }
  }

  /**
   * Test TTS service with a simple message
   */
  async testService(): Promise<boolean> {
    try {
      this.logger.info('Testing TTS service...');
      const testText = 'TTS service test successful';
      const filePath = await this.generateSpeech(testText);

      // Check if file exists and has content
      const stats = await fs.promises.stat(filePath);
      const success = stats.size > 0;

      this.logger.info(`TTS test ${success ? 'passed' : 'failed'}: ${filePath} (${stats.size} bytes)`);

      return success;
    } catch (error) {
      this.logger.error(`TTS test failed: ${error}`);
      return false;
    }
  }

  /**
   * Get service status and configuration
   */
  getStatus(): Record<string, any> {
    return {
      enabled: this.config.enabled,
      voiceId: this.config.voiceId,
      model: this.config.model,
      apiKeyConfigured: !!this.config.apiKey,
      tempDir: this.config.tempDir,
      settings: {
        stability: this.config.stability,
        similarityBoost: this.config.similarityBoost,
        timeout: this.config.timeout,
        maxRetries: this.config.maxRetries
      }
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<PluginConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.logger.debug('TTS configuration updated');
  }

  /**
   * Check if API key is valid by making a test request
   */
  async validateApiKey(): Promise<boolean> {
    try {
      const url = `${this.baseUrl}/voices`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'xi-api-key': this.config.apiKey
        },
        timeout: 5000
      });

      return response.ok;
    } catch (error) {
      this.logger.warn(`API key validation failed: ${error}`);
      return false;
    }
  }

  /**
   * Get available voices from ElevenLabs
   */
  async getAvailableVoices(): Promise<any[]> {
    try {
      const url = `${this.baseUrl}/voices`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'xi-api-key': this.config.apiKey
        },
        timeout: 10000
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.voices || [];
    } catch (error) {
      this.logger.error(`Failed to fetch voices: ${error}`);
      return [];
    }
  }

  /**
   * Cleanup old audio files
   */
  async cleanup(): Promise<void> {
    if (!this.config.cleanup) {
      return;
    }

    try {
      const files = await fs.promises.readdir(this.config.tempDir);
      const now = Date.now();
      const maxAge = 20000; // 20 seconds

      for (const file of files) {
        if (file.startsWith('tts_') && file.endsWith('.wav')) {
          const filePath = path.join(this.config.tempDir, file);
          const stats = await fs.promises.stat(filePath);

          if (now - stats.mtime.getTime() > maxAge) {
            await fs.promises.unlink(filePath);
            this.logger.debug(`Cleaned up old audio file: ${file}`);
          }
        }
      }
    } catch (error) {
      this.logger.warn(`Cleanup failed: ${error}`);
    }
  }
}