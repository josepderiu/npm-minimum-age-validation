# Release Process

This document describes how to release a new version of `@josepderiu/npm-minimum-age-validation` to NPM.

## Prerequisites

1. ✅ All tests passing on `main` branch
2. ✅ CHANGELOG.md updated with release notes
3. ✅ NPM_TOKEN secret configured in GitHub repository settings

## Release Steps

### 1. Update Version and Changelog

```bash
# Ensure you're on main and up to date
git checkout main
git pull origin main

# Update CHANGELOG.md with new version section
# Example: Add ## [1.0.1] - 2025-10-05
nano CHANGELOG.md

# Bump version in package.json
npm version patch  # for bug fixes
# OR
npm version minor  # for new features
# OR
npm version major  # for breaking changes

# This creates a version commit and git tag automatically
```

### 2. Push to GitHub

```bash
# Push the version commit and tag
git push origin main
git push origin --tags
```

### 3. Automated Release

The GitHub Actions `release.yml` workflow will automatically:

1. ✅ Run all quality checks (lint, format, test, security audit)
2. ✅ Build the package
3. ✅ Verify version matches tag
4. ✅ Publish to NPM registry
5. ✅ Create GitHub Release with changelog
6. ✅ Upload package artifact (.tgz)

### 4. Verify Release

After the workflow completes:

1. Check NPM: https://www.npmjs.com/package/@josepderiu/npm-minimum-age-validation
2. Check GitHub Releases: https://github.com/josepderiu/npm-minimum-age-validation/releases
3. Test installation: `npm install @josepderiu/npm-minimum-age-validation@latest`

## Pre-release (Beta/Alpha)

For pre-release versions:

```bash
# Create pre-release version
npm version prerelease --preid=beta
# Example: 1.0.0 -> 1.0.1-beta.0

# Or for specific pre-release
npm version 1.1.0-beta.1

# Push
git push origin main --tags
```

The workflow will detect pre-release versions and mark the GitHub Release as "Pre-release".

## Rollback

If a release needs to be rolled back:

```bash
# Deprecate the bad version on NPM
npm deprecate @josepderiu/npm-minimum-age-validation@1.0.1 "This version has critical bugs, use 1.0.0 instead"

# Publish a new patch version with fixes
npm version patch
git push origin main --tags
```

## Troubleshooting

### Release workflow failed

1. Check the workflow run logs in GitHub Actions
2. Common issues:
   - NPM_TOKEN expired or invalid
   - Tests failing
   - Version mismatch between package.json and git tag
   - Network timeout during npm publish

### Package.json version doesn't match tag

```bash
# Delete the local and remote tag
git tag -d v1.0.1
git push origin :refs/tags/v1.0.1

# Fix package.json version
npm version 1.0.1 --no-git-tag-version

# Commit and create tag again
git add package.json package-lock.json
git commit -m "chore: bump version to 1.0.1"
git tag v1.0.1
git push origin main --tags
```

## Version Numbering

Follow [Semantic Versioning](https://semver.org/):

- **MAJOR** (X.0.0): Breaking changes
- **MINOR** (0.X.0): New features, backwards compatible
- **PATCH** (0.0.X): Bug fixes, backwards compatible

### Examples

- `1.0.0` → `1.0.1`: Bug fix (patch)
- `1.0.1` → `1.1.0`: New feature (minor)
- `1.1.0` → `2.0.0`: Breaking change (major)
- `1.0.0` → `1.1.0-beta.0`: Pre-release

## NPM Provenance

The release workflow publishes with `--provenance` flag, which:

- Links the published package to the GitHub repository
- Shows source code location and build attestation
- Increases trust and security for package consumers
- Provides transparency about package origin

Learn more: https://docs.npmjs.com/generating-provenance-statements
