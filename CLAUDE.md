# Claude Code Configuration

## Package Manager
This project uses **pnpm** as the package manager.

## Available Scripts

### Development
- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm generate` - Generate static site
- `pnpm preview` - Preview production build

### Code Quality
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint issues automatically
- `pnpm format` - Format code with Prettier

### Database Operations
- `pnpm db:reset` - Reset local DB (migrations + seeds + users + assets + lessons)
- `pnpm db:types` - Generate TypeScript types
- `supabase db diff -f <name>` - Generate migration from schema changes
- `supabase db push` - Push migrations to remote
- `supabase db reset --linked` - Reset remote DB (destructive)

## Supabase Projects
| Env | Project ID | URL |
|-----|------------|-----|
| dev | `qfzqwbwwzqmacnhtihov` | https://qfzqwbwwzqmacnhtihov.supabase.co |
| prod | `lqgsbofjkfduqcxbmdxn` | https://lqgsbofjkfduqcxbmdxn.supabase.co |

## Database Workflows

### Local Development
```bash
# Start Supabase from the database directory (path from SUPABASE_WORKDIR in .env)
cd $SUPABASE_WORKDIR && supabase start

# Reset DB (requires SUPABASE_WORKDIR - npm scripts don't load .env automatically)
# Pass the env var explicitly, using the value from your .env file
SUPABASE_WORKDIR=<path-from-your-env> pnpm db:reset

# Generate TypeScript types (also requires SUPABASE_WORKDIR)
SUPABASE_WORKDIR=<path-from-your-env> pnpm db:types
```

### Apply Migration Locally (Without Wiping Data)
```bash
# Run a single migration file directly
psql postgresql://postgres:postgres@localhost:54322/postgres -f supabase/migrations/XXXX_migration.sql

# Or run inline SQL
psql postgresql://postgres:postgres@localhost:54322/postgres -c "SELECT * FROM some_function();"
```

Use this when you want to test a migration without resetting all data. For full reset, use `supabase db reset`.

### Making Schema Changes
```bash
# 1. Edit schema source file AND corresponding migration file
vim supabase/schemas/user_infos.sql
vim supabase/migrations/XXXX_user_infos.sql

# 2. Push to dev (always do this after schema changes)
supabase link --project-ref qfzqwbwwzqmacnhtihov
supabase db push

# 3. Push to prod (when ready)
supabase link --project-ref lqgsbofjkfduqcxbmdxn
supabase db push
```

**Important:** Always edit both the schema source file AND the migration file together. Then run `supabase db push` to apply changes to dev.

### Reset Remote Database (Destructive)
```bash
supabase link --project-ref <project-id>
supabase db reset --linked
```

### Create Test Users on Dev/Prod
```bash
# Dev
NUXT_PUBLIC_SUPABASE_URL=https://qfzqwbwwzqmacnhtihov.supabase.co \
NUXT_PRIVATE_SUPABASE_SERVICE_ROLE_KEY=<dev-service-role-key> \
node supabase/scripts/init-admin.js

# Prod
NUXT_PUBLIC_SUPABASE_URL=https://lqgsbofjkfduqcxbmdxn.supabase.co \
NUXT_PRIVATE_SUPABASE_SERVICE_ROLE_KEY=<prod-service-role-key> \
node supabase/scripts/init-admin.js
```

### Upload Assets to Dev/Prod
```bash
# Local (uses .env)
node supabase/scripts/upload-assets.js

# Dev
node supabase/scripts/upload-assets.js https://qfzqwbwwzqmacnhtihov.supabase.co <dev-service-role-key>

# Prod
node supabase/scripts/upload-assets.js https://lqgsbofjkfduqcxbmdxn.supabase.co <prod-service-role-key>
```

### Test Users
- `admin@edtack.com / admin123` - ADMIN role
- `parent@test.com / Test123!` - PARENT role, PRO subscription
- `student@test.com / Test123!` - STUDENT role, linked to parent

## Database Structure

```
supabase/
├── config.toml         # Schema paths and seed config
├── migrations/         # Timestamped migrations (synced across environments)
├── schemas/            # Source of truth - SQL definitions
│   ├── *.sql          # Table definitions
│   ├── functions/     # SQL functions
│   └── cron/          # Cron job definitions
├── seeds/             # Seed data
└── scripts/
    ├── init-admin.js  # Create test users via Auth API
    └── upload-assets.js # Upload character images to Storage
```

## Project Structure
This is a Nuxt 3 application with:
- TypeScript support
- Supabase integration
- Tailwind CSS styling
- Pinia for state management
- ESLint + Prettier for code quality

### Frontend
- Use icons instead of SVG unless absolutely needed
- Use primary and secondary buttons and colors

### Codes
- Constants and codes and code category are in CONSTANT_CASE

### Schemas
- Update `supabase/schemas/` when altering tables

## System Codes

System codes are shared CONSTANT_CASE enums (e.g., `CORRECT`, `PENDING`) used across BE/FE for type safety.

**Adding new codes:**
1. Add enum to `shared/constants/codes.ts`
2. Add type guard to `server/services/codeService.ts`
3. Add seed data to `supabase/seeds/all_seeds.sql`
4. Add to `app/stores/codes.ts` CODE_CATEGORIES
5. Optional: Add CHECK constraint to table schema

## Feature Flags

Feature flags control UI visibility per environment (dev vs prod) using environment variables.

### Current Flags
| Flag | Description | Dev | Prod |
|------|-------------|-----|------|
| `subscriptionPlans` | Subscription UI, upgrade plan buttons, credit card payment | `true` | `false` |

### Usage
```typescript
const { subscriptionPlans } = useFeatureFlags();

// In template
<SubscriptionTab v-if="subscriptionPlans" />
```

### Adding New Flags
1. Add to `nuxt.config.ts` under `runtimeConfig.public.features`
2. Add convenience getter to `app/composables/useFeatureFlags.ts`
3. Add env var to `.env` and `.env.example`

### Environment Variables
```bash
# Development (.env) - enable features
NUXT_PUBLIC_FEATURES_SUBSCRIPTION_PLANS=true

# Production - don't set (defaults to false) or set explicitly
# NUXT_PUBLIC_FEATURES_SUBSCRIPTION_PLANS=false
```
