# Local Development Setup

Complete guide to setting up the lolcooldown development environment.

## Prerequisites

- **Node.js 20+** (Next.js 16 requirement)
- **Docker** (for PostgreSQL database)
- **Git**

### Verify Prerequisites

```bash
node --version    # Should be v20.x or higher
docker --version  # Any recent version
git --version
```

## Quick Setup

Run these commands in order:

```bash
# 1. Clone the repository
git clone <repo-url> lolcooldown
cd lolcooldown

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env

# 4. Start PostgreSQL
docker compose up -d

# 5. Set up database schema
export $(grep DATABASE_URL .env | xargs) && npx prisma db push

# 6. Generate Prisma client
npm run db:generate

# 7. Seed the database (fetches champion data from Community Dragon)
npm run db:seed

# 8. Start development server
npm run dev
```

The app will be available at http://localhost:3000

## Detailed Setup

### 1. Environment Variables

Copy the example file:

```bash
cp .env.example .env
```

The default `.env` matches the Docker Compose configuration:

```
DATABASE_URL="postgresql://lolcd:lolcd_dev@localhost:5432/lolcooldown"
```

### 2. PostgreSQL with Docker

Start the database:

```bash
docker compose up -d
```

This creates a PostgreSQL 16 container with:
- **User:** lolcd
- **Password:** lolcd_dev
- **Database:** lolcooldown
- **Port:** 5432

Useful commands:

```bash
docker compose logs -f postgres  # View logs
docker compose stop              # Stop container
docker compose down              # Stop and remove container
docker compose down -v           # Stop and remove container + data
```

### 3. Database Setup

Apply the Prisma schema:

```bash
export $(grep DATABASE_URL .env | xargs) && npx prisma db push
```

Generate the Prisma client:

```bash
npm run db:generate
```

Seed the database with champion data:

```bash
npm run db:seed
```

The seed script fetches all champion abilities and skins from Community Dragon.

### 4. Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Common Tasks

### View Database

```bash
npm run db:studio
```

Opens Prisma Studio at http://localhost:5555

### Update Database Schema

After modifying `prisma/schema.prisma`:

```bash
# Apply changes (may require --accept-data-loss for dropping columns)
export $(grep DATABASE_URL .env | xargs) && npx prisma db push

# Regenerate client
npm run db:generate
```

### Reseed Database

To fetch fresh champion data:

```bash
npm run db:seed
```

### Lint Code

```bash
npm run lint
```

### Production Build

```bash
npm run build
npm run start
```

## Troubleshooting

### "Cannot find module '@prisma/client'"

Regenerate the Prisma client:

```bash
npm run db:generate
```

### Database Connection Refused

Ensure PostgreSQL is running:

```bash
docker compose ps
docker compose up -d
```

### Prisma Commands Fail

Environment variables must be **exported**, not just sourced:

```bash
# Wrong
source .env

# Correct
export $(grep DATABASE_URL .env | xargs)
```

### Port 5432 Already in Use

Stop any local PostgreSQL:

```bash
# Linux
sudo systemctl stop postgresql

# macOS (Homebrew)
brew services stop postgresql
```

Or change the port in `docker-compose.yml` and update `.env` accordingly.

### Seed Script Fails

Check your internet connection - the seed script fetches data from Community Dragon CDN. If rate limited, wait a few minutes and retry.

## Project Structure

```
lolcooldown/
├── prisma/
│   └── schema.prisma    # Database schema
├── src/
│   ├── app/             # Next.js pages and API routes
│   ├── components/      # React components
│   ├── lib/             # Utilities and data fetching
│   ├── scripts/         # Database seeding
│   └── types/           # TypeScript definitions
├── docker-compose.yml   # Local PostgreSQL
├── .env.example         # Environment template
└── package.json
```
