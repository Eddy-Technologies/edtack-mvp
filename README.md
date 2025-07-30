# EdTack MVP - Educational Technology Platform

EdTack is an AI-powered educational technology platform that enables family-based learning with credit management, AI tutoring, and performance tracking.

## Features

- **Multi-Authentication System**: Supabase Auth + OAuth + Custom JWT sessions
- **Family Management**: Parent-child relationships with credit transfers
- **AI-Powered Tutoring**: Google Gemini integration for personalized education
- **Credit System**: Stripe-integrated payment system (1 credit = 10 cents SGD)
- **Educational Content**: Question generation, performance tracking, and analytics
- **Subscription Management**: Automated Stripe billing and webhook processing

## Tech Stack

- **Framework**: Nuxt 3 with TypeScript
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Payments**: Stripe with subscription management
- **AI**: Google Gemini 2.0 Flash for educational content
- **Authentication**: Supabase Auth + OAuth providers
- **Deployment**: NuxtHub (Cloudflare)

## Project Structure

```
server/
├── api/
│   ├── auth/           # Authentication endpoints
│   ├── credits/        # Credit management
│   ├── chat.post.ts    # AI tutoring
│   ├── questions.post.ts # Educational content
│   ├── shop/           # Product management
│   └── webhooks/       # Stripe webhook processing
├── utils/
│   ├── authConfig.ts   # Auth utilities and Supabase clients
│   ├── stripe.ts       # Stripe integration
│   └── useGenAi.ts     # Google AI integration
middleware/
└── auth.ts             # Route protection
types/
└── database.types.ts   # Auto-generated Supabase types
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm
- Supabase account and project
- Stripe account (test mode for development)
- Google AI Studio API key

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd edtack-mvp
```

2. Install dependencies
```bash
npm install
# or
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

# Google AI
GOOGLE_AI_STUDIO_API_KEY=your_google_ai_api_key

# JWT
JWT_SECRET=your_jwt_secret_key
```

4. Set up database
   - Create tables using Supabase dashboard or migrations
   - Enable Row Level Security (RLS) policies
   - Generate TypeScript types: `npm run db:types`

5. Configure Stripe
   - Set up products and pricing in Stripe dashboard
   - Configure webhook endpoint for your development environment

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Key Development Commands

```bash
# Development server
npm run dev

# Generate database types
npm run db:types

# Build for production
npm run build

# Production preview
npm run preview
```

## Architecture Overview

### Authentication Flow
- **Supabase Auth**: Primary authentication with email/password and OAuth
- **Custom JWT**: App-specific user sessions via secure cookies
- **RLS Policies**: Database-level security for user data isolation

### Payment System
- **Credit-Based**: 1 credit = 10 cents SGD
- **Family Transfers**: Parents can transfer credits to children
- **Webhook Processing**: Automated transaction recording via Stripe webhooks
- **Subscription Management**: Automatic billing and customer management

### AI Integration
- **Educational Content**: AI-generated questions and explanations
- **Conversation Context**: Maintains chat history for personalized tutoring
- **Performance Tracking**: Analytics on user progress and engagement

## Database Schema

### Core Tables
- `user_infos`: User profiles with payment integration
- `user_roles`, `roles`: Role-based access control
- `credit_transactions`: Financial transaction history
- `parent_child`: Family relationship management
- `groups`, `group_memberships`: Class/family grouping
- `questions`, `question_options`: Educational content
- `education_documents`, `document_chunks`: Content with embeddings

### Key Business Rules
- Family credit transfers between parent-child accounts
- RLS policies ensure user data isolation
- Automatic free subscription creation for new users
- Webhook idempotency using Stripe event IDs

## Development Guidelines

### Adding New API Endpoints
1. Create route file in `/server/api/[feature]/[method].ts`
2. Use `defineEventHandler` pattern
3. Add authentication check for protected routes
4. Implement input validation
5. Follow error handling patterns with `createError`

### Database Changes
1. Make schema changes via Supabase dashboard
2. Update RLS policies as needed
3. Regenerate TypeScript types
4. Test with both user and service role clients

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
4. Ensure RLS policies work correctly

## License

[Add your license information here]