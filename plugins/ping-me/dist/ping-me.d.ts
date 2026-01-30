#!/usr/bin/env node
/**
 * Claude Code Ping Me Skill - TTS Notification Entry Point
 * This script is invoked by Claude Code as an on-demand skill
 */
import { SkillInput, SkillResult } from './types';
/**
 * Parse command line arguments for skill input
 */
declare function parseSkillInput(): SkillInput;
/**
 * Main skill execution function
 */
declare function executeSkill(): Promise<SkillResult>;
/**
 * Main execution with proper error handling
 */
declare function main(): Promise<void>;
export { executeSkill, main, parseSkillInput };
//# sourceMappingURL=ping-me.d.ts.map