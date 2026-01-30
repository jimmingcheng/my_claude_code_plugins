"use strict";
/**
 * Utility functions for Ping Me Skill
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
exports.SimpleLogger = void 0;
exports.generateContextualMessage = generateContextualMessage;
exports.ensureDirectoryExists = ensureDirectoryExists;
exports.generateTempFilePath = generateTempFilePath;
exports.cleanupTempFiles = cleanupTempFiles;
exports.sanitizeTextForTTS = sanitizeTextForTTS;
exports.delay = delay;
exports.safeStringify = safeStringify;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Simple logger implementation
 */
class SimpleLogger {
    constructor(prefix = '[Ping-Me]') {
        this.prefix = prefix;
    }
    info(message, ...args) {
        console.log(`${this.prefix} INFO: ${message}`, ...args);
    }
    warn(message, ...args) {
        console.warn(`${this.prefix} WARN: ${message}`, ...args);
    }
    error(message, ...args) {
        console.error(`${this.prefix} ERROR: ${message}`, ...args);
    }
    debug(message, ...args) {
        if (process.env.NODE_ENV === 'development' || process.env.DEBUG) {
            console.log(`${this.prefix} DEBUG: ${message}`, ...args);
        }
    }
}
exports.SimpleLogger = SimpleLogger;
/**
 * Generate contextual notification message based on input
 */
function generateContextualMessage(message, reason) {
    // If a direct message is provided, use it
    if (message && message.trim()) {
        return sanitizeTextForTTS(message.trim());
    }
    // Generate message based on reason/context
    if (reason && reason.trim()) {
        const contextualMessages = {
            'task_completed': 'Task completed successfully',
            'build_finished': 'Build completed',
            'tests_passed': 'All tests passing',
            'deployment_done': 'Deployment finished',
            'error_fixed': 'Error resolved',
            'analysis_complete': 'Analysis completed',
            'processing_done': 'Processing finished',
            'update_finished': 'Update completed',
            'backup_complete': 'Backup completed',
            'sync_finished': 'Sync completed'
        };
        const reasonKey = reason.toLowerCase().replace(/\s+/g, '_');
        if (contextualMessages[reasonKey]) {
            return contextualMessages[reasonKey];
        }
        // If reason doesn't match predefined contexts, use it directly
        return sanitizeTextForTTS(`${reason} completed`);
    }
    // Default fallback message
    return 'Notification';
}
/**
 * Ensure directory exists, create if it doesn't
 */
function ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}
/**
 * Generate unique temporary file path
 */
function generateTempFilePath(tempDir, extension = 'wav') {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const filename = `tts_${timestamp}_${random}.${extension}`;
    return path.join(tempDir, filename);
}
/**
 * Clean up old temporary files
 */
function cleanupTempFiles(tempDir, maxAge = 3600000) {
    try {
        if (!fs.existsSync(tempDir)) {
            return;
        }
        const files = fs.readdirSync(tempDir);
        const now = Date.now();
        files.forEach(file => {
            if (file.startsWith('tts_') && file.endsWith('.wav')) {
                const filePath = path.join(tempDir, file);
                const stats = fs.statSync(filePath);
                if (now - stats.mtime.getTime() > maxAge) {
                    fs.unlinkSync(filePath);
                }
            }
        });
    }
    catch (error) {
        // Silently ignore cleanup errors to not break the skill
    }
}
/**
 * Sanitize text for TTS (remove markdown, limit length)
 */
function sanitizeTextForTTS(text, maxLength = 200) {
    // Remove markdown syntax
    let sanitized = text
        .replace(/```[\s\S]*?```/g, 'code block')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/#{1,6}\s+/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/^\s*[-*+]\s+/gm, '');
    // Remove extra whitespace and newlines
    sanitized = sanitized.replace(/\s+/g, ' ').trim();
    // Truncate if too long
    if (sanitized.length > maxLength) {
        sanitized = sanitized.substring(0, maxLength - 3) + '...';
    }
    return sanitized;
}
/**
 * Delay execution for specified milliseconds
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
/**
 * Safe JSON stringify with error handling
 */
function safeStringify(obj) {
    try {
        return JSON.stringify(obj, null, 2);
    }
    catch (error) {
        return `[Unable to stringify: ${error}]`;
    }
}
//# sourceMappingURL=utils.js.map