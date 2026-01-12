# Supabase Database Management

Schema-first workflow using Supabase CLI migrations.

## Projects
| Env | Project ID | URL |
|-----|------------|-----|
| dev | `qfzqwbwwzqmacnhtihov` | https://qfzqwbwwzqmacnhtihov.supabase.co |
| prod | `lqgsbofjkfduqcxbmdxn` | https://lqgsbofjkfduqcxbmdxn.supabase.co |

## Directory Structure

```
supabase/
├── config.toml         # Schema paths and seed config
├── migrations/         # Timestamped migrations (synced across environments)
├── schemas/            # Source of truth for schema definitions
│   ├── *.sql          # Table definitions
│   ├── functions/     # SQL functions
│   └── cron/          # Cron jobs
├── seeds/             # Seed data (applied on reset)
└── scripts/
    ├── init-admin.js  # Create test users
    └── upload-assets.js
```

## Quick Reference

| Command | Description |
|---------|-------------|
| `pnpm db:reset` | Reset local DB + users + assets |
| `pnpm db:types` | Generate TypeScript types |
| `supabase db diff -f <name>` | Generate migration |
| `supabase db push` | Push migrations to remote |
| `supabase db reset --linked` | Reset remote DB |
| `supabase migration list` | Show migration status |

## Workflows

### Local Development
```bash
supabase start   # Start local Supabase
pnpm db:reset    # Reset + users + assets
```

### Making Schema Changes
```bash
# 1. Edit schema source file
vim supabase/schemas/user_infos.sql

# 2. Reset local to apply changes
supabase db reset

# 3. Generate migration
supabase db diff -f add_avatar_column

# 4. Push to dev
supabase link --project-ref qfzqwbwwzqmacnhtihov
supabase db push

# 5. Push to prod (when ready)
supabase link --project-ref lqgsbofjkfduqcxbmdxn
supabase db push

# 6. Commit
git add supabase/
git commit -m "Add avatar_url column"
```

### Adding New Tables
1. Create `supabase/schemas/new_table.sql`
2. Add to `config.toml` schema_paths in dependency order
3. Reset local: `supabase db reset`
4. Generate migration: `supabase db diff -f create_new_table`
5. Push: `supabase db push`

### Reset Remote Database (Destructive)
```bash
supabase link --project-ref <project-id>
supabase db reset --linked
```

## Dev/Prod Setup

### Create Test Users
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

### Upload Assets (S3/Storage)
```bash
# Dev
NUXT_PUBLIC_SUPABASE_URL=https://qfzqwbwwzqmacnhtihov.supabase.co \
NUXT_PRIVATE_SUPABASE_SERVICE_ROLE_KEY=<dev-service-role-key> \
node supabase/scripts/upload-assets.js

# Prod
NUXT_PUBLIC_SUPABASE_URL=https://lqgsbofjkfduqcxbmdxn.supabase.co \
NUXT_PRIVATE_SUPABASE_SERVICE_ROLE_KEY=<prod-service-role-key> \
node supabase/scripts/upload-assets.js
```

## Test Users

| Email | Password | Role |
|-------|----------|------|
| admin@edtack.com | admin123 | ADMIN |
| parent@test.com | Test123! | PARENT (PRO) |
| student@test.com | Test123! | STUDENT |

## Email Verification (Local Testing)

### Enable Email Verification
Add to `config.toml`:
```toml
[auth]
site_url = "http://localhost:3000"

[auth.email]
enable_confirmations = true
```

Then restart: `supabase stop && supabase start`

### View Verification Emails
Open Inbucket at: http://localhost:54324

### Disable Email Verification
```toml
[auth.email]
enable_confirmations = false
```

## Key Concepts

- **schemas/** = Source of truth (edit these)
- **migrations/** = Generated from schemas, synced across environments
- **seeds/** = Applied on `supabase db reset`
- **config.toml** = Defines schema order and seed paths
