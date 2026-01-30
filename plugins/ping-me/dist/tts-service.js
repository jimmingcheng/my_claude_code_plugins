"use strict";
/**
 * ElevenLabs TTS Service for Ping Me Skill
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TTSService = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const utils_1 = require("./utils");
class TTSService {
    constructor(config, logger) {
        this.baseUrl = 'https://api.elevenlabs.io/v1';
        this.config = config;
        this.logger = logger;
    }
    /**
     * Generate speech from text using ElevenLabs API
     */
    async generateSpeech(text) {
        if (!this.config.enabled) {
            throw new Error('TTS is disabled');
        }
        if (!text.trim()) {
            throw new Error('Text cannot be empty');
        }
        // Sanitize text for TTS
        const sanitizedText = (0, utils_1.sanitizeTextForTTS)(text, 200);
        this.logger.debug(`Generating speech for text: "${sanitizedText}"`);
        const payload = {
            text: sanitizedText,
            model_id: this.config.model,
            voice_settings: {
                stability: this.config.stability,
                similarity_boost: this.config.similarityBoost
            }
        };
        let lastError = null;
        // Retry logic
        for (let attempt = 1; attempt <= this.config.maxRetries + 1; attempt++) {
            try {
                const audioBuffer = await this.makeElevenLabsRequest(payload);
                const filePath = await this.saveAudioToFile(audioBuffer);
                this.logger.debug(`Speech generated successfully on attempt ${attempt}: ${filePath}`);
                return filePath;
            }
            catch (error) {
                lastError = error;
                this.logger.warn(`TTS attempt ${attempt} failed: ${error}`);
                if (attempt <= this.config.maxRetries) {
                    const delayMs = attempt * 1000; // Progressive delay
                    this.logger.debug(`Retrying in ${delayMs}ms...`);
                    await (0, utils_1.delay)(delayMs);
                }
            }
        }
        throw new Error(`TTS failed after ${this.config.maxRetries + 1} attempts: ${lastError?.message}`);
    }
    /**
     * Make request to ElevenLabs API
     */
    async makeElevenLabsRequest(payload) {
        const url = `${this.baseUrl}/text-to-speech/${this.config.voiceId}`;
        this.logger.debug(`Making request to ElevenLabs: ${url}`);
        const response = await (0, node_fetch_1.default)(url, {
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
            }
            catch {
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
    async saveAudioToFile(audioBuffer) {
        const filePath = (0, utils_1.generateTempFilePath)(this.config.tempDir, 'wav');
        try {
            await fs.promises.writeFile(filePath, audioBuffer);
            this.logger.debug(`Audio saved to: ${filePath}`);
            return filePath;
        }
        catch (error) {
            throw new Error(`Failed to save audio file: ${error}`);
        }
    }
    /**
     * Test TTS service with a simple message
     */
    async testService() {
        try {
            this.logger.info('Testing TTS service...');
            const testText = 'TTS service test successful';
            const filePath = await this.generateSpeech(testText);
            // Check if file exists and has content
            const stats = await fs.promises.stat(filePath);
            const success = stats.size > 0;
            this.logger.info(`TTS test ${success ? 'passed' : 'failed'}: ${filePath} (${stats.size} bytes)`);
            return success;
        }
        catch (error) {
            this.logger.error(`TTS test failed: ${error}`);
            return false;
        }
    }
    /**
     * Get service status and configuration
     */
    getStatus() {
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
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.logger.debug('TTS configuration updated');
    }
    /**
     * Check if API key is valid by making a test request
     */
    async validateApiKey() {
        try {
            const url = `${this.baseUrl}/voices`;
            const response = await (0, node_fetch_1.default)(url, {
                method: 'GET',
                headers: {
                    'xi-api-key': this.config.apiKey
                },
                timeout: 5000
            });
            return response.ok;
        }
        catch (error) {
            this.logger.warn(`API key validation failed: ${error}`);
            return false;
        }
    }
    /**
     * Get available voices from ElevenLabs
     */
    async getAvailableVoices() {
        try {
            const url = `${this.baseUrl}/voices`;
            const response = await (0, node_fetch_1.default)(url, {
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
        }
        catch (error) {
            this.logger.error(`Failed to fetch voices: ${error}`);
            return [];
        }
    }
    /**
     * Cleanup old audio files
     */
    async cleanup() {
        if (!this.config.cleanup) {
            return;
        }
        try {
            const files = await fs.promises.readdir(this.config.tempDir);
            const now = Date.now();
            const maxAge = 3600000; // 1 hour
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
        }
        catch (error) {
            this.logger.warn(`Cleanup failed: ${error}`);
        }
    }
}
exports.TTSService = TTSService;
//# sourceMappingURL=tts-service.js.map