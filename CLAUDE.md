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

### Making Schema Changes
```bash
# 1. Edit schema source file
vim supabase/schemas/user_infos.sql

# 2. Reset local to apply changes
supabase db reset

# 3. Generate migration from diff
supabase db diff -f add_new_column

# 4. Push to dev
supabase link --project-ref qfzqwbwwzqmacnhtihov
supabase db push

# 5. Push to prod (when ready)
supabase link --project-ref yxbebpfjblokjxvroebw
supabase db push
```

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
# Dev
NUXT_PUBLIC_SUPABASE_URL=https://qfzqwbwwzqmacnhtihov.supabase.co \
NUXT_PRIVATE_SUPABASE_SERVICE_ROLE_KEY=<dev-service-role-key> \
node supabase/scripts/upload-assets.js

# Prod
NUXT_PUBLIC_SUPABASE_URL=https://yxbebpfjblokjxvroebw.supabase.co \
NUXT_PRIVATE_SUPABASE_SERVICE_ROLE_KEY=<prod-service-role-key> \
node supabase/scripts/upload-assets.js
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

System codes are shared enums used across BE/FE for type safety. **All enum names AND values must be UPPERCASE.**

### Existing Enums
| Enum | Location | Purpose |
|------|----------|---------|
| `ORDER_STATUS` | shared/constants/codes.ts | Order lifecycle states |
| `ORDER_FULFILLMENT` | shared/constants/codes.ts | Fulfillment states |
| `OPERATION_TYPE` | shared/constants/codes.ts | Credit transaction types |
| `TASK_STATUS` | shared/constants/codes.ts | Task states |
| `LESSON_GENERATION_TYPE` | shared/constants/codes.ts | Quiz/lesson generation modes |
| `MARKING_STATUS` | shared/constants/codes.ts | Answer marking results |
| `QUESTION_TYPE` | shared/constants/codes.ts | Question formats |
| `GROUP_MEMBER_STATUS` | shared/constants/codes.ts | Group membership states |
| `GROUP_TYPE` | shared/constants/codes.ts | Group types |
| `USER_ROLE` | shared/constants/codes.ts | User roles |
| `MESSAGE_STATUS` | shared/constants/codes.ts | Chat message states |
| `ENTITY_STATUS` | shared/constants/codes.ts | Generic active/inactive |
| `TRANSFER_TYPE` | shared/constants/codes.ts | Credit transfer types |
| `FEEDBACK_TYPE` | shared/constants/codes.ts | User feedback types |
| `STRIPE_MODE` | shared/constants/codes.ts | Stripe payment modes |
| `STUDY_TYPE` | shared/constants/codes.ts | Study session types |
| `GENERATION_INTENT_TYPE` | shared/constants/codes.ts | AI generation intents |

### Adding New Enums

**Step 1: Add enum to `shared/constants/codes.ts`**
```typescript
// All values MUST be UPPERCASE
export enum MY_NEW_STATUS {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED'
}
```

**Step 2: Add type guard to `server/services/codeService.ts`**
```typescript
export const isValidMyNewStatus = (status: string): status is MY_NEW_STATUS =>
  Object.values(MY_NEW_STATUS).includes(status as MY_NEW_STATUS);
```

**Step 3: Add seed data to `supabase/seeds/all_seeds.sql`**
```sql
-- MY_NEW_STATUS codes
INSERT INTO codes (category, code, name, sort_order) VALUES
('MY_NEW_STATUS', 'ACTIVE', 'Active', 1),
('MY_NEW_STATUS', 'PENDING', 'Pending', 2),
('MY_NEW_STATUS', 'COMPLETED', 'Completed', 3)
ON CONFLICT (category, code) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;
```

**Step 4: Add to `app/stores/codes.ts` CODE_CATEGORIES**
```typescript
export const CODE_CATEGORIES = {
  // ... existing categories
  MY_NEW_STATUS: 'MY_NEW_STATUS',
} as const;
```

**Step 5 (Optional): Add CHECK constraint to table schema**
```sql
ALTER TABLE my_table ADD CONSTRAINT my_table_status_check
  CHECK (status IN ('ACTIVE', 'PENDING', 'COMPLETED'));
```

### Usage in Code
```typescript
// Import from shared constants
import { MY_NEW_STATUS } from '~~/shared/constants';

// Use enum values
const status = MY_NEW_STATUS.ACTIVE;

// Type guard validation
if (isValidMyNewStatus(inputStatus)) {
  // inputStatus is now typed as MY_NEW_STATUS
}
```
