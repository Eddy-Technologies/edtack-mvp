# EdTack MVP - Educational Technology Platform

EdTack is an AI-powered educational technology platform that enables family-based learning with task management, credit rewards, AI tutoring, and performance tracking.

## Features

- **Supabase Authentication**: Clean auth system with OAuth providers
- **Family Task Management**: Parent-child task assignment with credit rewards
- **AI-Powered Tutoring**: WebSocket-based AI integration for personalized education
- **Credit Reward System**: Task-based credit earning (1 credit = 1 cent SGD)
- **Educational Content**: Singapore curriculum-aligned questions and performance tracking
- **E-commerce Integration**: Stripe-powered shop with credit-based purchasing

## Tech Stack

- **Framework**: Nuxt 3 with TypeScript
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Payments**: Stripe with product purchasing and credit management
- **AI**: WebSocket-based AI service for educational content
- **Authentication**: Supabase Auth with OAuth providers
- **Deployment**: NuxtHub (Cloudflare)

## Project Structure

```
server/
├── api/
│   ├── auth/           # Authentication endpoints
│   ├── tasks/          # Task management (create, complete, approve)
│   ├── credits/        # Credit management and transfers
│   ├── family/         # Parent-child relationship management
│   ├── children/       # Child user management
│   ├── orders/         # Order processing and approval
│   ├── shop/           # Product management and purchasing
│   └── webhooks/       # Stripe webhook processing
├── utils/
│   ├── authConfig.ts   # Auth configuration
│   └── stripe.ts       # Stripe integration
database/
├── tables/             # Database schema files (semantic naming)
├── seeds/              # Seed data for development
├── drop/               # Database cleanup scripts
└── scripts/            # Migration and management scripts
middleware/
└── auth.ts             # Route protection
types/
└── supabase.ts         # Auto-generated Supabase types
```

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Supabase account and project
- Supabase CLI for local development
- Stripe account (test mode for development)
- WebSocket AI server (anthropic-rag backend)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd edtack-mvp
```

2. Install dependencies
```bash
pnpm install
```

3. Set up environment variables
```bash
cp .env.example .env
```

Configure the following environment variables:
```bash
# Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# WebSocket AI Service
NUXT_PUBLIC_CHAT_WS_URL=ws://localhost:8000/api/v1/ws

# JWT
JWT_SECRET=your_jwt_secret_key
```

4. Set up local database
```bash
# Start local Supabase (requires Docker)
supabase start

# Run complete database setup (creates all tables and seed data)
pnpm db:fresh

# Generate TypeScript types
pnpm db:types
```

5. Configure Stripe
   - Set up products and pricing in Stripe dashboard
   - Configure webhook endpoint for your development environment

### Development

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`.

### Key Development Commands

```bash
# Development server
pnpm dev

# Database management
pnpm db:fresh        # Complete database reset + migration + seeding
pnpm db:migrate      # Run migrations only
pnpm db:seed         # Run seed data only
pnpm db:reset        # Drop all tables
pnpm db:types        # Generate TypeScript types

# Code quality
pnpm lint            # Run ESLint
pnpm lint:fix        # Fix linting errors
pnpm format          # Format code with Prettier

# Build and deployment
pnpm build           # Build for production
pnpm preview         # Preview production build
```

## Architecture Overview

### Authentication Flow
- **Supabase Auth**: Clean authentication with email/password and OAuth
- **User Management**: Centralized user data in `user_infos` table

### Task & Credit System
- **Task Management**: Parents create tasks, children complete them
- **Credit Rewards**: 1 credit = 1 cent SGD earned from task completion
- **Family Transfers**: Parents can transfer credits to children
- **Purchase System**: Credits can be spent in the integrated shop
- **Webhook Processing**: Automated transaction recording via Stripe webhooks

### AI Integration
- **Educational Content**: AI-generated questions and explanations
- **Conversation Context**: Maintains chat history for personalized tutoring
- **Performance Tracking**: Analytics on user progress and engagement

## Database Schema

The database uses semantic file naming and proper dependency ordering for reliable migrations.

### Core Tables (in dependency order)
```
# Foundation tables
roles.sql                    # User roles (parent, teacher, student)
level_types.sql             # Education levels (Primary 1-6, Secondary 1-5, etc.)
codes.sql                   # System codes and constants
subjects.sql                # Singapore curriculum subjects

# User management
user_infos.sql              # Central user profiles with email
user_roles.sql              # User role assignments
user_credits.sql            # Credit balances and reserves
parent_child.sql            # Family relationships

# Educational content
syllabus.sql                # Curriculum structure
questions.sql               # Educational questions
question_options.sql        # Multiple choice options
question_correct_answers.sql # Answer keys

# User interactions  
user_question_attempts.sql  # Question attempt tracking
user_question_answers.sql   # User responses

# Commerce system
products.sql                # Shop products
orders.sql                  # Purchase orders
order_items.sql             # Order line items
wishlists.sql               # User wishlists

# Task & reward system
user_tasks.sql              # Parent-child task assignments
credit_transactions.sql     # All credit movements

# External integrations
stripe_webhook_events.sql   # Stripe event tracking
functions.sql               # Database functions and views
```

### Key Business Rules
- **Task Workflow**: Parent creates → Child completes → Parent approves → Credits awarded
- **Family Relationships**: Parent-child linkage enables task assignment and credit transfers
- **Credit System**: All transactions tracked with full audit history
- **Webhook Idempotency**: Stripe events processed exactly once using event IDs

## Development Guidelines

### Adding New API Endpoints
1. Create route file in `/server/api/[feature]/[method].ts`
2. Use `defineEventHandler` pattern
3. Add authentication check for protected routes
4. Implement input validation
5. Follow error handling patterns with `createError`

### Database Changes
1. Add new table file to `/database/tables/` with semantic naming
2. Update migration script dependency order if needed
3. Run `pnpm db:fresh` to test complete migration
5. Regenerate TypeScript types with `pnpm db:types`
6. Test with both user and service role clients

### Documentation
- Update `CLAUDE.md` for architectural changes
- Follow existing code patterns and conventions
- Maintain consistent error handling and response formats

## Deployment

The application is designed for deployment on NuxtHub (Cloudflare):

```bash
npx nuxthub deploy
```

### Production Environment Setup
1. Configure production Supabase project
2. Set up production Stripe account and webhooks
3. Add all environment variables to deployment platform
4. Test payment flows and webhook processing

## Contributing

1. Follow existing code patterns and conventions
2. Update documentation for significant changes
3. Test authentication and payment flows

## License

[Add your license information here]