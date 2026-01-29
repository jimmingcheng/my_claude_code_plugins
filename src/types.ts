/**
 * Claude Code Plugin Marketplace - Type Definitions
 *
 * Essential TypeScript interfaces for marketplace and plugin management.
 */

/**
 * Basic contact/owner information
 */
export interface Owner {
  name: string;
  email: string;
}

/**
 * Plugin metadata
 */
export interface Plugin {
  id: string;
  name: string;
  description: string;
  version: string;
  author: Owner;
  tags?: string[];
  repository?: string;
  homepage?: string;
  keywords?: string[];
}

/**
 * Marketplace configuration structure
 */
export interface MarketplaceConfig {
  name: string;
  description: string;
  owner: Owner;
  plugins: Plugin[];
}

/**
 * Plugin installation status
 */
export type PluginStatus = 'installed' | 'available' | 'error';

/**
 * Plugin with installation information
 */
export interface PluginWithStatus extends Plugin {
  status: PluginStatus;
  installPath?: string;
  lastUpdated?: Date;
}

/**
 * Marketplace search criteria
 */
export interface SearchCriteria {
  query?: string;
  tags?: string[];
  author?: string;
  limit?: number;
  offset?: number;
}