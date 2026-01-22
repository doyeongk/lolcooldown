# Migrate to Static Export + S3 + CloudFront + CDK

## Reasoning

**Current state:** Self-hosted Next.js server + PostgreSQL database for read-only static game data.

**Problem:**
- Running a server 24/7 to shuffle arrays and pick random abilities
- Database stores data that could be a 50KB JSON file
- Complex deployment (Docker, SSH, database migrations)
- Higher costs (~$10-20/month for VPS + database)

**Why static:**
- Zero server-side logic needed (all game logic is client-side)
- No user accounts, no leaderboards, no dynamic content
- API route just fetches abilities and calls `Math.random()`

**Benefits:**
- Cost: ~$1-2/month (S3 + CloudFront + Route 53)
- Performance: Global CDN, no cold starts, instant page loads
- Simplicity: No server maintenance, no database backups
- Scalability: Handles traffic spikes automatically
- Security: Static files = minimal attack surface

---

## Migration Steps

### 1. Remove Database Layer
- Export abilities data to `public/data/abilities.json` during build
- Create build script to fetch from CDragon → generate JSON
- Move `generateRound()` logic to client-side (`src/lib/game/rounds.ts`)
- Delete `/api/game/random` route
- Remove Prisma, PostgreSQL dependencies

### 2. Convert to Static Export
- Change `next.config.ts`: `output: 'export'`
- Update image handling (already using local cached images in `public/images/`)
- Test build: `npm run build` → verify `out/` directory
- Update routing (static export limitations: no rewrites, no dynamic API routes)

### 3. Infrastructure as Code (AWS CDK)
**Create `infrastructure/` directory:**
```
infrastructure/
├── bin/app.ts              # CDK app entry
├── lib/
│   └── static-site-stack.ts # S3 + CloudFront + Route 53
└── cdk.json
```

**Resources:**
- S3 bucket (static hosting, private)
- CloudFront distribution (CDN, SSL, custom domain)
- ACM certificate (SSL for `lolcooldown.com`)
- Route 53 A record (ALIAS to CloudFront)
- IAM policy for GitHub Actions deployment

**Why CDK over Terraform/manual:**
- TypeScript (same language as app)
- AWS-native (better integration, faster updates)
- Programmatic (can reference values across stacks)
- Version controlled infrastructure

### 4. GitHub Actions CI/CD
**Workflow:** `.github/workflows/deploy.yml`
```
On push to main:
1. npm ci
2. npm run build (generates out/ + abilities.json)
3. Configure AWS credentials (GitHub secrets)
4. aws s3 sync out/ s3://bucket --delete
5. Invalidate CloudFront cache
```

**Secrets needed:**
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `CLOUDFRONT_DISTRIBUTION_ID`

### 5. Cleanup
- Remove `Dockerfile`, `docker-compose.yml`
- Remove `scripts/deploy.sh`
- Remove `DATABASE_URL` from `.env`
- Update `CLAUDE.md` and `README.md`

---

## Rollout Plan

**Phase 1: Prepare (1-2 hours)**
- Create data export script
- Move round generation to client
- Test locally with static export

**Phase 2: Infrastructure (1 hour)**
- Write CDK stack
- Deploy to AWS (`cdk deploy`)
- Verify CloudFront distribution works

**Phase 3: CI/CD (30 min)**
- Create GitHub Actions workflow
- Add secrets to GitHub
- Test deployment

**Phase 4: Cutover (15 min)**
- Update DNS to point to CloudFront
- Verify production site works
- Shut down old server

---

## Future Considerations

**If adding user features later:**
- Keep static frontend on S3/CloudFront
- Add separate API (API Gateway + Lambda, or Vercel serverless)
- Database for user data only (not game data)
- Use same domain with CloudFront path routing (`/api/*` → Lambda)

**Alternatives considered:**
- **Vercel + Neon:** Easier setup but 20x more expensive at scale, unnecessary database
- **Amplify:** AWS managed hosting, but less control and higher costs
- **Keep Next.js server:** Works but wasteful for purely static content
- **Vite migration:** Better performance but 4-6 hours of refactoring for marginal gain
