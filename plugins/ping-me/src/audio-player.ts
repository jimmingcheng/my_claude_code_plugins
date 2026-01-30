/**
 * Audio Player for macOS using afplay command
 */

import { spawn, ChildProcess } from 'child_process';
import * as fs from 'fs';
import { AudioPlaybackResult, Logger } from './types';

export class AudioPlayer {
  private logger: Logger;
  private currentProcess: ChildProcess | null = null;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Play audio file using macOS afplay command
   */
  async playAudio(filePath: string): Promise<AudioPlaybackResult> {
    if (!filePath) {
      return {
        success: false,
        error: 'File path is required'
      };
    }

    // Check if file exists
    try {
      await fs.promises.access(filePath, fs.constants.F_OK);
    } catch (error) {
      return {
        success: false,
        error: `Audio file not found: ${filePath}`
      };
    }

    // Check if we're on macOS
    if (process.platform !== 'darwin') {
      return {
        success: false,
        error: 'Audio playback is only supported on macOS'
      };
    }

    this.logger.debug(`Playing audio file: ${filePath}`);

    return new Promise((resolve) => {
      // Stop any currently playing audio
      this.stopAudio();

      // Start afplay process
      this.currentProcess = spawn('afplay', [filePath], {
        stdio: ['ignore', 'pipe', 'pipe'],
        detached: true,
        windowsHide: true
      });

      // Detach the process so main script can exit immediately
      this.currentProcess.unref();

      const startTime = Date.now();

      this.currentProcess.on('close', (code) => {
        const duration = Date.now() - startTime;
        this.currentProcess = null;

        if (code === 0) {
          this.logger.debug(`Audio playback completed in ${duration}ms`);
          resolve({
            success: true,
            filePath: filePath
          });
        } else {
          this.logger.warn(`Audio playback failed with exit code: ${code}`);
          resolve({
            success: false,
            error: `afplay exited with code ${code}`,
            filePath: filePath
          });
        }
      });

      this.currentProcess.on('error', (error) => {
        this.currentProcess = null;
        this.logger.error(`Audio playback error: ${error.message}`);
        resolve({
          success: false,
          error: `afplay error: ${error.message}`,
          filePath: filePath
        });
      });

      // Handle stderr output
      if (this.currentProcess.stderr) {
        this.currentProcess.stderr.on('data', (data) => {
          this.logger.warn(`afplay stderr: ${data.toString().trim()}`);
        });
      }

      // Set a timeout to prevent hanging
      setTimeout(() => {
        if (this.currentProcess && !this.currentProcess.killed) {
          this.logger.warn('Audio playback timeout, killing process');
          this.stopAudio();
          resolve({
            success: false,
            error: 'Audio playback timeout',
            filePath: filePath
          });
        }
      }, 30000); // 30 second timeout
    });
  }

  /**
   * Stop currently playing audio
   */
  stopAudio(): void {
    if (this.currentProcess && !this.currentProcess.killed) {
      this.logger.debug('Stopping audio playback');
      this.currentProcess.kill('SIGTERM');
      this.currentProcess = null;
    }
  }

  /**
   * Play audio in background (non-blocking)
   * Spawns a detached process and returns immediately without waiting
   */
  async playAudioBackground(filePath: string): Promise<void> {
    if (!filePath) {
      this.logger.error('Background audio playback failed: File path is required');
      return;
    }

    // Check if file exists
    try {
      await fs.promises.access(filePath, fs.constants.F_OK);
    } catch (error) {
      this.logger.error(`Background audio playback failed: Audio file not found: ${filePath}`);
      return;
    }

    // Check if we're on macOS
    if (process.platform !== 'darwin') {
      this.logger.error('Background audio playback failed: Only supported on macOS');
      return;
    }

    this.logger.debug(`Starting background audio playback: ${filePath}`);

    // Spawn a fully detached process that won't block Node.js exit
    const childProcess = spawn('afplay', [filePath], {
      stdio: 'ignore',
      detached: true
    });

    // Unref so Node.js can exit immediately without waiting for afplay
    childProcess.unref();

    this.logger.debug(`Background audio playback started (detached): ${filePath}`);
  }

  /**
   * Check if afplay command is available
   */
  async isAfplayAvailable(): Promise<boolean> {
    if (process.platform !== 'darwin') {
      return false;
    }

    return new Promise((resolve) => {
      const testProcess = spawn('which', ['afplay'], {
        stdio: ['ignore', 'pipe', 'pipe']
      });

      testProcess.on('close', (code) => {
        resolve(code === 0);
      });

      testProcess.on('error', () => {
        resolve(false);
      });

      // Timeout after 5 seconds
      setTimeout(() => {
        testProcess.kill();
        resolve(false);
      }, 5000);
    });
  }

  /**
   * Get audio file info using afinfo command (if available)
   */
  async getAudioInfo(filePath: string): Promise<Record<string, any> | null> {
    if (process.platform !== 'darwin') {
      return null;
    }

    return new Promise((resolve) => {
      const infoProcess = spawn('afinfo', [filePath], {
        stdio: ['ignore', 'pipe', 'pipe']
      });

      let output = '';

      if (infoProcess.stdout) {
        infoProcess.stdout.on('data', (data) => {
          output += data.toString();
        });
      }

      infoProcess.on('close', (code) => {
        if (code === 0 && output) {
          try {
            const info: Record<string, any> = {};
            const lines = output.split('\n');

            for (const line of lines) {
              const match = line.match(/^(.+?):\s*(.+)$/);
              if (match) {
                const key = match[1].trim().toLowerCase().replace(/\s+/g, '_');
                const value = match[2].trim();
                info[key] = value;
              }
            }

            resolve(info);
          } catch (error) {
            this.logger.warn(`Failed to parse audio info: ${error}`);
            resolve(null);
          }
        } else {
          resolve(null);
        }
      });

      infoProcess.on('error', () => {
        resolve(null);
      });

      // Timeout after 5 seconds
      setTimeout(() => {
        infoProcess.kill();
        resolve(null);
      }, 5000);
    });
  }

  /**
   * Test audio playback with a short beep sound
   */
  async testPlayback(): Promise<boolean> {
    try {
      // Create a short test audio file path (this won't actually create the file)
      // We'll test with the system beep instead
      return new Promise((resolve) => {
        const beepProcess = spawn('afplay', ['/System/Library/Sounds/Ping.aiff'], {
          stdio: 'ignore'
        });

        beepProcess.on('close', (code) => {
          resolve(code === 0);
        });

        beepProcess.on('error', () => {
          resolve(false);
        });

        // Timeout after 5 seconds
        setTimeout(() => {
          beepProcess.kill();
          resolve(false);
        }, 5000);
      });
    } catch (error) {
      this.logger.error(`Audio test failed: ${error}`);
      return false;
    }
  }

  /**
   * Get current playback status
   */
  isPlaying(): boolean {
    return this.currentProcess !== null && !this.currentProcess.killed;
  }

  /**
   * Cleanup and stop any running audio
   */
  cleanup(): void {
    this.stopAudio();
  }
}