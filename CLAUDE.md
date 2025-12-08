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
- `pnpm db:generate` - Generate `database/reset.sql`
- `pnpm db:reset` - Reset local database (tables + seeds + users + assets)
- `pnpm db:types` - Generate TypeScript types from database schema
- `pnpm db:diff` - Generate incremental migration via supabase db diff

## Database Workflows

### Local Development
```bash
pnpm db:generate    # Generate reset.sql
pnpm db:reset       # Reset local DB + create users + upload assets
```
### Dev/Prod - Full Reset
```bash
pnpm db:generate
# Copy database/reset.sql contents to Supabase SQL Editor and run
```

### Dev/Prod - Create Users
```bash
NUXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co \
NUXT_PRIVATE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
node database/scripts/init-admin.js
```

Creates test users:
- `admin@edtack.com / admin123` - ADMIN role
- `parent@test.com / Test123!` - PARENT role, PRO subscription
- `student@test.com / Test123!` - STUDENT role, linked to parent

### Dev/Prod - Upload Assets
```bash
NUXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co \
NUXT_PRIVATE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
node database/scripts/upload-assets.js
```

Uploads `assets/characters/*.png` to Supabase Storage.

### Incremental Changes
```bash
pnpm db:diff    # Shows ALTER statements
# Copy output to Supabase SQL Editor
```

## Database Scripts

```
database/
├── scripts/
│   ├── db.js           # Main CLI (generate, reset, types, diff)
│   ├── init-admin.js   # Create test users via Auth API
│   ├── upload-assets.js # Upload character images to Storage
│   └── table-config.js # Table ordering config
├── tables/             # SQL table definitions
├── functions/          # SQL functions
├── cron/               # Cron jobs
├── seeds/              # Seed data
└── reset.sql           # Generated full reset script
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
- Update `database/tables/` when altering tables

## System Codes

System codes are shared CONSTANT_CASE enums (e.g., `CORRECT`, `PENDING`) used across BE/FE for type safety.

**Adding new codes:**
1. Add enum to `shared/constants/codes.ts`
2. Add type guard to `server/services/codeService.ts`
3. Add seed data to `database/seeds/all_seeds.sql`
4. Add to `app/stores/codes.ts` CODE_CATEGORIES
5. Optional: Add CHECK constraint to table schema
