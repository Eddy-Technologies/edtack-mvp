# Database Organization

This directory contains all database-related files organized for easy management, vetting, and quick resets.

## 📁 Structure

```
database/
├── README.md                    # This documentation
├── tables/                      # Individual table files (1 per table)
│   ├── 001_app_users.sql       # Custom user authentication
│   ├── 002_roles.sql           # User roles (PARENT, TEACHER, STUDENT)
│   ├── 003_level_types.sql     # Education levels (Primary 1-6, etc.)
│   ├── 004_user_infos.sql      # User profile data + triggers
│   ├── 005_user_emails.sql     # User email management
│   ├── 006_user_phones.sql     # User phone management
│   ├── 007_user_roles.sql      # User-role relationships + triggers
│   ├── 008_parent_child.sql    # Parent-child relationships + triggers
│   ├── 009_groups.sql          # Groups (class/family)
│   ├── 010_group_memberships.sql
│   ├── 011_family_group_constraints.sql + triggers
│   ├── 012_class_group_constraints.sql + triggers
│   ├── 013_subjects.sql        # Singapore curriculum subjects
│   ├── 014_syllabus.sql        # Curriculum syllabus structure
│   ├── 015_questions.sql       # Question bank
│   ├── 016_question_options.sql
│   ├── 017_question_correct_answers.sql
│   ├── 018_user_question_attempts.sql
│   ├── 019_user_question_answers.sql
│   ├── 020_codes.sql           # System constants + codes
│   ├── 021_user_credits.sql    # Internal credit tracking
│   ├── 022_credit_transactions.sql # Credit transaction history
│   ├── 023_products.sql        # E-commerce products
│   ├── 024_orders.sql          # Order management
│   ├── 025_order_items.sql     # Order line items
│   ├── 026_wishlists.sql       # User wishlists
│   ├── 027_task_credit.sql     # Task-based credit earning
│   ├── 028_stripe_webhook_events.sql # Stripe webhook tracking
│   ├── 100_views.sql           # Database views (all_users, leaderboard)
│   └── 200_functions.sql       # Shared functions and extensions
├── seeds/
│   └── all_seeds.sql           # All seed data in one file
├── drop/
│   └── drop_all.sql            # Complete database reset
└── scripts/
    ├── reset.js                # Full database reset utility
    ├── migrate.js              # Run all table files in order
    └── seed.js                 # Insert all seed data
```

## 🚀 Quick Commands

```bash
# Complete database reset + migration + seeding
pnpm db:fresh

# Individual operations
pnpm db:reset      # Drop everything (uses Supabase reset)
pnpm db:migrate    # Create all tables in order
pnpm db:seed       # Insert all seed data

# Generate TypeScript types after changes
pnpm db:types
```

## 📋 Table Organization

### **Core User System (001-012)**
- Authentication, roles, user profiles
- Parent-child relationships
- Group management (family/class)

### **Question System (013-019)**
- Singapore curriculum subjects
- Question bank with options and answers
- User attempts and scoring

### **Business Logic (020-028)**
- System codes and constants
- Credit/payment system
- E-commerce (products, orders)
- Task-based rewards
- Stripe integration

### **Views & Functions (100-200)**
- Database views for complex queries
- Shared functions and utilities

## 🌱 Seed Data Contents

- **Roles**: PARENT, TEACHER, STUDENT
- **Level Types**: Primary 1-6, Secondary 1-5, JC 1-2
- **Subjects**: Singapore education subjects (Math, English, Science, etc.)
- **System Codes**: Order statuses, operation types, task statuses
- **Sample Products**: 8 test products (gift cards, games, education)
- **User Credits**: Initialize credit records for existing users

## 🔄 Development Workflow

1. **Make schema changes**: Edit individual table files
2. **Test locally**: `pnpm db:fresh`
3. **Verify data**: Check tables and relationships
4. **Update types**: `pnpm db:types`
5. **Commit changes**: Version control your changes

## 📝 File Naming Convention

- `001-099`: Core tables (users, auth, relationships)
- `100-199`: Views and computed data
- `200-299`: Functions, triggers, and utilities

Each table file includes:
- CREATE TABLE statement
- Related indexes and constraints
- Table-specific triggers and functions
- Comments explaining the table purpose

## ⚠️ Important Notes

- **Dependencies**: Files are numbered to ensure proper creation order
- **Safety**: Always backup production data before running scripts
- **Testing**: Use sample data for development (marked with `sample_data: true`)
- **Clean up**: Remove test data before production deployment

## 🔧 Troubleshooting

- **Migration fails**: Check table dependencies in the error
- **Seed fails**: Verify all tables exist before seeding
- **Types outdated**: Run `pnpm db:types` after schema changes
- **Reset issues**: Ensure you have proper database permissions

## 📊 Database Features

- **Row Level Security (RLS)**: Enabled on sensitive tables
- **Triggers**: Automatic timestamps, validation, and constraints
- **Indexes**: Optimized for common query patterns
- **Extensions**: pgcrypto for UUID generation
- **Views**: Convenient access to complex joined data