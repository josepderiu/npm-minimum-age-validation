# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
### [1.0.1](https://github.com/josepderiu/npm-minimum-age-validation/compare/v1.0.0...v1.0.1) (2025-10-05)


### Bug Fixes

* address CodeQL security alerts with comments and code cleanup ([030b23b](https://github.com/josepderiu/npm-minimum-age-validation/commit/030b23b99545e237cb61c183db41b5845f3dd9df))
* make pino-pretty optional to prevent runtime errors in production ([05bcc88](https://github.com/josepderiu/npm-minimum-age-validation/commit/05bcc88ec5377709b2f4c6ea06145d6d988306fe))

## 1.0.0 (2025-10-05)


### Features

* add NPM publishing setup and quick start guides; update package access to public ([be074b5](https://github.com/josepderiu/npm-minimum-age-validation/commit/be074b566a03db2288cdcbb1d5b8258a0c74b865))
* add version configuration for changelog management and release commit formatting ([ea2c44f](https://github.com/josepderiu/npm-minimum-age-validation/commit/ea2c44f7876099229f5fdcb8ccbfc918efcddc80))
* enhance CI/CD pipeline documentation and workflows ([9d16f7d](https://github.com/josepderiu/npm-minimum-age-validation/commit/9d16f7d0d97703a8f4c59f0b8f5ee44e5412dac8))
* implement npm package minimum age validation ([6389988](https://github.com/josepderiu/npm-minimum-age-validation/commit/63899889e0f8cb732e1d6a53412690efd25cee79))
* update contributing guidelines to include release pipeline details ([77f48ff](https://github.com/josepderiu/npm-minimum-age-validation/commit/77f48ff24be11f88f6b9b09e8adf78d891b4ea4f))


### Bug Fixes

* correct bin paths to use dist/cli.js ([09a46cf](https://github.com/josepderiu/npm-minimum-age-validation/commit/09a46cfff609735a50fea886ae0e92792093c150))


### Code Refactoring

* **changelog:** reorganize sections and enhance clarity of logging changes ([6478595](https://github.com/josepderiu/npm-minimum-age-validation/commit/6478595f27d2171e4d04fe2a94a7aae37441f921))
* **docs:** update documentation and remove obsolete files related to NPM publishing setup ([a09636c](https://github.com/josepderiu/npm-minimum-age-validation/commit/a09636cb9a80a2571f6a1a92d738a76908cc4151))

## 1.0.0 (2025-10-05)


### Features

* add NPM publishing setup and quick start guides; update package access to public ([be074b5](https://github.com/josepderiu/npm-minimum-age-validation/commit/be074b566a03db2288cdcbb1d5b8258a0c74b865))
* add version configuration for changelog management and release commit formatting ([ea2c44f](https://github.com/josepderiu/npm-minimum-age-validation/commit/ea2c44f7876099229f5fdcb8ccbfc918efcddc80))
* enhance CI/CD pipeline documentation and workflows ([9d16f7d](https://github.com/josepderiu/npm-minimum-age-validation/commit/9d16f7d0d97703a8f4c59f0b8f5ee44e5412dac8))
* implement npm package minimum age validation ([6389988](https://github.com/josepderiu/npm-minimum-age-validation/commit/63899889e0f8cb732e1d6a53412690efd25cee79))
* update contributing guidelines to include release pipeline details ([77f48ff](https://github.com/josepderiu/npm-minimum-age-validation/commit/77f48ff24be11f88f6b9b09e8adf78d891b4ea4f))


### Code Refactoring

* **changelog:** reorganize sections and enhance clarity of logging changes ([6478595](https://github.com/josepderiu/npm-minimum-age-validation/commit/6478595f27d2171e4d04fe2a94a7aae37441f921))
* **docs:** update documentation and remove obsolete files related to NPM publishing setup ([a09636c](https://github.com/josepderiu/npm-minimum-age-validation/commit/a09636cb9a80a2571f6a1a92d738a76908cc4151))

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Package age validation with configurable minimum age threshold (default: 24 hours)
- Git hook integration support for pre-commit validation
- CLI tool with multiple commands (validate, config)
- Programmatic API for integration into custom workflows
- npm registry integration with intelligent caching
- Support for trusted packages and wildcard patterns
- Comprehensive configuration system with defaults
- Multiple output formats (console, JSON)
- Concurrent package validation with rate limiting
- Package-lock.json diff analysis for changed dependencies
- Performance tracking and metrics
- Verbose and quiet modes
- `PinoLogger` class with async non-blocking logging (145 lines, fully documented)
- `ILogger` interface for type-safe logger abstraction
- Child logger support with context propagation
- 24 comprehensive tests for PinoLogger (100% passing)
- Graceful shutdown support in CLI
- `pino@8.17.2` for async logging
- `pino-pretty@10.3.1` (dev) for development pretty printing
- GitHub Actions CI/CD pipeline with tag-based releases
- Dependabot configuration for automated dependency updates
- Comprehensive documentation for NPM publishing and GitHub Free tier

### Changed

- **BREAKING**: Migrated from synchronous console.log to async Pino.js logger
  - 20x performance improvement (12k → 240k logs/sec)
  - Zero event loop blocking (previously 96% blocked during logging)
  - Structured JSON logging for production environments
  - Pretty printing for development with automatic TTY detection
  - Graceful shutdown with `flush()` method to prevent log loss
- Updated all core classes to use `ILogger` interface (PackageValidator, RegistryClient, PackageLockDiffer)
- CLI now uses PinoLogger with proper flush before process exit

### Security

- Fixed dependency versions for supply chain protection (no ^ or ~ in dependencies)
- Input validation and sanitization for package names and versions
- Timeout protection for registry requests (10s default)
- Rate limiting via configurable concurrency control
- Secure defaults for all configuration options
- No telemetry or external data collection

### Deprecated

- `Logger` class (console.log-based) - replaced by `PinoLogger`
  - Still exported for backwards compatibility
  - Will be removed in v2.0.0
