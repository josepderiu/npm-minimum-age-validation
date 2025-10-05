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

## CI/CD Pipelines

This project uses GitHub Actions for automated testing, security scanning, and publishing.

### Pull Request Validation

When you create a PR, the following checks run automatically:

- **Lint & Format Check**: ESLint and Prettier validation
- **Build**: TypeScript compilation
- **Test Matrix**: Tests on Node.js 16.x, 18.x, and 20.x
- **Security Audit**: npm audit and dependency version checks
- **Coverage**: Code coverage reporting

All checks must pass before merging.

### Continuous Integration (Main Branch)

On every push to `main`:

- Full validation suite runs
- Build artifacts are uploaded
- Coverage reports generated

### Release & Publishing

Automated NPM publishing via **tag-based releases**:

```bash
# 1. Update CHANGELOG.md with new version notes
# 2. Bump version (creates commit and tag)
npm version patch  # or minor/major

# 3. Push to GitHub (triggers automated release)
git push origin main --tags
```

The release pipeline automatically:
- ✅ Runs all quality checks
- ✅ Publishes to NPM with provenance
- ✅ Creates GitHub Release with changelog
- ✅ Uploads package artifacts

See [Release Process](.github/RELEASE_PROCESS.md) for detailed instructions.

### Security Scanning

- **CodeQL**: Runs on every PR and weekly
- **Dependabot**: Weekly dependency updates
- **npm audit**: On every build

## Publishing Requirements

Before publishing, ensure:

1. ✅ All CI checks pass
2. ✅ CHANGELOG.md updated
3. ✅ NPM_TOKEN secret configured (maintainers only)
4. ✅ Version in package.json matches git tag

The `prepublishOnly` script automatically verifies:

1. Run all tests
2. Run linting
3. Verify all versions are pinned

## Questions?

- **Contact**: `jderiu@gmail.com`
- **Issues**: https://github.com/josepderiu/npm-minimum-age-validation/issues
- **Release Process**: See `.github/RELEASE_PROCESS.md`
