# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- **BREAKING**: Migrated from synchronous console.log to async Pino.js logger
  - 20x performance improvement (12k → 240k logs/sec)
  - Zero event loop blocking (previously 96% blocked during logging)
  - Structured JSON logging for production environments
  - Pretty printing for development with automatic TTY detection
  - Graceful shutdown with `flush()` method to prevent log loss
- Created `ILogger` interface for backwards compatibility
- Updated all core classes to use `ILogger` interface (PackageValidator, RegistryClient, PackageLockDiffer)
- CLI now uses PinoLogger with proper flush before process exit

### Added (Unreleased)

- `PinoLogger` class with async non-blocking logging (145 lines, fully documented)
- `ILogger` interface for type-safe logger abstraction
- Child logger support with context propagation
- 24 comprehensive tests for PinoLogger (100% passing)
- Graceful shutdown support in CLI

### Dependencies

- Added `pino@8.17.2` for async logging
- Added `pino-pretty@10.3.1` (dev) for development pretty printing

### Deprecated

- `Logger` class (console.log-based) - replaced by `PinoLogger`
  - Still exported for backwards compatibility
  - Will be removed in v2.0.0

### Planned

- Increased test coverage to 75%+
- API documentation with TypeDoc
- Release automation with standard-version

## [1.0.0] - 2025-01-02

### Added (Initial Release)

- Initial release of npm-security-validator
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

### Security

- Fixed dependency versions for supply chain protection (no ^ or ~ in dependencies)
- Input validation and sanitization for package names and versions
- Timeout protection for registry requests (10s default)
- Rate limiting via configurable concurrency control
- Secure defaults for all configuration options
- No telemetry or external data collection

### Documentation

- Comprehensive README.md with usage examples
- SECURITY.md with vulnerability reporting and best practices
- CHANGELOG.md following Keep a Changelog format
- TypeScript type definitions for all public APIs

### Testing

- 79 comprehensive test cases covering core functionality
- Unit tests for all utilities (logger, pino-logger, git-helper, performance, config)
- Integration tests for registry client and validator
- Test-Driven Development (TDD) approach for new features

### Performance

- Async non-blocking logging with Pino.js (20x faster than console.log)
- Regex pattern caching for trusted package matching (O(1) lookups)
- Intelligent npm registry caching to minimize API calls
- Concurrent package validation with configurable limits
- Optimized string formatting with centralized PackageFormatter utility

[Unreleased]: https://github.com/josepderiu/npm-minimum-age-validation/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/josepderiu/npm-minimum-age-validation/releases/tag/v1.0.0
