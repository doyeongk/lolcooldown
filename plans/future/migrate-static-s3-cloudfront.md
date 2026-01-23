# S3/CloudFront Migration — Effort Estimate

## Context

**Current state:** Self-hosted Next.js + PostgreSQL on Docker (VPS ~$10-20/month)

**Target state:** Static site on S3 + CloudFront (~$1-2/month)

**Why static works:**
- All game logic is client-side (shuffle arrays, pick random abilities)
- No user accounts, leaderboards, or dynamic content
- API route just fetches abilities and calls `Math.random()`

**Setup:**
- CDK in new AWS member accounts (not root/management account)
- GitHub Actions with OIDC authentication (no long-lived credentials)
- Test + Prod accounts for environment isolation
- Local dev server (`npm run dev`) unchanged

---

## Effort Summary

| Setup | Effort |
|-------|--------|
| Single AWS account (original plan) | 2.5-3 hours |
| **Multi-account with OIDC** | **6-8 hours** |

Complexity increase: ~2.5x due to account separation, OIDC setup, and environment routing.

---

## Work Breakdown

### 1. AWS Account Setup — 2.5 hours

*Can run in parallel with application changes (Section 3)*

| Task | Effort | Details |
|------|--------|---------|
| Create member accounts | 30 min | `lolcooldown-test` and `lolcooldown-prod` in AWS Organizations |
| OIDC identity provider | 45 min | GitHub IdP in both accounts (`token.actions.githubusercontent.com`) |
| Deployment IAM roles | 45 min | `GitHubActionsDeployRole` with trust policy for OIDC |
| Cross-account CDK trust | 30 min | Bootstrap trust for `cdk deploy` from local machine |

**OIDC trust policy pattern:**
```json
{
  "Effect": "Allow",
  "Principal": {"Federated": "arn:aws:iam::ACCOUNT:oidc-provider/token.actions.githubusercontent.com"},
  "Action": "sts:AssumeRoleWithWebIdentity",
  "Condition": {
    "StringEquals": {"token.actions.githubusercontent.com:aud": "sts.amazonaws.com"},
    "StringLike": {"token.actions.githubusercontent.com:sub": "repo:OWNER/REPO:*"}
  }
}
```

---

### 2. CDK Infrastructure — 3 hours

*Partially parallelizable with application changes*

| Task | Effort | Details |
|------|--------|---------|
| Initialize CDK project | 20 min | `infrastructure/` with TypeScript, multi-account config |
| Bootstrap accounts | 20 min | `cdk bootstrap` with cross-account trust |
| S3 bucket | 30 min | Private bucket with CloudFront OAC (not public website) |
| CloudFront distribution | 40 min | Custom domain, HTTPS redirect, SPA error handling |
| ACM certificate | 20 min | **Must be in us-east-1** for CloudFront integration |
| Route 53 records | 15 min | A/AAAA alias to CloudFront |
| GitHub Actions IAM role | 25 min | Scoped permissions for S3 sync + CF invalidation |
| Environment separation | 30 min | Separate stacks for test vs prod |

**CDK structure:**
```
infrastructure/
├── bin/app.ts
├── lib/static-site-stack.ts
├── cdk.json
└── package.json
```

**Domain strategy:**
- Test: `test.lolcooldown.com` → test account CloudFront
- Prod: `lolcooldown.com` → prod account CloudFront

---

### 3. Application Changes — 2.25 hours

*Can run in parallel with AWS/CDK setup (Sections 1-2)*

| Task | Effort | Files |
|------|--------|-------|
| Create abilities export script | 45 min | New: `scripts/export-abilities.ts` |
| Client-side round generation | 30 min | Rewrite: `src/lib/data/abilities.ts` |
| Update CooldownClash | 25 min | Edit: `src/components/game/CooldownClash.tsx:157-162` |
| Static export config | 15 min | Edit: `next.config.ts` → `output: 'export'` |
| Remove database deps | 15 min | Delete: Prisma, `/api/game/random`, `db.ts` |
| Build integration | 10 min | npm script to run export before build |

**Key changes:**
- `abilities.ts`: Prisma query → import from `public/data/abilities.json`
- `CooldownClash.tsx`: `fetch('/api/game/random')` → local `generateRound()` call
- `next.config.ts`: Add `output: 'export'`, adjust image config

**Generated at build time:**
- `public/data/abilities.json` (~50KB) — fetched from CDragon
- `out/` directory — static HTML/JS/CSS for S3

---

### 4. GitHub Actions — 1.5 hours

*Requires Sections 1-3 complete*

| Task | Effort | Details |
|------|--------|---------|
| Deploy workflow | 30 min | `.github/workflows/deploy.yml` |
| OIDC authentication | 20 min | `aws-actions/configure-aws-credentials@v4` with `role-to-assume` |
| Environment routing | 20 min | `main` branch → prod, others → test (or workflow dispatch) |
| Cache invalidation | 10 min | `aws cloudfront create-invalidation --paths "/*"` |
| GitHub secrets | 10 min | Role ARNs, distribution IDs per environment |

**Workflow pattern:**
```yaml
permissions:
  id-token: write
  contents: read

- uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: ${{ secrets.AWS_ROLE_ARN_PROD }}
    aws-region: us-east-1

- run: aws s3 sync out/ s3://${{ secrets.S3_BUCKET }} --delete
- run: aws cloudfront create-invalidation --distribution-id ${{ secrets.CF_DIST_ID }} --paths "/*"
```

**GitHub secrets needed:**
- `AWS_ROLE_ARN_TEST`, `AWS_ROLE_ARN_PROD`
- `S3_BUCKET_TEST`, `S3_BUCKET_PROD`
- `CF_DIST_ID_TEST`, `CF_DIST_ID_PROD`

---

### 5. Testing & Validation — 1.5 hours

*Sequential, after all code complete*

| Task | Effort |
|------|--------|
| Local static build | 15 min | `npm run build` → `npx serve out` → play game |
| Deploy to test | 20 min | Push branch → verify workflow → check `test.lolcooldown.com` |
| Game functionality | 15 min | Complete 5+ rounds, verify cooldowns, scoring |
| Mobile Safari | 15 min | iOS Safari is historically problematic — verify touch, viewport |
| Deploy to prod | 15 min | Merge to main → verify `lolcooldown.com` |
| Final verification | 10 min | Full game test on production |

---

### 6. Cleanup — 40 min

*After prod verified*

- Delete: `Dockerfile`, `docker-compose.yml`, `docker-compose.prod.yml`
- Delete: `scripts/deploy.sh`
- Delete: `prisma/`, `src/lib/db.ts`
- Remove: `DATABASE_URL` from `.env`, `.env.prod`
- Update: `CLAUDE.md`, `README.md` with new architecture
- Shutdown: SSH to VPS, stop containers, cancel hosting

---

## Parallelization Timeline

```
Hour 0-2:    [AWS Account Setup]       ||  [App Changes: export, round gen]
Hour 2-4:    [CDK Infrastructure]      ||  [App Changes: static export, cleanup]
Hour 4-5:    [Deploy CDK stacks]       --  wait for DNS/cert propagation
Hour 5-6.5:  [GitHub Actions workflow]
Hour 6.5-8:  [Testing] → [Cleanup]
```

**Solo:** 6-8 hours
**Two people (infra + code):** 4-5 hours

---

## Risk Factors

| Risk | Impact | Mitigation |
|------|--------|------------|
| ACM DNS validation delay | +30 min to 2 hours | Request certificate early, have hosted zone ready |
| CloudFront propagation | +10-15 min per deploy | Plan for iteration cycles |
| OIDC thumbprint wrong | Debugging time | Use current GitHub OIDC docs, verify audience |
| 404 on client-side refresh | Broken navigation | Configure CF custom error: 404 → `/index.html` (200) |
| CDragon API changes | Export script breaks | Pattern already handled in existing `seed.ts` |

---

## Future Considerations

If adding user features (accounts, leaderboards) later:
- Keep static frontend on S3/CloudFront
- Add API Gateway + Lambda (or Vercel serverless) for dynamic endpoints
- Database for user data only (not game data)
- CloudFront path routing: `/api/*` → Lambda, everything else → S3

---

## Files Summary

**Modify:**
| File | Change |
|------|--------|
| `src/lib/data/abilities.ts` | Prisma → JSON import |
| `src/components/game/CooldownClash.tsx` | API fetch → local function |
| `next.config.ts` | `output: 'export'` |

**Delete:**
- `src/app/api/game/random/route.ts`
- `src/lib/db.ts`
- `prisma/schema.prisma`
- `Dockerfile`, `docker-compose*.yml`
- `scripts/deploy.sh`

**Create:**
| File | Purpose |
|------|---------|
| `infrastructure/` | CDK TypeScript project |
| `scripts/export-abilities.ts` | Build-time data export |
| `.github/workflows/deploy.yml` | CI/CD workflow |
| `public/data/abilities.json` | Generated abilities data (gitignored) |
