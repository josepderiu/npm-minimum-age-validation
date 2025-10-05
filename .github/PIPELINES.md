# GitHub Actions Pipelines

This repository uses GitHub Actions for automated CI/CD. Here's what's configured:

## 📋 Pipeline Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Developer Workflow                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Create PR      │
                    └─────────────────┘
                              │
                              ▼
        ┌────────────────────────────────────────┐
        │  PR Validation Pipeline (REQUIRED)     │
        │  • Lint & Format Check                 │
        │  • Build TypeScript                    │
        │  • Test Matrix (Node 16/18/20)         │
        │  • Security Audit                      │
        │  • Coverage Report                     │
        └────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Merge to main  │
                    └─────────────────┘
                              │
                              ▼
        ┌────────────────────────────────────────┐
        │  CI Pipeline (on push to main)         │
        │  • Full validation suite               │
        │  • Build artifacts upload              │
        │  • Coverage tracking                   │
        └────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ npm version     │
                    │ git push --tags │
                    └─────────────────┘
                              │
                              ▼
        ┌────────────────────────────────────────┐
        │  Release Pipeline (on tag v*.*.*)      │
        │  • Pre-release validation              │
        │  • Publish to NPM                      │
        │  • Create GitHub Release               │
        │  • Upload package artifacts            │
        └────────────────────────────────────────┘
```

## 🔧 Pipeline Files

### 1. **pr-validation.yml** - Pull Request Checks
- **Trigger**: PRs to main/develop
- **Purpose**: Quality gates before merge
- **Jobs**:
  - Lint & Format Check
  - TypeScript Build
  - Test Matrix (Node 16.x, 18.x, 20.x)
  - Security Audit
  - PR Summary

### 2. **ci.yml** - Continuous Integration
- **Trigger**: Push to main branch
- **Purpose**: Validate main branch health
- **Jobs**:
  - Full validation suite
  - Build artifacts upload
  - Coverage reporting

### 3. **release.yml** - Release & NPM Publish
- **Trigger**: Git tags matching `v*.*.*`
- **Purpose**: Automated NPM publishing
- **Jobs**:
  - Pre-release validation
  - NPM publish with provenance
  - GitHub Release creation
  - Package artifact upload
- **Environment**: `npm-production`

### 4. **codeql.yml** - Security Scanning
- **Trigger**: PR, push to main, weekly schedule, manual
- **Purpose**: Advanced security analysis
- **Jobs**:
  - CodeQL analysis for JavaScript/TypeScript
  - Security vulnerability detection

### 5. **dependabot.yml** - Dependency Updates
- **Schedule**: Weekly (Mondays at 6 AM UTC)
- **Purpose**: Automated dependency updates
- **Features**:
  - NPM package updates
  - GitHub Actions version updates
  - Grouped patch updates
  - Automatic PR creation

## 🔐 Required Secrets

Configure these in GitHub repository settings:

| Secret | Purpose | How to Get |
|--------|---------|------------|
| `NPM_TOKEN` | Publish to NPM registry | https://www.npmjs.com/settings/~/tokens (Automation token) |

**Setup Steps**:
1. Go to https://www.npmjs.com/settings/~/tokens
2. Create new "Automation" token with "Publish" permission
3. Copy the token
4. Go to GitHub repo → Settings → Secrets → Actions
5. Create new secret: `NPM_TOKEN` with the copied token

## 🎯 GitHub Environments

The release pipeline uses the `npm-production` environment:

**To configure**:
1. Go to repo Settings → Environments
2. Create environment: `npm-production`
3. (Optional) Add protection rules:
   - Required reviewers
   - Wait timer
   - Deployment branches: `main` only

## 📊 Status Badges

Add these to your README.md:

```markdown
[![CI](https://github.com/josepderiu/npm-minimum-age-validation/actions/workflows/ci.yml/badge.svg)](https://github.com/josepderiu/npm-minimum-age-validation/actions/workflows/ci.yml)
[![CodeQL](https://github.com/josepderiu/npm-minimum-age-validation/actions/workflows/codeql.yml/badge.svg)](https://github.com/josepderiu/npm-minimum-age-validation/actions/workflows/codeql.yml)
[![npm version](https://badge.fury.io/js/@josepderiu%2Fnpm-minimum-age-validation.svg)](https://www.npmjs.com/package/@josepderiu/npm-minimum-age-validation)
```

## 🚀 Quick Start

### For Contributors

1. Create feature branch
2. Make changes
3. Create PR → Automatic validation runs
4. Address any failures
5. Merge when all checks pass

### For Maintainers (Releases)

```bash
# 1. Update CHANGELOG.md
nano CHANGELOG.md

# 2. Bump version
npm version patch  # or minor/major

# 3. Push tag (triggers release)
git push origin main --tags
```

See [RELEASE_PROCESS.md](RELEASE_PROCESS.md) for full release documentation.

## 🔍 Monitoring

- **Actions Tab**: https://github.com/josepderiu/npm-minimum-age-validation/actions
- **Security Tab**: https://github.com/josepderiu/npm-minimum-age-validation/security
- **NPM Package**: https://www.npmjs.com/package/@josepderiu/npm-minimum-age-validation

## 🛠️ Troubleshooting

### Pipeline failing?
- Check the Actions tab for detailed logs
- Common issues:
  - Linting errors → Run `npm run lint:fix`
  - Test failures → Run `npm test` locally
  - Build errors → Run `npm run build` locally
  - Security audit → Run `npm audit`

### Release not working?
- Verify `NPM_TOKEN` secret is set correctly
- Check tag format matches `v*.*.*` (e.g., `v1.0.0`)
- Ensure package.json version matches tag version
- Check workflow run logs for errors

### Dependabot PRs?
- Review changes carefully
- Run tests locally if needed
- Merge when ready (triggers CI)

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [NPM Provenance](https://docs.npmjs.com/generating-provenance-statements)
- [CodeQL](https://codeql.github.com/)
- [Dependabot](https://docs.github.com/en/code-security/dependabot)
