# Contributing to npm-minimum-age-validation

## Development Setup

### Prerequisites

- Node.js >= 16.0.0
- npm >= 7.0.0

### Installation

```bash
npm install
```

### Configuration Files

This project includes standard configuration files for consistent development:

#### `.prettierrc`

Prettier configuration for code formatting:

- Single quotes
- Semicolons required
- 100 character line width
- 2-space indentation
- Trailing commas (ES5 compatible)

**Usage:**

```bash
npm run format        # Format all files
npm run format:check  # Check formatting without changing files
```

#### `.npmrc`

NPM configuration for package management:

- `save-exact=true` - Always save exact versions (no ^ or ~)
- `audit=true` - Run security audits on install
- `engine-strict=true` - Enforce Node.js version requirements
- `prefer-offline=true` - Use cache when possible
- Security audit level: moderate
- Automatic retries with backoff

**Benefits:**

- Consistent dependency versions across environments
- Automatic security auditing
- Faster installs with offline cache
- Enforced Node.js version compatibility

#### `.gitignore`

Standard ignores for TypeScript/npm projects:

- `node_modules/` - Dependencies
- `dist/` - Build outputs
- `coverage/` - Test coverage reports
- IDE files (`.vscode/`, `.idea/`)
- OS files (`.DS_Store`, `Thumbs.db`)
- Logs and temporary files
- Environment variable files

**Note:** `package-lock.json` is tracked for dependency consistency

## Development Workflow

### 1. Make Changes

```bash
# Create a feature branch
git checkout -b feature/my-feature

# Make your changes
# ...
```

### 2. Format Code

```bash
npm run format
```

### 3. Run Tests

```bash
npm test
```

### 4. Lint Code

```bash
npm run lint:fix
```

### 5. Build

```bash
npm run build
```

### 6. Verify All Checks Pass

```bash
npm run prepublishOnly
```

## Code Standards

### TypeScript

- Strict mode enabled
- No implicit any
- Comprehensive JSDoc for all public APIs

### Testing

- Jest for unit and integration tests
- Minimum 80% code coverage
- Test naming: `describe` -> `it` pattern

### Logging

- Use PinoLogger for all logging (async, non-blocking)
- Avoid console.log (blocks event loop)

### Security

- All dependency versions pinned (no ^ or ~)
- Regular `npm audit` checks
- No sensitive data in code or logs

## Project Structure

```
npm-minimum-age-validation/
├── src/                  # Source code
│   ├── cli.ts           # CLI interface
│   ├── index.ts         # Public API exports
│   ├── types.ts         # TypeScript interfaces
│   ├── config/          # Configuration utilities
│   ├── core/            # Core validation logic
│   └── utils/           # Utility functions
├── __tests__/           # Test files
├── dist/                # Compiled output (gitignored)
├── .prettierrc          # Prettier config
├── .npmrc               # NPM config
├── .gitignore           # Git ignores
├── tsconfig.json        # TypeScript config
├── jest.config.js       # Jest config
└── package.json         # Package manifest
```

## Publishing (Internal Only)

This package is private and should only be published to internal registry:

```bash
npm version [patch|minor|major]
npm publish
```

The `prepublishOnly` script will automatically:

1. Run all tests
2. Run linting
3. Verify all versions are pinned

## Questions?

- **Contact**: `jderiu@gmail.com`
