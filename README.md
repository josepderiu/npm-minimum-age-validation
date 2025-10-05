# npm-minimum-age-validation

Validate npm package age to protect your supply chain from very-new or unvetted packages.

Lightweight, fast, and configurable validator that can be used as a CLI (git/hooks / CI) or programmatically in Node.js projects.

> [!NOTE]
> This repository provides a library and CLI to enforce a minimum age (hours) for npm packages. It's intended for build/CI and pre-commit hooks to raise an early warning when recently published packages appear in your dependency set.

## Key features

- Detect changed/added packages from git diffs or lockfiles
- Query npm registry with caching and concurrency controls
- Configurable minimum age requirement (default: 24h)
- Trusted package patterns (supports wildcards like `@org/*`)
- Programmatic API and standalone CLI (`validate-packages`)
- Fast, async logging with Pino

## Requirements

- **Node.js**: >=20.0.0
- **npm**: >=9.0.0

This package requires Node.js 20 or higher to run. If you need support for older Node.js versions, please open an issue.

## Install

Install from npm (scoped package):

```bash
npm install @josepderiu/npm-minimum-age-validation --save-dev
```

You can also use the CLI without installing by running it with npx:

```bash
npx validate-packages validate
```

## Quick CLI usage

The package installs a bin named `validate-packages`.

- Validate with defaults (24h minimum age):

```bash
npx validate-packages validate
```

- Validate with custom minimum age (48 hours):

```bash
npx validate-packages validate --min-age 48
```

- Generate a default configuration file:

```bash
npx validate-packages config --output .npm-minimum-age-validation.json
```

CLI options (summary):

- `-c, --config <file>` — load configuration from file
- `-a, --min-age <hours>` — minimum package age in hours
- `-t, --trusted <packages>` — comma-separated trusted package patterns
- `-f, --format <format>` — output format (`console` | `json`)
- `--no-cache` — disable registry response caching
- `--dry-run` — run validation without blocking (useful for CI)
- `--registry <url>` — override npm registry URL

## Programmatic API

Use the library inside your Node.js scripts or CI helpers.

```ts
import { validatePackages, createDefaultConfig } from '@josepderiu/npm-minimum-age-validation';

const config = createDefaultConfig();
config.minimumAgeHours = 48; // 48h minimum age
config.trustedPackages = ['@my-org/*', '@types/*'];

const result = await validatePackages(config);
if (!result.success) {
  console.error(`${result.violations.length} packages too new`);
  process.exit(1);
}
```

## Configuration

You can generate a default configuration with the `config` CLI command or programmatically via `createDefaultConfig()`.

Common configuration options (high level):

- `minimumAgeHours` (number) – minimum allowed age in hours for packages (defaults to 24)
- `trustedPackages` (string[]) – package name patterns that are exempt from the age check
- `registry` – registry configuration (url, concurrency, cacheEnabled)
- `output` – output settings (format: `console`|`json`, verbose, logLevel)

> [!TIP]
> Use `--dry-run` in CI to surface warnings without failing a pipeline while you tune rules.

## Output

Supported formats: `console` (default) and `json`.

- Console: human readable messages and per-violation lines when failures occur
- JSON: machine-consumable object including summary and `violations[]` for easier automation

## Development

Scripts are available via `package.json`:

- `npm run build` — compile TypeScript to `dist/`
- `npm test` — run unit tests with Jest
- `npm run lint` — run ESLint
- `npm run format` — run Prettier

Example:

```bash
# install deps
npm ci

# build and test
npm run build
npm test
```

## Contributing & Support

Contributions and bug reports are welcome. Please open issues or PRs on the repository.

> [!WARNING]
> This tool performs network requests to the npm registry. When used in CI, consider enabling or providing a registry cache and limiting concurrency to avoid throttling.

## Security

This project is focused on supply-chain safety. It favors pinned dependencies and recommends running the `security:check-versions` npm script in CI to ensure devDependencies and dependencies are pinned.

## Author

Josep de Riu (<jderiu@gmail.com>)
