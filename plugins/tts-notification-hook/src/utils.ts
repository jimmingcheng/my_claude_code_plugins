/**
 * Utility functions for TTS Notification Hook
 */

import * as fs from 'fs';
import * as path from 'path';
import { HookInput, Logger } from './types';

/**
 * Simple logger implementation
 */
export class SimpleLogger implements Logger {
  private prefix: string;

  constructor(prefix: string = '[TTS-Hook]') {
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
 * Generate notification message based on tool completion
 */
export function generateNotificationMessage(toolName: string, customMessages?: Record<string, string>): string {
  // Check for custom message first
  if (customMessages && customMessages[toolName]) {
    return customMessages[toolName];
  }

  // Default messages for common tools
  const defaultMessages: Record<string, string> = {
    'Read': 'File read completed',
    'Write': 'File written successfully',
    'Edit': 'File edited successfully',
    'Bash': 'Command executed',
    'Grep': 'Search completed',
    'Glob': 'File search completed',
    'Task': 'Task completed',
    'WebFetch': 'Web content fetched',
    'AskUserQuestion': 'Question asked',
    'TodoWrite': 'Todo updated',
    'NotebookEdit': 'Notebook edited'
  };

  return defaultMessages[toolName] || `${toolName} completed`;
}

/**
 * Read and parse JSON input from stdin
 */
export async function readStdinInput(): Promise<HookInput> {
  return new Promise((resolve, reject) => {
    let input = '';

    process.stdin.setEncoding('utf-8');

    process.stdin.on('data', (chunk) => {
      input += chunk;
    });

    process.stdin.on('end', () => {
      try {
        const parsed = JSON.parse(input.trim());
        resolve(parsed as HookInput);
      } catch (error) {
        reject(new Error(`Failed to parse hook input: ${error}`));
      }
    });

    process.stdin.on('error', (error) => {
      reject(new Error(`Failed to read stdin: ${error}`));
    });
  });
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
    // Silently ignore cleanup errors to not break the hook
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
 * Check if tool should be skipped based on configuration
 */
export function shouldSkipTool(toolName: string, skipTools: string[]): boolean {
  return skipTools.includes(toolName) || skipTools.includes('*');
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