/**
 * Information about an npm package detected in package-lock.json
 */
export interface PackageInfo {
  /** Package name (e.g., 'lodash', '@angular/core') */
  name: string;
  /** Semantic version (e.g., '4.17.21', '^16.0.0') */
  version: string;
  /** Parent package that depends on this package */
  parent: string;
  /** True if package was added (not present in HEAD commit) */
  isNew?: boolean;
  /** Date when this version was published to npm registry */
  publishDate?: Date;
  /** Hours elapsed since package publication */
  ageInHours?: number;
}

/**
 * Result of package validation operation
 */
export interface ValidationResult {
  /** True if all packages passed validation (no violations) */
  success: boolean;
  /** List of packages that violated the minimum age requirement */
  violations: PackageViolation[];
  /** Summary statistics for the validation run */
  summary: ValidationSummary;
}

/**
 * A package that violated the minimum age requirement
 */
export interface PackageViolation {
  /** Package name */
  name: string;
  /** Package version */
  version: string;
  /** Parent package that depends on this package */
  parent: string;
  /** Date when this version was published */
  publishDate: Date;
  /** Hours since publication (less than minimum age) */
  ageInHours: number;
}

/**
 * Summary statistics for a validation run
 */
export interface ValidationSummary {
  /** Total number of packages analyzed */
  totalPackages: number;
  /** Number of newly added packages */
  newPackages: number;
  /** Number of packages with version changes */
  modifiedPackages: number;
  /** Number of packages that violated age requirement */
  violations: number;
  /** Total execution time in milliseconds */
  executionTimeMs: number;
}

/**
 * Main validator configuration
 */
export interface ValidatorConfig {
  /** Minimum hours a package version must exist before being trusted */
  minimumAgeHours: number;
  /** List of trusted packages or glob patterns (e.g., '@angular/*') */
  trustedPackages: string[];
  /** NPM registry configuration */
  registry?: RegistryConfig;
  /** Security policy configuration */
  security?: SecurityConfig;
  /** Output formatting configuration */
  output?: OutputConfig;
}

/**
 * NPM registry client configuration
 */
export interface RegistryConfig {
  /** Registry URL (default: https://registry.npmjs.org) */
  url: string;
  /** Maximum concurrent requests to registry */
  concurrency: number;
  /** Request timeout in milliseconds */
  timeout: number;
  /** Maximum retry attempts for failed requests */
  retries: number;
  /** Enable local caching of registry responses */
  cacheEnabled: boolean;
  /** Cache time-to-live in minutes */
  cacheTtlMinutes: number;
}

/**
 * Security policy configuration
 */
export interface SecurityConfig {
  /** Require HTTPS for all registry requests */
  enforceHttps: boolean;
  /** Allow packages from private registries */
  allowPrivatePackages: boolean;
  /** Regex patterns for blocked package names */
  blocklistPatterns: string[];
  /** Require package signatures (future feature) */
  requireSignedPackages: boolean;
}

/**
 * Output formatting configuration
 */
export interface OutputConfig {
  /** Output format for validation results */
  format: 'console' | 'json' | 'junit' | 'sarif';
  /** Enable verbose logging */
  verbose: boolean;
  /** Enable colored console output */
  colors: boolean;
  /** Logging level */
  logLevel: 'error' | 'warn' | 'info' | 'debug';
}

/**
 * Result of git diff analysis for package-lock.json
 */
export interface GitDiffResult {
  /** List of packages that were added or modified */
  modified: PackageInfo[];
  /** True if package-lock.json is newly created (not in HEAD) */
  isNewFile: boolean;
  /** List of files changed in the git diff */
  changedFiles: string[];
}

/**
 * Cached registry response entry
 */
export interface CacheEntry {
  /** Package publish date (null if fetch failed) */
  publishDate: Date | null;
  /** Unix timestamp when cache entry was created */
  timestamp: number;
  /** Error message if registry fetch failed */
  error?: string;
}

/**
 * Performance tracking metrics for profiling
 */
export interface PerformanceMetrics {
  /** Map of operation name to timing data */
  [key: string]: {
    /** High-resolution start time (milliseconds) */
    startTime: number;
    /** High-resolution end time (milliseconds) */
    endTime?: number;
    /** Calculated duration (endTime - startTime) */
    duration?: number;
  };
}
