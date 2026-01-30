/**
 * ElevenLabs TTS Service for Ping Me Skill
 */
import { PluginConfig, Logger } from './types';
export declare class TTSService {
    private config;
    private logger;
    private readonly baseUrl;
    constructor(config: PluginConfig, logger: Logger);
    /**
     * Generate speech from text using ElevenLabs API
     */
    generateSpeech(text: string): Promise<string>;
    /**
     * Make request to ElevenLabs API
     */
    private makeElevenLabsRequest;
    /**
     * Save audio buffer to temporary file
     */
    private saveAudioToFile;
    /**
     * Test TTS service with a simple message
     */
    testService(): Promise<boolean>;
    /**
     * Get service status and configuration
     */
    getStatus(): Record<string, any>;
    /**
     * Update configuration
     */
    updateConfig(newConfig: Partial<PluginConfig>): void;
    /**
     * Check if API key is valid by making a test request
     */
    validateApiKey(): Promise<boolean>;
    /**
     * Get available voices from ElevenLabs
     */
    getAvailableVoices(): Promise<any[]>;
    /**
     * Cleanup old audio files
     */
    cleanup(): Promise<void>;
}
//# sourceMappingURL=tts-service.d.ts.map