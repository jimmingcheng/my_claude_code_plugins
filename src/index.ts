/**
 * Claude Code Plugin Marketplace - Entry Point
 *
 * This is the main entry point for the marketplace scaffold.
 * Currently provides basic exports for future expansion.
 */

export * from './types';

/**
 * Marketplace version
 */
export const VERSION = '0.1.0';

/**
 * Basic marketplace info
 */
export const MARKETPLACE_INFO = {
  name: 'my-claude-code-plugins',
  description: 'Community marketplace for Claude Code plugins',
  version: VERSION,
} as const;