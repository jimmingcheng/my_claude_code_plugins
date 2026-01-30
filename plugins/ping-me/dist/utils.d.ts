/**
 * Utility functions for Ping Me Skill
 */
import { Logger } from './types';
/**
 * Simple logger implementation
 */
export declare class SimpleLogger implements Logger {
    private prefix;
    constructor(prefix?: string);
    info(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    error(message: string, ...args: any[]): void;
    debug(message: string, ...args: any[]): void;
}
/**
 * Generate contextual notification message based on input
 */
export declare function generateContextualMessage(message?: string, reason?: string): string;
/**
 * Ensure directory exists, create if it doesn't
 */
export declare function ensureDirectoryExists(dirPath: string): void;
/**
 * Generate unique temporary file path
 */
export declare function generateTempFilePath(tempDir: string, extension?: string): string;
/**
 * Clean up old temporary files
 */
export declare function cleanupTempFiles(tempDir: string, maxAge?: number): void;
/**
 * Sanitize text for TTS (remove markdown, limit length)
 */
export declare function sanitizeTextForTTS(text: string, maxLength?: number): string;
/**
 * Delay execution for specified milliseconds
 */
export declare function delay(ms: number): Promise<void>;
/**
 * Safe JSON stringify with error handling
 */
export declare function safeStringify(obj: any): string;
//# sourceMappingURL=utils.d.ts.map