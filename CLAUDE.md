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
- `pnpm db:reset` - Reset local DB (migrations + seeds + users + assets)
- `pnpm db:types` - Generate TypeScript types
- `supabase db diff -f <name>` - Generate migration from schema changes
- `supabase db push` - Push migrations to remote
- `supabase db reset --linked` - Reset remote DB (destructive)

## Supabase Projects
| Env | Project ID | URL |
|-----|------------|-----|
| dev | `qfzqwbwwzqmacnhtihov` | https://qfzqwbwwzqmacnhtihov.supabase.co |
| prod | `yxbebpfjblokjxvroebw` | https://yxbebpfjblokjxvroebw.supabase.co |

## Database Workflows

### Local Development
```bash
supabase start   # Start local Supabase
pnpm db:reset    # Reset DB + create users + upload assets
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
supabase link --project-ref yxbebpfjblokjxvroebw
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
NUXT_PUBLIC_SUPABASE_URL=https://yxbebpfjblokjxvroebw.supabase.co \
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
node supabase/scripts/upload-assets.js https://yxbebpfjblokjxvroebw.supabase.co <prod-service-role-key>
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
