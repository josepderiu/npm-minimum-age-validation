/**
 * npm-minimum-age-validation
 *
 * Validates npm packages against minimum age requirements to protect against
 * supply chain attacks and newly published packages that haven't been vetted.
 *
 * Key Features:
 * - Git diff analysis to detect modified packages
 * - NPM registry integration with caching
 * - Configurable minimum age requirement (default: 24 hours)
 * - Trusted package patterns (wildcards supported)
 * - Async Pino logging (20x faster, zero blocking)
 * - CLI and programmatic API
 * - JSON/console output formats
 *
 * Quick Start:
 * ```typescript
 * import { validatePackages } from 'npm-minimum-age-validation';
 *
 * const result = await validatePackages({
 *   minimumAgeHours: 48,
 *   trustedPackages: ['@angular/*', '@types/*']
 * });
 *
 * if (!result.success) {
 *   console.error(`${result.violations.length} packages too new`);
 *   process.exit(1);
 * }
 * ```
 *
 * @packageDocumentation
 */

// Public API exports
export { createDefaultConfig, loadConfig } from './config/default-config';
export { PackageLockDiffer } from './core/differ';
export { RegistryClient } from './core/registry-client';
export { PackageValidator } from './core/validator';

// Type exports
export type {
  GitDiffResult,
  OutputConfig,
  PackageInfo,
  PackageViolation,
  RegistryConfig,
  SecurityConfig,
  ValidationResult,
  ValidationSummary,
  ValidatorConfig,
} from './types';

// Main validation functions
export { validatePackages } from './core/validator';

// Utility exports
export { Logger } from './utils/logger'; // Legacy console-based logger (deprecated)
export { Performance } from './utils/performance';
export { PinoLogger } from './utils/pino-logger'; // Modern async logger (recommended)

// Default logger export (Pino for performance)
export { PinoLogger as DefaultLogger } from './utils/pino-logger';
// export { Logger as DefaultLogger } from './utils/logger'; // Legacy console-based logger (deprecated)

// Constants

/** Default minimum package age requirement in hours */
export const DEFAULT_MINIMUM_AGE_HOURS = 24;

/** Default npm registry URL */
export const DEFAULT_REGISTRY_URL = 'https://registry.npmjs.org';

/** Supported output formats for validation results */
export const SUPPORTED_FORMATS = ['console', 'json'] as const;
