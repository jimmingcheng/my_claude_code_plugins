#!/usr/bin/env node
"use strict";
/**
 * Claude Code Ping Me Skill - TTS Notification Entry Point
 * This script is invoked by Claude Code as an on-demand skill
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeSkill = executeSkill;
exports.main = main;
exports.parseSkillInput = parseSkillInput;
const config_1 = require("./config");
const tts_service_1 = require("./tts-service");
const audio_player_1 = require("./audio-player");
const utils_1 = require("./utils");
// Initialize logger
const logger = new utils_1.SimpleLogger('[Ping-Me]');
/**
 * Parse command line arguments for skill input
 */
function parseSkillInput() {
    const args = process.argv.slice(2);
    const skillInput = {};
    // Parse arguments in key=value format
    for (const arg of args) {
        if (arg.includes('=')) {
            const [key, ...valueParts] = arg.split('=');
            const value = valueParts.join('='); // Handle values with = signs
            if (key === 'message') {
                skillInput.message = value;
            }
            else if (key === 'reason') {
                skillInput.reason = value;
            }
        }
    }
    // If no arguments provided, treat as a simple ping
    if (args.length === 0 || Object.keys(skillInput).length === 0) {
        skillInput.message = 'Ping notification';
    }
    return skillInput;
}
/**
 * Main skill execution function
 */
async function executeSkill() {
    let config;
    try {
        // Load configuration
        config = (0, config_1.getConfig)();
        if (!config.enabled) {
            logger.debug('TTS notifications are disabled');
            return {
                success: false,
                message: 'TTS notifications are disabled in configuration'
            };
        }
        // Parse skill input from command line arguments
        logger.debug('Parsing skill input from command line arguments...');
        const skillInput = parseSkillInput();
        logger.debug(`Received skill input:`, skillInput);
        // Generate contextual notification message
        const message = (0, utils_1.generateContextualMessage)(skillInput.message, skillInput.reason);
        logger.info(`Generating TTS notification: "${message}"`);
        // Initialize services
        const ttsService = new tts_service_1.TTSService(config, logger);
        const audioPlayer = new audio_player_1.AudioPlayer(logger);
        // Check if afplay is available
        const afplayAvailable = await audioPlayer.isAfplayAvailable();
        if (!afplayAvailable) {
            const errorMsg = 'afplay not available - TTS notifications require macOS';
            logger.warn(errorMsg);
            return {
                success: false,
                message: errorMsg
            };
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
                (0, utils_1.cleanupTempFiles)(tempDir, 3600000); // 1 hour
            });
        }
        logger.info(`TTS notification completed successfully`);
        return {
            success: true,
            message: `TTS notification played: "${message}"`
        };
    }
    catch (error) {
        // Log error and return failure result
        logger.error(`Ping Me skill failed: ${error}`);
        // If there's a config and cleanup is enabled, try to cleanup anyway
        if (config && config.cleanup) {
            try {
                (0, utils_1.cleanupTempFiles)(config.tempDir, 3600000);
            }
            catch (cleanupError) {
                logger.warn(`Cleanup failed: ${cleanupError}`);
            }
        }
        return {
            success: false,
            message: `TTS notification failed: ${error instanceof Error ? error.message : String(error)}`
        };
    }
}
/**
 * Error handler for uncaught exceptions
 */
process.on('uncaughtException', (error) => {
    logger.error(`Uncaught exception in Ping Me skill: ${error}`);
    console.error(JSON.stringify({
        success: false,
        message: `Fatal error: ${error.message}`
    }));
    process.exit(1);
});
/**
 * Error handler for unhandled promise rejections
 */
process.on('unhandledRejection', (reason) => {
    logger.error(`Unhandled rejection in Ping Me skill: ${reason}`);
    console.error(JSON.stringify({
        success: false,
        message: `Fatal error: ${reason}`
    }));
    process.exit(1);
});
/**
 * Handle process termination signals
 */
process.on('SIGINT', () => {
    logger.debug('Ping Me skill received SIGINT, exiting...');
    console.error(JSON.stringify({
        success: false,
        message: 'Skill interrupted'
    }));
    process.exit(1);
});
process.on('SIGTERM', () => {
    logger.debug('Ping Me skill received SIGTERM, exiting...');
    console.error(JSON.stringify({
        success: false,
        message: 'Skill terminated'
    }));
    process.exit(1);
});
/**
 * Main execution with proper error handling
 */
async function main() {
    try {
        // Set a maximum execution time to prevent hanging
        const timeout = setTimeout(() => {
            logger.warn('Ping Me skill execution timeout, exiting...');
            console.error(JSON.stringify({
                success: false,
                message: 'Skill execution timeout'
            }));
            process.exit(1);
        }, 15000); // 15 second timeout (matches skills.json)
        const result = await executeSkill();
        // Clear timeout if we finished successfully
        clearTimeout(timeout);
        // Output result as JSON for Claude Code to parse
        console.log(JSON.stringify(result));
    }
    catch (error) {
        logger.error(`Fatal error in Ping Me skill: ${error}`);
        console.error(JSON.stringify({
            success: false,
            message: `Fatal error: ${error instanceof Error ? error.message : String(error)}`
        }));
        process.exit(1);
    }
}
// Execute main function if this script is run directly
if (require.main === module) {
    main();
}
//# sourceMappingURL=ping-me.js.map