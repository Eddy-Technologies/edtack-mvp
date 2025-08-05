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
- `pnpm db:seed` - Generate seed.sql and run via psql
- `pnpm db:init-admin` - Initialize admin user via Supabase Auth Admin API
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
- constants and codes are in constant case