# Side Hustle

Research-based artist organization website. Built with Next.js 14, PostgreSQL via Prisma, Tailwind CSS, Framer Motion, and NextAuth.js v5.

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL (local or cloud — see DEPLOYMENT.md)
- pnpm (or npm/yarn)

### Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your database URL and secrets

# Push schema to database
npx prisma db push

# Seed initial data (creates admin user + empty pages)
npx prisma db seed

# Start development server
npm run dev
```

Site: http://localhost:3000
Admin: http://localhost:3000/admin

Default admin credentials (from seed):
- Email: `admin@sidehustle.art` (override with `SEED_ADMIN_EMAIL`)
- Password: `changeme123!` (override with `SEED_ADMIN_PASSWORD`)

**Change this immediately after first login.**

## Environment Variables

See `.env.example` for all required variables.

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✓ | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | ✓ | Random secret for session signing |
| `NEXTAUTH_URL` | ✓ (prod) | Full URL of deployed site |
| `MAILCHIMP_API_KEY` | Optional | Mailchimp API key |
| `MAILCHIMP_AUDIENCE_ID` | Optional | Mailchimp list/audience ID |
| `MAILCHIMP_API_SERVER` | Optional | Mailchimp server prefix (e.g. `us21`) |

## Project Structure

```
src/
  app/                   Next.js App Router pages
    (public)/            Public-facing pages
    admin/               Admin panel (/admin/*)
    api/                 API routes
  components/
    admin/               Admin-only form components
    sections/            Homepage section components
  lib/
    admin/               Server-side admin utilities (permissions, audit)
    auth.ts              NextAuth configuration
    prisma.ts            Prisma client singleton
    storage.ts           Image upload abstraction
    types.ts             Shared TypeScript types
prisma/
  schema.prisma          Database schema
  seed.ts                Database seed script
```

## Commands

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint
npm run db:push      # Push schema changes (dev)
npm run db:seed      # Seed database
npm run db:migrate   # Run migrations (prod)
npx prisma studio    # Database GUI
```

## Deployment

See `docs/DEPLOYMENT.md` for Vercel and Docker deployment guides.
