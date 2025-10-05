# NPM Publishing Quick Start 🚀

**5-minute setup to publish your package to NPM**

---

## Quick Setup Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. CREATE NPM TOKEN                                          │
│    ↓                                                         │
│    https://www.npmjs.com/settings/YOUR_USERNAME/tokens      │
│    → Generate New Token → Automation                        │
│    → Copy token (npm_xxxxx...)                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. ADD TO GITHUB SECRETS                                     │
│    ↓                                                         │
│    GitHub Repo → Settings → Secrets → Actions               │
│    → New repository secret                                  │
│    Name: NPM_TOKEN                                           │
│    Value: [paste token]                                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. PUBLISH YOUR FIRST RELEASE                                │
│    ↓                                                         │
│    npm version patch                                         │
│    git push origin main --tags                               │
│    → Check GitHub Actions for release progress              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. VERIFY PUBLISHED                                          │
│    ↓                                                         │
│    https://www.npmjs.com/package/@josepderiu/npm-minimum-age-validation │
│    npm install @josepderiu/npm-minimum-age-validation       │
└─────────────────────────────────────────────────────────────┘
```

---

## Step 1: Get Your NPM Token (2 minutes)

### Option A: Using Browser
```bash
# Open NPM tokens page
xdg-open https://www.npmjs.com/settings/$(npm whoami)/tokens
```

### Option B: Manual Navigation
1. Login to https://www.npmjs.com
2. Click your avatar → **Access Tokens**
3. Click **"Generate New Token"**
4. Select **"Automation"** (required for CI/CD!)
5. Name it: `github-actions-npm-minimum-age-validation`
6. Click **"Generate Token"**
7. **COPY THE TOKEN** (starts with `npm_`)

⚠️ **Save it immediately - you can't see it again!**

---

## Step 2: Add Token to GitHub (1 minute)

### Quick Link
```bash
# Open GitHub secrets page directly
xdg-open https://github.com/josepderiu/npm-minimum-age-validation/settings/secrets/actions
```

### Manual Steps
1. Go to your GitHub repository
2. Click **Settings** (top menu)
3. Scroll to **Secrets and variables** → **Actions**
4. Click **"New repository secret"**
5. Fill in:
   - **Name:** `NPM_TOKEN` (exactly this!)
   - **Secret:** Paste your NPM token
6. Click **"Add secret"**

✅ **Done! Secret is configured**

---

## Step 3: Publish Your First Release (1 minute)

### Pre-flight Check
```bash
# Ensure everything is clean
git status                 # Should be clean
npm test                   # Should pass
npm run lint:all           # Should pass
npm run build              # Should succeed
```

### Create Release
```bash
# Option 1: Patch release (1.0.0 → 1.0.1)
npm version patch -m "chore(release): %s"

# Option 2: Minor release (1.0.0 → 1.1.0)
npm version minor -m "feat(release): %s"

# Option 3: Major release (1.0.0 → 2.0.0)
npm version major -m "chore(release): %s [breaking]"

# Push to trigger release workflow
git push origin main --tags
```

### Monitor Release
```bash
# Watch the workflow run
xdg-open https://github.com/josepderiu/npm-minimum-age-validation/actions
```

You'll see:
- ✅ Validate (tests, lint, build)
- ✅ Publish NPM (publishes to npm registry)
- ✅ Create GitHub Release (creates release with changelog)
- ✅ Notify (sends notifications)

⏱️ **Takes ~2-3 minutes to complete**

---

## Step 4: Verify Publication (1 minute)

### Check NPM Registry
```bash
# View your package on NPM
xdg-open https://www.npmjs.com/package/@josepderiu/npm-minimum-age-validation

# Or check from CLI
npm view @josepderiu/npm-minimum-age-validation
```

### Test Installation
```bash
# Test in a temporary directory
cd /tmp
mkdir test-install && cd test-install
npm init -y
npm install @josepderiu/npm-minimum-age-validation

# Verify it works
npx validate-packages --help
```

### Check GitHub Release
```bash
# View GitHub releases page
xdg-open https://github.com/josepderiu/npm-minimum-age-validation/releases
```

---

## 🎉 You're Done!

Your package is now:
- ✅ Published to NPM registry
- ✅ Installable by anyone: `npm install @josepderiu/npm-minimum-age-validation`
- ✅ Automatically released on new tags
- ✅ Secured with GitHub Actions
- ✅ Protected with provenance

---

## What Happens on Each Release?

```
git push --tags
      ↓
┌─────────────────┐
│ GitHub Actions  │
│ Trigger         │
└─────────────────┘
      ↓
┌─────────────────┐
│ Run Tests       │  (Jest, coverage)
│ Run Linter      │  (ESLint)
│ Build TypeScript│  (tsc)
└─────────────────┘
      ↓
┌─────────────────┐
│ Publish to NPM  │  (with provenance)
└─────────────────┘
      ↓
┌─────────────────┐
│ Create GitHub   │  (with changelog)
│ Release         │
└─────────────────┘
      ↓
🎉 Package Live!
```

---

## Common Commands

```bash
# Check if package name is available
npm view @josepderiu/npm-minimum-age-validation

# Check your published versions
npm view @josepderiu/npm-minimum-age-validation versions

# Check who can publish
npm owner ls @josepderiu/npm-minimum-age-validation

# Test package locally before publishing
npm pack
# Creates: josepderiu-npm-minimum-age-validation-1.0.0.tgz

# Install from local tarball
npm install ./josepderiu-npm-minimum-age-validation-1.0.0.tgz
```

---

## Troubleshooting

### "403 Forbidden" Error
- Check NPM_TOKEN is **Automation** type (not Classic)
- Regenerate token and update GitHub secret

### "404 Not Found" Error  
- Package name might be taken
- Check: `npm view @josepderiu/npm-minimum-age-validation`
- Your package is scoped (`@josepderiu/`), so it should be fine

### "Version mismatch" Error
```bash
# Check versions match
git describe --tags        # Tag version
grep version package.json  # Package version

# Fix if needed
npm version 1.0.1
git push origin main --tags
```

### "Email not verified" Error
- Go to: https://www.npmjs.com/settings/YOUR_USERNAME/profile
- Click "Resend verification email"
- Verify and retry

---

## Next Steps

1. ✅ **Add status badges** to README.md
2. ✅ **Set up Codecov** for coverage tracking
3. ✅ **Configure branch protection** on main
4. ✅ **Enable Dependabot** alerts (already configured!)
5. ✅ **Add more keywords** to package.json for discoverability

---

## Resources

- **Full Setup Guide**: `.github/NPM_PUBLISHING_SETUP.md`
- **Release Process**: `.github/RELEASE_PROCESS.md`
- **Pipeline Docs**: `.github/PIPELINES.md`
- **NPM Docs**: https://docs.npmjs.com/
- **Your Package**: https://www.npmjs.com/package/@josepderiu/npm-minimum-age-validation

---

**Total Setup Time: ~5 minutes** ⏱️

**Ready? Start with Step 1!** 🚀
