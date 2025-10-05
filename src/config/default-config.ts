/**
 * Configuration utilities for npm-security-validator
 *
 * Provides functions to create, load, merge, and save validator configuration.
 * Default configuration includes sensible defaults for registry, security, and output settings.
 *
 * @module config/default-config
 */

import fs from 'fs/promises';
import type { ValidatorConfig } from '../types';

/**
 * Creates a default validator configuration with sensible defaults.
 *
 * Includes:
 * - 24-hour minimum age requirement
 * - Common trusted packages (@angular/*, @types/*, typescript, etc.)
 * - NPM registry with 10 concurrent requests
 * - Local caching enabled with 60-minute TTL
 * - Console output with colors
 *
 * @returns Default ValidatorConfig
 *
 * @example
 * ```typescript
 * const config = createDefaultConfig();
 * config.minimumAgeHours = 48; // Override default
 * ```
 */
export function createDefaultConfig(): ValidatorConfig {
  return {
    minimumAgeHours: 24,
    trustedPackages: [
      '@angular/*',
      '@types/*',
      'typescript',
      'rxjs',
      'zone.js',
      '@microsoft/*',
      'eslint*',
      'prettier',
      'jest',
      'husky',
    ],
    registry: {
      url: 'https://registry.npmjs.org',
      concurrency: 10,
      timeout: 8000,
      retries: 3,
      cacheEnabled: true,
      cacheTtlMinutes: 60,
    },
    security: {
      enforceHttps: true,
      allowPrivatePackages: true,
      blocklistPatterns: [],
      requireSignedPackages: false,
    },
    output: {
      format: 'console',
      verbose: false,
      colors: true,
      logLevel: 'info',
    },
  };
}

/**
 * Loads validator configuration from a JSON file.
 *
 * Reads configuration from the specified file path and merges with defaults.
 * User-provided values override defaults while preserving unspecified settings.
 *
 * @param configPath - Absolute or relative path to JSON config file
 * @returns Promise resolving to merged ValidatorConfig
 * @throws Error if file cannot be read or contains invalid JSON
 *
 * @example
 * ```typescript
 * const config = await loadConfig('./validator.config.json');
 * console.log(`Minimum age: ${config.minimumAgeHours} hours`);
 * ```
 */
export async function loadConfig(configPath: string): Promise<ValidatorConfig> {
  try {
    const configContent = await fs.readFile(configPath, 'utf-8');
    const userConfig = JSON.parse(configContent);

    const defaultConfig = createDefaultConfig();
    return mergeConfig(defaultConfig, userConfig);
  } catch (error) {
    throw new Error(`Failed to load config from ${configPath}: ${(error as Error).message}`);
  }
}

/**
 * Merges user configuration with default configuration.
 *
 * Performs deep merge for nested objects (registry, security, output).
 * User values take precedence over defaults for specified fields.
 *
 * @param defaultConfig - Base configuration with all defaults
 * @param userConfig - Partial user configuration to overlay
 * @returns Merged ValidatorConfig
 *
 * @internal
 */
function mergeConfig(
  defaultConfig: ValidatorConfig,
  userConfig: Partial<ValidatorConfig>
): ValidatorConfig {
  return {
    ...defaultConfig,
    ...userConfig,
    registry: { ...defaultConfig.registry!, ...userConfig.registry },
    security: { ...defaultConfig.security!, ...userConfig.security },
    output: { ...defaultConfig.output!, ...userConfig.output },
  };
}

/**
 * Saves validator configuration to a JSON file.
 *
 * Serializes configuration as formatted JSON (2-space indentation) and
 * writes to the specified file path. Creates parent directories if needed.
 *
 * @param config - ValidatorConfig to save
 * @param configPath - Absolute or relative path for output file
 * @returns Promise that resolves when file is written
 * @throws Error if file cannot be written
 *
 * @example
 * ```typescript
 * const config = createDefaultConfig();
 * config.minimumAgeHours = 72;
 * await saveConfig(config, './custom-config.json');
 * ```
 */
export async function saveConfig(config: ValidatorConfig, configPath: string): Promise<void> {
  try {
    const configJson = JSON.stringify(config, null, 2);
    await fs.writeFile(configPath, configJson, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to save config to ${configPath}: ${(error as Error).message}`);
  }
}
