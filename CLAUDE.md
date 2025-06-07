# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Install dependencies
pnpm install

# Development server
pnpm dev

# Build for production
pnpm build

# Generate static site
pnpm generate

# Preview production build
pnpm preview

# Linting and formatting
pnpm lint        # Check for lint errors
pnpm lint:fix    # Fix lint errors automatically
pnpm format      # Format code with Prettier

# Testing
# No explicit test commands found - check with user if tests exist
```

## Project Architecture

### Tech Stack
- **Framework**: Nuxt 3 (Vue.js) with TypeScript
- **Database**: Supabase with NuxtHub database (Cloudflare D1)
- **Auth**: Dual authentication system (Supabase OAuth + custom app users with JWT)
- **AI**: Google Generative AI, OpenAI, Mistral AI for chat/generation
- **UI**: Nuxt UI, Tailwind CSS, PrimeVue
- **State**: Pinia stores for client state management
- **Deployment**: NuxtHub (Cloudflare Pages)

### Key Architecture Patterns

#### Dual Authentication System
The app supports two user types:
- **Supabase Users**: Email/OAuth authentication via `@nuxtjs/supabase`
- **App Users**: Custom username/password auth with JWT cookies in `server/utils/authHelpers.ts`

Both types are handled in `app/middleware/auth.ts` and `app/composables/useUsers.ts`. The `auth.ts` middleware checks for either user type before allowing access.

#### Server-Side API Structure
- **Server API**: `/server/api/` contains REST endpoints
- **App Auth**: `/server/api/app-auth/` handles custom user authentication
- **Utils**: `/server/utils/` contains shared server utilities including auth helpers and database functions

#### Client-Side Architecture
- **Pages**: `/app/pages/` - file-based routing with nested layouts
- **Components**: `/app/components/` - organized by feature (chat, challenge, feedback, etc.)
- **Composables**: `/app/composables/` - reusable composition functions including Supabase integrations
- **Stores**: `/app/stores/` - Pinia stores for global state (profile, credit, quiz)
- **Middleware**: `/app/middleware/` - route protection and authentication

#### AI Integration
- Chat functionality uses streaming responses via `app/composables/useChat.ts`
- Server-side AI utilities in `/server/utils/useBufferedGenAi.ts` and `/server/utils/useGenAi.ts`
- Multiple AI providers integrated (Google GenAI, OpenAI, Mistral)

### Important Files and Directories

#### Authentication Flow
- `app/middleware/auth.ts` - Route protection for both auth types
- `app/composables/useUsers.ts` - Auth state management and API calls
- `server/utils/authHelpers.ts` - JWT signing/verification (uses stubs for production compatibility)
- `server/api/app-auth/` - Custom auth endpoints (login, register, logout, me)

#### Database & State
- `server/utils/db.ts` - Database operations for queries, users, trending data
- `app/stores/` - Client-side state management
- `app/composables/supabase/` - Supabase-specific composables

#### Configuration
- `nuxt.config.ts` - Main Nuxt configuration with modules and runtime config
- `eslint.config.mjs` - ESLint configuration with custom overrides
- Environment variables for AI keys, Supabase, and JWT secrets

### Code Style Guidelines
- ESLint configured with Nuxt defaults plus custom overrides
- Single quotes, semicolons, 2-space indentation
- Vue components allow multiple template roots and flexible naming
- TypeScript with `any` types allowed (temporary)

### Key Environment Variables
- `NUXT_PUBLIC_SUPABASE_URL` / `NUXT_PUBLIC_SUPABASE_KEY` - Public Supabase config
- `NUXT_PRIVATE_SUPABASE_URL` / `NUXT_PRIVATE_SUPABASE_KEY` - Private Supabase config
- `JWT_SECRET` - For app user authentication
- `VITE_GOOGLE_AI_STUDIO_API_KEY` - Google AI integration
- `OPENAI_API_KEY` - OpenAI integration

### Development Notes
- Uses `pnpm` as package manager
- Husky configured for git hooks
- NuxtHub provides database and caching in development/production
- JWT authentication uses stubs in production due to deployment limitations
- Project appears to be an educational platform with parent/child user roles and quiz/challenge features