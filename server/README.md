# Server API Documentation

This directory contains the server-side API routes and utilities for the EdTack MVP application.

## Directory Structure

```
server/
├── api/                 # API route handlers
│   ├── admin/          # Admin-only endpoints
│   ├── auth/           # Authentication endpoints
│   ├── characters/     # Character management
│   ├── chat.post.ts    # Chat functionality
│   ├── credits/        # Credit system
│   ├── family/         # Family/group management
│   ├── me.get.ts       # User profile
│   ├── notes/          # Notes CRUD
│   ├── orders/         # E-commerce orders
│   ├── shop/           # Shopping functionality
│   ├── subscription/   # Stripe subscriptions
│   ├── tasks/          # Task management
│   └── webhooks/       # External webhooks
├── middleware/         # Server middleware
├── plugins/           # Server plugins
├── services/          # Business logic services
├── tasks/             # Scheduled tasks
├── utils/             # Shared utilities
└── README.md          # This file
```

## Authentication System

The server uses a centralized authentication system with reusable utilities:

### Authentication Utilities (`utils/auth.ts`)

- **`requireAuth(event)`** - Validates user authentication, returns user object
- **`requireAdmin(event)`** - Validates admin role, returns user info with role
- **`getUserInfo(event)`** - Gets authenticated user's profile info

### Usage Examples

```typescript
// Basic authentication
const user = await requireAuth(event);

// Admin-only endpoints
const adminUser = await requireAdmin(event);

// Get user profile data
const userInfo = await getUserInfo(event);
```

## API Route Patterns

### Authentication Flow
1. Most endpoints use one of the auth utilities above
2. Error handling is standardized (401, 403, 404)
3. TypeScript types ensure type safety

### Response Format
```typescript
// Success responses
{
  success: true,
  data: {...},
  count?: number,
  total?: number
}

// Error responses (handled by createError)
{
  statusCode: number,
  statusMessage: string
}
```

## Services

### CodeService (`services/codeService.ts`)
Manages application codes and constants with caching:
- `getCodes(supabase, category)` - Get codes by category
- `getOrderStatuses()`, `getTaskStatuses()`, etc. - Typed helpers

## Testing

Run the following commands to validate server code:

```bash
# Lint checking
pnpm lint

# Type checking  
pnpm build

# Development server
pnpm dev
```