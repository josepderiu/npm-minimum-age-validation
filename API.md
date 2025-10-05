# API Documentation

This document describes the public API of `npm-minimum-age-validation`

## Table of Contents

- [Main Functions](#main-functions)
- [Configuration](#configuration)
- [Loggers](#loggers)
- [Types](#types)
- [Utilities](#utilities)

## Main Functions

### `validatePackages(config: ValidatorConfig): Promise<ValidationResult>`

Validates npm packages against the configured age threshold.

**Parameters:**

- `config: ValidatorConfig` - Configuration object for validation

**Returns:**

- `Promise<ValidationResult>` - Validation results including success status and violations

**Example:**

```typescript
import { validatePackages, createDefaultConfig } from 'npm-minimum-age-validation';

const config = createDefaultConfig();
config.minimumAgeHours = 48;

const result = await validatePackages(config);
console.log(result.success ? 'Passed' : 'Failed');
console.log(`Violations: ${result.violations.length}`);
```

### `createDefaultConfig(): ValidatorConfig`

Creates a default configuration object with sensible defaults.

**Returns:**

- `ValidatorConfig` - Default configuration object

**Default Values:**

- `minimumAgeHours: 24` - Minimum package age requirement
- `registry.url: 'https://registry.npmjs.org'` - npm registry URL
- `registry.timeout: 10000` - Request timeout in milliseconds
- `registry.concurrency: 15` - Maximum concurrent requests
- `registry.cacheEnabled: true` - Enable registry cache
- `registry.cacheTtlMinutes: 60` - Cache TTL
- `output.format: 'console'` - Output format
- `output.verbose: false` - Verbose logging
- `output.colors: true` - Colored output

**Example:**

```typescript
const config = createDefaultConfig();
config.trustedPackages.push('my-internal-package');
```

### `loadConfig(filePath: string): Promise<ValidatorConfig>`

Loads and merges configuration from a JSON file with defaults.

**Parameters:**

- `filePath: string` - Path to configuration file

**Returns:**

- `Promise<ValidatorConfig>` - Merged configuration object

**Throws:**

- `Error` - If file not found or invalid JSON

**Example:**

```typescript
const config = await loadConfig('.npm-minimum-age-validation.json');
```

## Configuration

### `ValidatorConfig`

Main configuration interface for the validator.

```typescript
interface ValidatorConfig {
  minimumAgeHours: number;
  trustedPackages?: string[];
  registry?: RegistryConfig;
  output?: OutputConfig;
}
```

**Properties:**

- `minimumAgeHours` - Minimum package age in hours (default: 24)
- `trustedPackages` - Array of trusted package patterns (supports wildcards)
- `registry` - Registry configuration object
- `output` - Output configuration object

### `RegistryConfig`

Configuration for npm registry interactions.

```typescript
interface RegistryConfig {
  url: string;
  timeout: number;
  concurrency: number;
  cacheEnabled: boolean;
  cacheTtlMinutes: number;
}
```

### `OutputConfig`

Configuration for output formatting.

```typescript
interface OutputConfig {
  format: 'console' | 'json';
  verbose: boolean;
  colors: boolean;
  logLevel?: 'error' | 'warn' | 'info' | 'debug';
}
```

## Loggers

### `PinoLogger` (Recommended)

High-performance async logger using Pino.js.

**Constructor:**

```typescript
new PinoLogger(level?: LogLevel, prettyPrint?: boolean)
```

**Methods:**

- `error(message: string, ...args: any[]): void` - Log error
- `warn(message: string, ...args: any[]): void` - Log warning
- `info(message: string, ...args: any[]): void` - Log info
- `success(message: string, ...args: any[]): void` - Log success
- `debug(message: string, ...args: any[]): void` - Log debug
- `step(message: string, ...args: any[]): void` - Log step
- `setLevel(level: LogLevel): void` - Set log level
- `child(context: object): PinoLogger` - Create child logger with context
- `flush(): Promise<void>` - Flush pending logs (for graceful shutdown)

**Example:**

```typescript
import { PinoLogger } from 'npm-minimum-age-validation';

const logger = new PinoLogger('info', true);
logger.info('Starting validation');
logger.error('Validation failed', { reason: 'Package too new' });

// Create child with context
const child = logger.child({ service: 'validator' });
child.info('Processing package'); // Includes service context

// Graceful shutdown
await logger.flush();
```

**Performance:**

- 20x faster than console.log (~240k logs/sec vs ~12k)
- Zero event loop blocking (async)
- Structured JSON output in production
- Pretty printing in development

### `Logger` (Deprecated)

Legacy console.log-based logger. Use `PinoLogger` instead.

**Note:** Will be removed in v2.0.0. Migrate to `PinoLogger` or `DefaultLogger`.

### `DefaultLogger`

Alias for `PinoLogger`. Use this for default logger implementation.

```typescript
import { DefaultLogger } from 'npm-minimum-age-validation';

const logger = new DefaultLogger();
```

### `ILogger` Interface

Common interface implemented by both `Logger` and `PinoLogger`.

```typescript
interface ILogger {
  error(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  success(message: string, ...args: any[]): void;
  debug(message: string, ...args: any[]): void;
  step(message: string, ...args: any[]): void;
  setLevel(level: 'error' | 'warn' | 'info' | 'debug'): void;
}
```

**Usage:**

```typescript
class MyService {
  constructor(private logger: ILogger) {}

  doWork() {
    this.logger.info('Working...');
  }
}

// Works with both implementations
const service1 = new MyService(new Logger()); // Legacy
const service2 = new MyService(new PinoLogger()); // Modern
```

## Types

### `ValidationResult`

Result of package validation.

```typescript
interface ValidationResult {
  success: boolean;
  violations: PackageViolation[];
  summary: ValidationSummary;
}
```

### `PackageViolation`

Represents a package that violates the age threshold.

```typescript
interface PackageViolation {
  name: string;
  version: string;
  parent: string;
  publishDate: Date;
  ageInHours: number;
}
```

### `ValidationSummary`

Summary statistics of validation run.

```typescript
interface ValidationSummary {
  totalPackages: number;
  newPackages: number;
  modifiedPackages: number;
  violations: number;
  executionTimeMs: number;
}
```

### `PackageInfo`

Information about an npm package.

```typescript
interface PackageInfo {
  name: string;
  version: string;
  parent: string;
  isNew?: boolean;
  publishDate?: Date;
  ageInHours?: number;
}
```

## Utilities

### `PackageFormatter`

Utility for consistent package string formatting.

```typescript
class PackageFormatter {
  static toKey(name: string, version: string): string;
  static fromPackageInfo(pkg: PackageInfo): string;
}
```

**Example:**

```typescript
import { PackageFormatter } from 'npm-minimum-age-validation';

const key = PackageFormatter.toKey('lodash', '4.17.21');
console.log(key); // "lodash@4.17.21"
```

### `Performance`

Performance tracking utility.

```typescript
class Performance {
  start(key: string): void;
  end(key: string): number;
  get(key: string): number;
  getAll(): PerformanceMetrics;
  reset(): void;
  summary(): string;
}
```

**Example:**

```typescript
import { Performance } from 'npm-minimum-age-validation';

const perf = new Performance();
perf.start('validation');
await validatePackages(config);
const duration = perf.end('validation');
console.log(`Took ${duration}ms`);
```

### `GitHelper`

Git operations utility.

```typescript
class GitHelper {
  static isGitRepository(): boolean;
  static hasPackageLockChanges(): boolean;
  static getPackageLockFromHead(): string | null;
  static getCurrentBranch(): string;
  static getLastCommitHash(): string;
}
```

**Example:**

```typescript
import { GitHelper } from 'npm-minimum-age-validation';

if (GitHelper.isGitRepository()) {
  const branch = GitHelper.getCurrentBranch();
  console.log(`On branch: ${branch}`);
}
```

## CLI Usage

The package provides CLI commands via the `validate-packages` executable.

### Commands

#### `validate`

Validate package ages in current repository.

```bash
validate-packages validate [options]
```

**Options:**

- `-c, --config <file>` - Configuration file path
- `-a, --min-age <hours>` - Minimum package age in hours (default: 24)
- `-t, --trusted <packages>` - Comma-separated trusted package patterns
- `-f, --format <format>` - Output format: console|json (default: console)
- `-v, --verbose` - Verbose output
- `--no-cache` - Disable registry cache
- `--dry-run` - Perform validation without blocking
- `--registry <url>` - npm registry URL
- `--concurrency <num>` - Max concurrent requests (default: 10)

#### `config`

Generate default configuration file.

```bash
validate-packages config [options]
```

**Options:**

- `-o, --output <file>` - Output file path (default: .npm-minimum-age-validation.json)

## Migration Guide

### From Logger to PinoLogger

If you're using the legacy `Logger` class, migrate to `PinoLogger`:

```typescript
// Old (deprecated)
import { Logger } from 'npm-minimum-age-validation';
const logger = new Logger();

// New (recommended)
import { PinoLogger } from 'npm-minimum-age-validation';
const logger = new PinoLogger('info', true);

// Or use DefaultLogger alias
import { DefaultLogger } from 'npm-minimum-age-validation';
const logger = new DefaultLogger();
```

**Important:** Remember to call `flush()` before process exit:

```typescript
await logger.flush();
process.exit(0);
```

### For Library Authors

Use the `ILogger` interface for maximum flexibility:

```typescript
import type { ILogger } from 'npm-minimum-age-validation';

export class MyValidator {
  constructor(private logger: ILogger) {}
}
```

This allows users to inject either `Logger` or `PinoLogger`.

## Advanced Usage

### Custom Registry Configuration

```typescript
const config = createDefaultConfig();
config.registry = {
  url: 'https://custom-registry.example.com',
  timeout: 15000,
  concurrency: 20,
  cacheEnabled: true,
  cacheTtlMinutes: 120,
};
```

### Trusted Package Patterns

```typescript
const config = createDefaultConfig();
config.trustedPackages = [
  '@mycompany/*', // All packages in scope
  'internal-package', // Specific package
  '*-plugin', // Wildcard suffix
  'test-*', // Wildcard prefix
];
```

### JSON Output for CI/CD

```typescript
const config = createDefaultConfig();
config.output = {
  format: 'json',
  verbose: false,
  colors: false,
};

const result = await validatePackages(config);
console.log(JSON.stringify(result, null, 2));
```

## Support

For issues, questions, or contributions:

- Open an issue on [GitHub](https://github.com/josepderiu/npm-minimum-age-validation/issues)
- Check the [Changelog](./CHANGELOG.md)

## License

PROPRIETARY - See [LICENSE](./LICENSE) for details.
