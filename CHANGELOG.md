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
