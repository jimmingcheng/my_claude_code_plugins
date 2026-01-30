"use strict";
/**
 * Configuration management for Ping Me Skill
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfig = loadConfig;
exports.getDefaultConfig = getDefaultConfig;
exports.validateConfig = validateConfig;
exports.getEnvExample = getEnvExample;
exports.getConfig = getConfig;
exports.resetConfig = resetConfig;
const path = __importStar(require("path"));
const dotenv = __importStar(require("dotenv"));
const utils_1 = require("./utils");
// Load environment variables from .env file
dotenv.config({
    path: path.join(__dirname, '..', '.env')
});
/**
 * Load and validate plugin configuration
 */
function loadConfig() {
    // Get plugin root directory
    const pluginRoot = path.join(__dirname, '..');
    const tempDir = path.join(pluginRoot, 'temp');
    // Ensure temp directory exists
    (0, utils_1.ensureDirectoryExists)(tempDir);
    const config = {
        // Core TTS settings (matching Python version)
        apiKey: process.env.ELEVENLABS_API_KEY || '',
        voiceId: process.env.TTS_VOICE_ID || 'Xb7hH8MSUJpSbSDYk0k2', // Rachel voice
        model: process.env.TTS_MODEL || 'eleven_turbo_v2_5',
        enabled: process.env.TTS_ENABLED !== 'false',
        // Audio quality settings
        stability: parseFloat(process.env.TTS_STABILITY || '0.5'),
        similarityBoost: parseFloat(process.env.TTS_SIMILARITY_BOOST || '0.75'),
        // Plugin behavior settings
        tempDir: tempDir,
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
function getDefaultConfig() {
    return {
        voiceId: 'Xb7hH8MSUJpSbSDYk0k2', // Rachel voice (same as Python version)
        model: 'eleven_turbo_v2_5',
        enabled: true,
        stability: 0.5,
        similarityBoost: 0.75,
        timeout: 10000,
        maxRetries: 2,
        cleanup: true
    };
}
/**
 * Validate configuration values
 */
function validateConfig(config) {
    const errors = [];
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
function getEnvExample() {
    return `# Ping Me Skill Configuration

# Required: ElevenLabs API Key
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# Optional: Voice settings
TTS_VOICE_ID=Xb7hH8MSUJpSbSDYk0k2
TTS_MODEL=eleven_turbo_v2_5

# Optional: Enable/disable TTS
TTS_ENABLED=true

# Optional: Audio quality settings
TTS_STABILITY=0.5
TTS_SIMILARITY_BOOST=0.75

# Optional: Timeout and retry settings
TTS_TIMEOUT=10000
TTS_MAX_RETRIES=2

# Optional: Enable/disable temp file cleanup
TTS_CLEANUP=true
`;
}
/**
 * Export singleton config instance
 */
let configInstance = null;
function getConfig() {
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
function resetConfig() {
    configInstance = null;
}
//# sourceMappingURL=config.js.map