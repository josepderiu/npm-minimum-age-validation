# NPM Publishing Setup Guide

Complete guide to configure GitHub Actions for automated NPM publishing.

## Prerequisites

- [x] GitHub repository with workflows configured
- [ ] NPM account (create at https://www.npmjs.com)
- [ ] Package name available on NPM

---

## Step 1: Verify Package Configuration

### Check package.json
Ensure your package.json has the required fields:

```bash
cat package.json | grep -E '"name"|"version"|"main"|"types"|"files"'
```

**Required fields:**
- `name`: Must be unique on NPM (or scoped like `@username/package-name`)
- `version`: Semantic version (e.g., `1.0.0`)
- `main`: Entry point (e.g., `dist/index.js`)
- `types`: TypeScript definitions (e.g., `dist/index.d.ts`)
- `files`: What to publish (e.g., `["dist", "README.md"]`)

### Verify build output
```bash
npm run build
ls -la dist/
```

Ensure `dist/` contains:
- Compiled JavaScript files
- TypeScript declaration files (.d.ts)
- Source maps (optional)

---

## Step 2: Create NPM Access Token

### 2.1 Login to NPM
```bash
# Open in browser
open https://www.npmjs.com/login
```

### 2.2 Generate Automation Token
1. Go to: https://www.npmjs.com/settings/YOUR_USERNAME/tokens
2. Click **"Generate New Token"**
3. Select **"Automation"** token type (required for CI/CD)
4. Give it a name: `github-actions-npm-minimum-age-validation`
5. Click **"Generate Token"**
6. **COPY THE TOKEN IMMEDIATELY** (you won't see it again!)

**Token format:** `npm_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

⚠️ **Security Notes:**
- **Automation tokens** can publish packages (required for CI/CD)
- **Classic tokens** are deprecated (don't use them)
- Never commit tokens to git
- Rotate tokens regularly (every 6-12 months)

---

## Step 3: Add NPM_TOKEN to GitHub Secrets

### 3.1 Navigate to Repository Secrets
```bash
# Open in browser
open https://github.com/josepderiu/npm-minimum-age-validation/settings/secrets/actions
```

Or manually:
1. Go to your repository on GitHub
2. Click **Settings** (top menu)
3. Scroll to **Security** section in left sidebar
4. Click **Secrets and variables** → **Actions**

### 3.2 Create New Repository Secret
1. Click **"New repository secret"** (green button)
2. Fill in the form:
   - **Name:** `NPM_TOKEN` (exact name, case-sensitive!)
   - **Secret:** Paste your NPM automation token
3. Click **"Add secret"**

### 3.3 Verify Secret Added
You should see:
```
NPM_TOKEN                   Updated now by @josepderiu
```

✅ **Secret is now available to all workflows in this repository**

---

## Step 4: Configure GitHub Environment (Optional but Recommended)

GitHub Environments add an extra layer of protection for production deployments.

### 4.1 Create npm-production Environment
```bash
# Open in browser
open https://github.com/josepderiu/npm-minimum-age-validation/settings/environments
```

Or manually:
1. Go to **Settings** → **Environments**
2. Click **"New environment"**
3. Name: `npm-production` (exact name!)
4. Click **"Configure environment"**

### 4.2 Configure Environment Protection Rules

**Recommended settings:**

✅ **Required reviewers:**
- Add yourself: `@josepderiu`
- This requires manual approval before publishing
- Prevents accidental releases

✅ **Wait timer (optional):**
- Set to 5-10 minutes
- Gives you time to cancel bad releases
- Can be bypassed by reviewers

✅ **Deployment branches:**
- Select "Protected branches only"
- Or "Selected branches" → add `main`
- Prevents releases from feature branches

✅ **Environment secrets (optional):**
- You can add NPM_TOKEN here instead of repository-level
- Provides more granular access control
- Only this environment can use the token

### 4.3 Add Environment Secret (Alternative)

If you want tighter security:
1. In `npm-production` environment settings
2. Click **"Add secret"**
3. Name: `NPM_TOKEN`
4. Value: Your NPM automation token
5. Click **"Add secret"**

**Note:** Remove the repository-level NPM_TOKEN if using environment secrets.

---

## Step 5: Test the Release Workflow (Dry Run)

Before doing a real release, let's test the workflow.

### 5.1 Trigger Workflow Manually (Without Publishing)

Edit `.github/workflows/release.yml` temporarily:

```yaml
# Add this to the publish-npm job
- name: Dry run NPM publish
  run: npm publish --dry-run
```

### 5.2 Create Test Tag
```bash
# Create and push a test tag
git tag v0.0.1-test
git push origin v0.0.1-test
```

### 5.3 Monitor Workflow Execution
```bash
# Open in browser
open https://github.com/josepderiu/npm-minimum-age-validation/actions
```

Check that:
- ✅ Workflow triggered by tag
- ✅ All validation steps pass
- ✅ Dry run completes successfully
- ✅ No errors in logs

### 5.4 Clean Up Test Tag
```bash
# Delete test tag
git tag -d v0.0.1-test
git push origin :refs/tags/v0.0.1-test
```

---

## Step 6: Publish Your First Release

### 6.1 Ensure Clean Working Directory
```bash
git status  # Should be clean
npm run lint:all  # Should pass
npm test  # Should pass
npm run build  # Should succeed
```

### 6.2 Verify Current Version
```bash
npm version  # Check current version
cat package.json | grep version
```

### 6.3 Bump Version and Create Tag

**For patch release (1.0.0 → 1.0.1):**
```bash
npm version patch -m "chore(release): %s"
```

**For minor release (1.0.0 → 1.1.0):**
```bash
npm version minor -m "feat(release): %s"
```

**For major release (1.0.0 → 2.0.0):**
```bash
npm version major -m "chore(release): %s [breaking]"
```

This will:
- Update `package.json` version
- Create a git commit
- Create a git tag (e.g., `v1.0.1`)

### 6.4 Push to GitHub (Triggers Release)
```bash
# Push commits and tags
git push origin main --tags
```

This triggers the release workflow automatically!

### 6.5 Monitor Release Progress
```bash
# Open Actions page
open https://github.com/josepderiu/npm-minimum-age-validation/actions/workflows/release.yml
```

Watch for:
1. ✅ **Validate job** - Runs tests, linting, build
2. ✅ **Publish NPM job** - Publishes to NPM registry
3. ✅ **Create GitHub Release** - Creates release with changelog
4. ✅ **Notify job** - Sends notifications (if configured)

### 6.6 Verify Publication

**Check NPM:**
```bash
# View your published package
open https://www.npmjs.com/package/npm-minimum-age-validation

# Or search
npm view npm-minimum-age-validation
```

**Check GitHub Release:**
```bash
# View GitHub releases
open https://github.com/josepderiu/npm-minimum-age-validation/releases
```

---

## Step 7: Verify Installation

Test that others can install your package:

```bash
# In a new directory
cd /tmp
mkdir test-install && cd test-install
npm init -y
npm install npm-minimum-age-validation

# Test import
node -e "const validator = require('npm-minimum-age-validation'); console.log(validator);"
```

---

## Common Issues & Troubleshooting

### Issue: "npm ERR! 403 Forbidden - PUT https://registry.npmjs.org/..."

**Cause:** Invalid NPM_TOKEN or insufficient permissions

**Fix:**
1. Verify token is "Automation" type (not Classic)
2. Check token has publish permissions
3. Regenerate token if needed
4. Update GitHub secret with new token

### Issue: "npm ERR! 404 Not Found - PUT https://registry.npmjs.org/..."

**Cause:** Package name doesn't exist or you don't own it

**Fix:**
1. Check package name availability: `npm view YOUR_PACKAGE_NAME`
2. If taken, use scoped name: `@josepderiu/npm-minimum-age-validation`
3. Update `package.json` name field
4. Retry release

### Issue: "npm ERR! You must verify your email..."

**Cause:** NPM account email not verified

**Fix:**
1. Check your email for verification link
2. Or go to: https://www.npmjs.com/settings/YOUR_USERNAME/profile
3. Click "Resend verification email"
4. Verify email and retry

### Issue: Workflow fails with "Version mismatch"

**Cause:** package.json version doesn't match git tag

**Fix:**
```bash
# Check versions
git describe --tags  # Git tag version
grep version package.json  # package.json version

# They must match! If not:
npm version 1.2.3  # Set correct version
git push origin main --tags
```

### Issue: "npm ERR! 402 Payment Required"

**Cause:** Trying to publish private package without paid NPM account

**Fix:**
1. Make package public in package.json:
   ```json
   {
     "private": false,
     "publishConfig": {
       "access": "public"
     }
   }
   ```
2. Or upgrade to NPM Pro/Teams for private packages

---

## Security Best Practices

### ✅ Do's
- ✅ Use Automation tokens (not Classic)
- ✅ Rotate tokens every 6-12 months
- ✅ Use GitHub environment protection
- ✅ Enable 2FA on NPM account
- ✅ Use `--provenance` flag (enables transparency)
- ✅ Review releases before approving
- ✅ Monitor npm-audit security advisories

### ❌ Don'ts
- ❌ Never commit tokens to git
- ❌ Don't share tokens in Slack/email
- ❌ Don't use personal access tokens in CI
- ❌ Don't skip version bumps
- ❌ Don't publish from local machine (use CI)
- ❌ Don't publish without testing

---

## Release Checklist

Before every release:

- [ ] All tests pass locally (`npm test`)
- [ ] Lint passes (`npm run lint:all`)
- [ ] Build succeeds (`npm run build`)
- [ ] CHANGELOG.md updated with changes
- [ ] Version bumped correctly (patch/minor/major)
- [ ] Git tag matches package.json version
- [ ] No uncommitted changes
- [ ] NPM_TOKEN secret configured
- [ ] GitHub Actions workflows passing

After every release:

- [ ] Verify package published to NPM
- [ ] Test installation: `npm install npm-minimum-age-validation`
- [ ] Verify GitHub release created
- [ ] Check release notes are correct
- [ ] Monitor for issues (GitHub/NPM)

---

## Next Steps

1. **Configure NPM_TOKEN** (required) - See Step 2 & 3
2. **Create npm-production environment** (recommended) - See Step 4
3. **Test dry run** (recommended) - See Step 5
4. **Publish first release** - See Step 6
5. **Add status badges** to README.md
6. **Set up Codecov** for coverage tracking (optional)
7. **Configure notifications** for releases (optional)

---

## Useful Commands

```bash
# Check current published version
npm view npm-minimum-age-validation version

# Check all published versions
npm view npm-minimum-age-validation versions

# Unpublish version (within 72 hours only!)
npm unpublish npm-minimum-age-validation@1.0.0

# Deprecate a version
npm deprecate npm-minimum-age-validation@1.0.0 "Critical bug, upgrade to 1.0.1"

# View package info
npm info npm-minimum-age-validation

# Check who can publish
npm owner ls npm-minimum-age-validation
```

---

## Resources

- **NPM Documentation**: https://docs.npmjs.com/
- **Publishing Packages**: https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry
- **Automation Tokens**: https://docs.npmjs.com/creating-and-viewing-access-tokens
- **GitHub Actions**: https://docs.github.com/en/actions
- **Semantic Versioning**: https://semver.org/

---

**Ready to publish? Start with Step 2!** 🚀
