# Claude Code Configuration

## Package Manager
This project uses **pnpm** as the package manager.

```json
{
  "packageManager": "pnpm"
}
```

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
- `pnpm db:reset` - Generate migrations and run supabase db reset
- `pnpm db:seed` - Generate seed.sql, run via psql, and initialize admin user
- `pnpm db:types` - Generate TypeScript types from database schema

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
- constants and codes and code catgory are in constant case

### Schemas
- Update database/tables when altering tables

## System Codes

System codes are shared CONSTANT_CASE enums (e.g., `CORRECT`, `PENDING`) used across BE/FE for type safety.

**Adding new codes:** 1) Add enum to `shared/constants/codes.ts` 2) Add type guard to `server/services/codeService.ts` 3) Add seed data to `database/seeds/all_seeds.sql` 4) Add to `app/stores/codes.ts` CODE_CATEGORIES 5) Optional: Add CHECK constraint to table schema