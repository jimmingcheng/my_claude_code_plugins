#!/usr/bin/env node
/**
 * Claude Code TTS Notification Hook - Post Tool Use Entry Point
 * This script is called by Claude Code after each tool execution
 */

import { getConfig } from './config';
import { TTSService } from './tts-service';
import { AudioPlayer } from './audio-player';
import { SimpleLogger, readStdinInput, generateNotificationMessage, shouldSkipTool, cleanupTempFiles } from './utils';
import { HookInput, PluginConfig } from './types';

// Initialize logger
const logger = new SimpleLogger('[TTS-Hook]');

/**
 * Main hook execution function
 */
async function executeHook(): Promise<void> {
  let config: PluginConfig | undefined;

  try {
    // Load configuration
    config = getConfig();

    if (!config.enabled) {
      logger.debug('TTS notifications are disabled');
      return;
    }

    // Read hook input from stdin
    logger.debug('Reading hook input from stdin...');
    const hookInput: HookInput = await readStdinInput();

    logger.debug(`Received hook input: tool=${hookInput.tool_name}, session=${hookInput.session_id}`);

    // Check if we should skip this tool
    if (shouldSkipTool(hookInput.tool_name, config.skipTools)) {
      logger.debug(`Skipping TTS for tool: ${hookInput.tool_name}`);
      return;
    }

    // Generate notification message
    const message = generateNotificationMessage(hookInput.tool_name, config.customMessages);
    logger.info(`Generating TTS for: "${message}"`);

    // Initialize services
    const ttsService = new TTSService(config, logger);
    const audioPlayer = new AudioPlayer(logger);

    // Check if afplay is available
    const afplayAvailable = await audioPlayer.isAfplayAvailable();
    if (!afplayAvailable) {
      logger.warn('afplay not available, TTS notifications will not work on this system');
      return;
    }

    // Generate speech audio
    logger.debug('Generating speech audio...');
    const audioFilePath = await ttsService.generateSpeech(message);

    // Play audio in background (non-blocking)
    logger.debug('Starting audio playback...');
    await audioPlayer.playAudioBackground(audioFilePath);

    // Cleanup old temporary files in background
    if (config?.cleanup) {
      const tempDir = config.tempDir;
      setImmediate(() => {
        cleanupTempFiles(tempDir, 3600000); // 1 hour
      });
    }

    logger.info(`TTS notification completed for ${hookInput.tool_name}`);

  } catch (error) {
    // Log error but don't throw - we never want to break Claude's workflow
    logger.error(`TTS hook failed: ${error}`);

    // If there's a config and cleanup is enabled, try to cleanup anyway
    if (config && config.cleanup) {
      try {
        cleanupTempFiles(config.tempDir, 3600000);
      } catch (cleanupError) {
        logger.warn(`Cleanup failed: ${cleanupError}`);
      }
    }
  }
}

/**
 * Error handler for uncaught exceptions
 */
process.on('uncaughtException', (error) => {
  logger.error(`Uncaught exception in TTS hook: ${error}`);
  process.exit(0); // Always exit with 0 to not break Claude
});

/**
 * Error handler for unhandled promise rejections
 */
process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled rejection in TTS hook: ${reason}`);
  process.exit(0); // Always exit with 0 to not break Claude
});

/**
 * Handle process termination signals
 */
process.on('SIGINT', () => {
  logger.debug('TTS hook received SIGINT, exiting...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.debug('TTS hook received SIGTERM, exiting...');
  process.exit(0);
});

/**
 * Main execution with proper error handling and guaranteed exit
 */
async function main(): Promise<void> {
  try {
    // Set a maximum execution time to prevent hanging
    const timeout = setTimeout(() => {
      logger.warn('TTS hook execution timeout, exiting...');
      process.exit(0);
    }, 30000); // 30 second timeout

    await executeHook();

    // Clear timeout if we finished successfully
    clearTimeout(timeout);
  } catch (error) {
    logger.error(`Fatal error in TTS hook: ${error}`);
  } finally {
    // Always exit with code 0 to not interfere with Claude Code
    process.exit(0);
  }
}

// Execute main function if this script is run directly
if (require.main === module) {
  main();
}

// Export for testing
export { executeHook, main };