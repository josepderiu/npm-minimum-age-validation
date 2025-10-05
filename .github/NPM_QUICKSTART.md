# NPM Publishing Quick Start

Complete guide to set up NPM publishing and automated releases with changelog generation.

## Prerequisites

- NPM account with publishing rights
- GitHub repository with admin access
- Node.js and npm installed locally

---

## Part 1: Initial Setup (5 minutes)

### Step 1: Get NPM Token

1. Visit https://www.npmjs.com/settings/YOUR_USERNAME/tokens
2. Generate new token → Select **"Automation"** type
3. Copy the token (starts with `npm_`)

### Step 2: Add GitHub Secret

1. Go to repository **Settings → Secrets and variables → Actions**
2. Click **"New repository secret"**
3. Name: `NPM_TOKEN` (exactly this!)
4. Value: Paste your NPM token
5. Click **"Add secret"**

### Step 3: Verify Configuration

```bash
# Ensure package.json has public access
grep -A2 "publishConfig" package.json
# Should show: "access": "public"

# Verify workflows exist
ls .github/workflows/
# Should see: pr-validation.yml, ci.yml, release.yml, codeql.yml
```

---

## Part 2: Automated Releases with Changelog (2 minutes per release)

This project uses **standard-version** for automated changelog generation and version management.

### How It Works

When you run `npm run release`:
1. ✅ Analyzes git commits since last release
2. ✅ Determines version bump (patch/minor/major) automatically
3. ✅ Updates CHANGELOG.md with categorized changes
4. ✅ Bumps version in package.json
5. ✅ Creates git commit: `chore(release): v1.0.0`
6. ✅ Creates git tag: `v1.0.0`

### Commit Message Format (Conventional Commits)

Use this format for automatic changelog generation:

| Type       | Description          | Changelog Section | Version Bump |
| ---------- | -------------------- | ----------------- | ------------ |
| `feat:`    | New feature          | Features          | Minor        |
| `fix:`     | Bug fix              | Bug Fixes         | Patch        |
| `perf:`    | Performance          | Performance       | Patch        |
| `docs:`    | Documentation        | Documentation     | -            |
| `refactor:` | Code refactoring    | Code Refactoring  | -            |
| `chore:`   | Maintenance          | (hidden)          | -            |
| `test:`    | Tests                | (hidden)          | -            |
| `ci:`      | CI/CD changes        | (hidden)          | -            |

**Examples:**
```bash
git commit -m "feat: add workspace support"
git commit -m "fix: prevent race condition"
git commit -m "docs: update API documentation"
git commit -m "chore: update dependencies"
```

### Breaking Changes

To trigger a **major** version bump, add `BREAKING CHANGE:` in commit footer:

```bash
git commit -m "feat: redesign API

BREAKING CHANGE: The old API has been removed."
```

This bumps from 1.0.0 → 2.0.0 and adds a "BREAKING CHANGES" section to changelog.

### Release Commands

```bash
# Automatic version bump (recommended)
npm run release

# Manual version bump
npm run release:patch    # 1.0.0 → 1.0.1
npm run release:minor    # 1.0.0 → 1.1.0
npm run release:major    # 1.0.0 → 2.0.0

# Preview changes without modifying files
npm run release -- --dry-run

# First release
npm run release -- --first-release --release-as 1.0.0
```

### Complete Release Workflow

```bash
# 1. Make changes with conventional commits
git add .
git commit -m "feat: add new feature"
git commit -m "fix: resolve bug"

# 2. Run tests locally
npm test
npm run lint:all

# 3. Create release (auto-updates CHANGELOG.md)
npm run release

# 4. Review changes
cat CHANGELOG.md
git show HEAD

# 5. Push to trigger GitHub Actions
git push --follow-tags origin main

# 6. Monitor deployment
# Visit: https://github.com/OWNER/REPO/actions
```

### What Happens After Push

1. GitHub Actions detects the tag
2. Runs all tests and checks
3. Builds the package
4. Publishes to NPM with provenance
5. Creates GitHub release with changelog

---

## Part 3: Troubleshooting

### "No commits since last release"

You need commits after the last tag:
```bash
git log --oneline
git tag  # Check last tag
```

### Wrong Version Bump

Manually specify version:
```bash
npm run release -- --release-as 1.2.3
```

### Need to Undo Before Pushing

```bash
git tag -d v1.0.0           # Remove tag
git reset --hard HEAD~1      # Reset commit
```

### Package Not Publishing

Check:
1. `NPM_TOKEN` secret is set correctly
2. Package name is available (or you own it)
3. `package.json` has `"access": "public"` for scoped packages
4. GitHub Actions logs for errors

---

## Configuration Files

- `.versionrc.json` - Controls changelog generation format
- `.github/workflows/release.yml` - Release automation
- `.github/dependabot.yml` - Dependency updates
- `CHANGELOG.md` - Auto-generated changelog

---

## Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [standard-version](https://github.com/conventional-changelog/standard-version)
- [Semantic Versioning](https://semver.org/)
