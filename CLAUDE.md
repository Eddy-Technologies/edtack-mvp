# EdTack MVP - Project Context for AI Assistance

## Project Overview

**Tech Stack**: Nuxt 3, TypeScript, Supabase (PostgreSQL), Stripe, Google AI (Gemini 2.0)
**Purpose**: Educational technology platform with family management, credit system, and AI-powered tutoring
**Architecture**: Server-side API routes, Row Level Security (RLS) database, dual authentication (Supabase + JWT)

### Key Features
- Multi-authentication system (Supabase Auth + OAuth + Custom JWT)
- Family relationship management (parent-child, groups)
- Credit-based payment system (1 credit = 10 cents SGD)
- AI-powered educational content and chat
- Stripe subscription management with automatic billing
- Question-answer system with performance tracking

## Critical File Map

### Authentication & Security
- `/server/utils/authConfig.ts` - Auth utilities, Supabase clients, JWT management
- `/middleware/auth.ts` - Route protection and user validation
- `/server/api/auth/` - Login, register, OAuth, password management endpoints

### Payment & Credits
- `/server/utils/stripe.ts` - Stripe integration, customer creation, credit management
- `/server/api/webhooks/stripe.post.ts` - Payment webhook processing with idempotency
- `/server/api/credits/` - Credit balance, transactions, transfers, top-ups

### Core Business Logic
- `/server/api/chat.post.ts` - AI-powered tutoring chat
- `/server/api/questions.post.ts` - Educational content generation
- `/server/api/shop/` - Product catalog management
- `/server/utils/useGenAi.ts` - Google Gemini AI integration

### Validation & Utils
- `/utils/validation.ts` - Basic email/password validation (needs expansion)
- `/nuxt.config.ts` - Runtime configuration, environment variables
- `/types/database.types.ts` - Auto-generated Supabase TypeScript types

## API Patterns & Conventions

### Route Structure
```typescript
// Pattern: /server/api/[feature]/[method].ts
defineEventHandler(async (event) => {
  // 1. Authentication check
  const user = await serverSupabaseUser(event);
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  
  // 2. Input validation (manual - opportunity for Zod)
  const body = await readBody(event);
  
  // 3. Business logic (mixed with handler - needs service layer)
  // 4. Database operations with RLS
  // 5. Return response or throw createError
});
```

### Error Handling Pattern
```typescript
throw createError({
  statusCode: 400|401|403|404|500,
  statusMessage: "Human-readable error message",
  data?: { additional: "context" }
});
```

### Authentication Patterns
- **Protected Routes**: Use `serverSupabaseUser(event)` for Supabase auth
- **Service Operations**: Use `getPrivilegedSupabaseClient()` for admin tasks
- **JWT Sessions**: Custom app user cookies (currently stubbed for production)

## Database Schema Summary

### Core Tables
- **user_infos**: User profiles with payment integration, family relationships
- **user_roles**, **roles**: Role-based access control system
- **credit_transactions**: Financial transaction history with Stripe integration
- **parent_child**: Family relationship management
- **groups**, **group_memberships**: Class/family grouping system
- **questions**, **question_options**, **question_correct_answers**: Educational content
- **education_documents**, **document_chunks**: Content management with embeddings
- **stripe_webhook_events**: Payment event tracking and idempotency

### Key Business Rules
- 1 credit = 10 cents SGD
- Family credit transfers between parent-child accounts
- RLS enabled for user data isolation
- Automatic free subscription creation for new Stripe customers
- Webhook idempotency using event IDs

### Database Views
- **all_users**: Unified view across authentication methods
- **leaderboard**: Performance analytics and rankings

## Authentication & Authorization

### Multi-Auth System
1. **Supabase Auth**: Primary authentication with email/password and OAuth
2. **Custom JWT**: App-specific user sessions (cookie-based)
3. **OAuth Providers**: Social login integration

### Permission Patterns
- **RLS Policies**: Database-level security for user data
- **Role-Based Access**: User roles for feature access control
- **Family Permissions**: Parent access to child accounts
- **Admin Operations**: Privileged Supabase client for system tasks

## Development Workflows

### Adding New API Endpoint
1. Create `/server/api/[feature]/[method].ts`
2. Use `defineEventHandler` pattern
3. Add authentication check if needed
4. Implement validation (consider Zod integration)
5. Add business logic (consider service layer)
6. Update CLAUDE.md if significant architectural change

### Database Changes
1. Make changes via Supabase dashboard
2. Update RLS policies if needed
3. Regenerate types: `npm run db:types`
4. Test with both user and service role clients

### Authentication Updates
1. Modify auth utilities in `/server/utils/authConfig.ts`
2. Update middleware if route protection changes
3. Test both Supabase and JWT auth flows

## Current Limitations & Scaling Opportunities

### Immediate Improvements Needed
- **Validation Framework**: Replace manual validation with Zod schemas
- **Service Layer**: Extract business logic from route handlers
- **Middleware Stack**: Add rate limiting, logging, error handling
- **Error Monitoring**: Centralized error tracking and alerting
- **API Documentation**: OpenAPI/Swagger documentation

### Scaling Architecture Gaps
- **Caching Layer**: Redis for frequently accessed data
- **Background Jobs**: Queue system for async processing
- **File Management**: Upload/storage system for content
- **Real-time Features**: WebSocket support for live updates
- **Performance Monitoring**: Query optimization and indexing

### Admin Panel Preparation
- **Enhanced RBAC**: More granular permission system
- **Audit Logging**: Track admin actions and changes
- **Bulk Operations**: Support for batch operations
- **Dashboard Analytics**: Administrative reporting features

### Inventory Management Preparation
- **Product Models**: Inventory data structure design
- **Stock Management**: Quantity tracking and alerts
- **Order Processing**: Purchase workflow and fulfillment
- **Integration Points**: Connect with education and payment systems

## Common Development Tasks

### Debugging Authentication Issues
1. Check Supabase user session validity
2. Verify RLS policies for data access
3. Test both authenticated and service role queries
4. Check JWT cookie configuration and expiry

### Adding New Payment Features
1. Extend Stripe integration in `/server/utils/stripe.ts`
2. Add webhook handling for new events
3. Update credit transaction models
4. Test with Stripe test environment

### AI Feature Development
1. Extend Google AI integration in `/server/utils/useGenAi.ts`
2. Add structured schema validation for AI responses
3. Implement conversation context management
4. Add error handling for AI API failures

## Maintenance Notes

**Last Updated**: 2025-07-30
**Current Branch**: stripe-no-payment
**Key Recent Changes**: Payment system integration, authentication improvements

### Update Triggers (When to Update This File)
- New API routes or major endpoint changes
- Database schema modifications
- Authentication flow changes
- New service integrations
- Architectural pattern changes
- Major dependency updates

**Token Count**: ~1,800 tokens - Optimized for AI context efficiency