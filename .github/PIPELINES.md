# CI/CD Pipelines & Automation

Complete reference for GitHub Actions workflows, Dependabot, and automation configuration.

## Workflows Overview

### 1. PR Validation (`.github/workflows/pr-validation.yml`)

**Trigger:** Pull request to any branch

**Purpose:** Ensure code quality before merging

**Jobs:**
- **Lint & Format:** ESLint and Prettier checks
- **Build:** TypeScript compilation
- **Test:** Run tests on Node.js 20.x and 22.x with coverage
- **Security Audit:** Check for vulnerabilities
- **PR Summary:** Post results as PR comment

**Node.js Versions:** 20.x (minimum), 22.x (latest LTS)

**Estimated time:** ~3-5 minutes

### 2. CI Pipeline (`.github/workflows/ci.yml`)

**Trigger:** Push to `main` branch, manual dispatch

**Purpose:** Continuous validation and artifact generation

**Jobs:**
- **Validate:** Lint, format, build, test with coverage on Node.js 20.x
- **Test Matrix:** Run tests on Node.js 20.x and 22.x
- **Artifacts:** Build and coverage upload (30-day retention)
- **Coverage:** Upload to Codecov (updates main branch coverage badge)

**Estimated time:** ~5-7 minutes

### 3. Release Pipeline (`.github/workflows/release.yml`)

**Trigger:** Tag push matching `v*.*.*` (e.g., `v1.0.0`)

**Purpose:** Automated NPM publishing

**Jobs:**
- Pre-release validation (tests, lint, build)
- Version verification (tag matches package.json)
- NPM publish with provenance
- GitHub release creation with changelog

**Estimated time:** ~3-4 minutes

**Environment:** `npm-production` (optional, for deployment history)

### 4. CodeQL Security Scanning (`.github/workflows/codeql.yml`)

**Trigger:** 
- Weekly schedule (Mondays at 6 AM UTC)
- Push to `main`
- Pull requests to `main`

**Purpose:** Automated security vulnerability detection

**Languages:** JavaScript, TypeScript

**Estimated time:** ~2-3 minutes

---

## Dependabot Configuration

### What It Does

Automatically creates PRs for:
- NPM package updates (weekly)
- GitHub Actions updates (weekly)
- Security vulnerabilities (immediate)

### Current Settings

**NPM Dependencies:**
- Schedule: Weekly on Mondays at 6 AM
- Grouping: All patch updates in single PR
- Ignores: Major version updates (for stability)
- Labels: `dependencies`, `automated`

**GitHub Actions:**
- Schedule: Weekly on Mondays
- Labels: `github-actions`, `automated`

### Managing Dependabot PRs

**Review Process:**
1. Dependabot creates PR with update
2. CI runs automatically
3. Review changes and CI results
4. Merge if tests pass

**Dependabot Commands** (comment on PRs):
```
@dependabot rebase          # Rebase PR
@dependabot merge           # Auto-merge after CI
@dependabot squash and merge # Squash and merge
@dependabot close           # Close PR
@dependabot ignore this major version
@dependabot ignore this dependency
```

**Security Updates:**
- High priority - merge quickly
- Labeled with `security`
- May bypass normal grouping

### Customization

Edit `.github/dependabot.yml` to:
- Change update frequency (`daily`, `weekly`, `monthly`)
- Adjust grouping strategy
- Allow/ignore specific dependencies
- Modify PR limit (`open-pull-requests-limit`)

---

## Workflow Files Reference

| File                           | Trigger              | Purpose                    |
| ------------------------------ | -------------------- | -------------------------- |
| `pr-validation.yml`            | Pull requests        | Code quality gates         |
| `ci.yml`                       | Push to main         | Continuous validation      |
| `release.yml`                  | Tag `v*.*.*`         | NPM publishing             |
| `codeql.yml`                   | Schedule/push/PR     | Security scanning          |
| `.github/dependabot.yml`       | Weekly schedule      | Dependency updates         |

---

## Workflow Customization Examples

### Node.js Version

All workflows use Node.js 20.x as the minimum supported version. To update:

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20.x'  # Change to desired version
```

**Note:** This project requires Node.js >=20.0.0 as specified in `package.json` engines field.

### Add Environment Variables

Add to workflow:
```yaml
env:
  NODE_ENV: production
  CUSTOM_VAR: value
```

### Adjust Timeout

```yaml
jobs:
  test:
    timeout-minutes: 15  # Default is 360
```

### Change Artifact Retention

```yaml
- uses: actions/upload-artifact@v4
  with:
    name: dist
    retention-days: 7  # Default is 30
```

---

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Dependabot Configuration](https://docs.github.com/en/code-security/dependabot)
- [GitHub Free Features](https://docs.github.com/en/get-started/learning-about-github/githubs-products#github-free-for-personal-accounts)
- [Branch Protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches)
