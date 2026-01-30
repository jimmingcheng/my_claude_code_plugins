/**
 * Configuration management for Ping Me Skill
 */
import { PluginConfig } from './types';
/**
 * Load and validate plugin configuration
 */
export declare function loadConfig(): PluginConfig;
/**
 * Get default configuration values
 */
export declare function getDefaultConfig(): Partial<PluginConfig>;
/**
 * Validate configuration values
 */
export declare function validateConfig(config: PluginConfig): string[];
/**
 * Get environment variable example content for .env file
 */
export declare function getEnvExample(): string;
export declare function getConfig(): PluginConfig;
/**
 * Reset config instance (useful for testing)
 */
export declare function resetConfig(): void;
//# sourceMappingURL=config.d.ts.map