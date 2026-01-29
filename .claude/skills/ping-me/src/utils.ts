/**
 * Utility functions for Ping Me Skill
 */

import * as fs from 'fs';
import * as path from 'path';
import { Logger } from './types';

/**
 * Simple logger implementation
 */
export class SimpleLogger implements Logger {
  private prefix: string;

  constructor(prefix: string = '[Ping-Me]') {
    this.prefix = prefix;
  }

  info(message: string, ...args: any[]): void {
    console.log(`${this.prefix} INFO: ${message}`, ...args);
  }

  warn(message: string, ...args: any[]): void {
    console.warn(`${this.prefix} WARN: ${message}`, ...args);
  }

  error(message: string, ...args: any[]): void {
    console.error(`${this.prefix} ERROR: ${message}`, ...args);
  }

  debug(message: string, ...args: any[]): void {
    if (process.env.NODE_ENV === 'development' || process.env.DEBUG) {
      console.log(`${this.prefix} DEBUG: ${message}`, ...args);
    }
  }
}

/**
 * Generate contextual notification message based on input
 */
export function generateContextualMessage(message?: string, reason?: string): string {
  // If a direct message is provided, use it
  if (message && message.trim()) {
    return sanitizeTextForTTS(message.trim());
  }

  // Generate message based on reason/context
  if (reason && reason.trim()) {
    const contextualMessages: Record<string, string> = {
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
export function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Generate unique temporary file path
 */
export function generateTempFilePath(tempDir: string, extension: string = 'wav'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  const filename = `tts_${timestamp}_${random}.${extension}`;
  return path.join(tempDir, filename);
}

/**
 * Clean up old temporary files
 */
export function cleanupTempFiles(tempDir: string, maxAge: number = 3600000): void {
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
  } catch (error) {
    // Silently ignore cleanup errors to not break the skill
  }
}

/**
 * Sanitize text for TTS (remove markdown, limit length)
 */
export function sanitizeTextForTTS(text: string, maxLength: number = 200): string {
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
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Safe JSON stringify with error handling
 */
export function safeStringify(obj: any): string {
  try {
    return JSON.stringify(obj, null, 2);
  } catch (error) {
    return `[Unable to stringify: ${error}]`;
  }
}