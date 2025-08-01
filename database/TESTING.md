# Database Testing Guide

## 🧪 Local Development Testing

### **Step 1: Prerequisites**
```bash
# Ensure you have Supabase CLI installed
pnpm install -g @supabase/cli

# Verify installation
supabase --version

# Make sure you're in project root
cd /Users/jeremythng/Projects/edtack-mvp
```

### **Step 2: Start Local Supabase**
```bash
# Start local Supabase (Docker required)
supabase start

# This will give you:
# - API URL: http://localhost:54321
# - GraphQL URL: http://localhost:54321/graphql/v1
# - DB URL: postgresql://postgres:postgres@localhost:54322/postgres
# - Studio URL: http://localhost:54323
# - Inbucket URL: http://localhost:54324
# - JWT secret: [some-secret]
# - anon key: [some-key]
# - service_role key: [some-key]
```

### **Step 3: Test Database Scripts**

#### **Test Individual Scripts:**
```bash
# Test migration only
pnpm db:migrate
# ✅ Should create all 30 tables (001-028 + views + functions)

# Test seeding only  
pnpm db:seed
# ✅ Should insert roles, subjects, products, codes, etc.

# Test type generation
pnpm db:types
# ✅ Should update types/supabase.ts with new schema
```

#### **Test Complete Flow:**
```bash
# Test full reset + setup
pnpm db:fresh
# ✅ Should complete without errors
# ✅ All tables should be created
# ✅ All seed data should be inserted
```

### **Step 4: Verification Queries**

Open Supabase Studio: `http://localhost:54323`

Run these verification queries in the SQL Editor:

```sql
-- 1. Verify all tables exist
SELECT schemaname, tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
-- ✅ Should show 28+ tables

-- 2. Verify seed data
SELECT 'Roles' as type, count(*) as count FROM roles
UNION ALL
SELECT 'Level Types', count(*) FROM level_types  
UNION ALL
SELECT 'Subjects', count(*) FROM subjects
UNION ALL
SELECT 'Products', count(*) FROM products
UNION ALL  
SELECT 'System Codes', count(*) FROM codes;
-- ✅ Should show: Roles(3), Level Types(13), Subjects(18), Products(8), Codes(20+)

-- 3. Verify views work
SELECT * FROM all_users LIMIT 5;
SELECT * FROM leaderboard LIMIT 5;
-- ✅ Views should return data without errors

-- 4. Verify foreign key relationships
SELECT 
  tc.table_name, 
  kcu.column_name,
  ccu.table_name AS referenced_table,
  ccu.column_name AS referenced_column
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name;
-- ✅ Should show proper relationships between tables
```

### **Step 5: Test Application Integration**

```bash
# Start your Nuxt app
pnpm dev

# Test key functions:
# ✅ User registration/login works
# ✅ Credits system functions
# ✅ Shop/products load
# ✅ Question system works
# ✅ Parent-child relationships work
```

## 🚀 **Production Deployment**

### **Option 1: Supabase Hosted (Recommended)**

#### **1. Create Production Project**
```bash
# Login to Supabase
supabase login

# Link to your production project
supabase link --project-ref YOUR_PROJECT_REF

# Or create new project
supabase projects create your-project-name
```

#### **2. Deploy Database Schema**
```bash
# Push local schema to production
supabase db push

# This will:
# ✅ Create all tables in production
# ✅ Apply all constraints and indexes
# ✅ Set up RLS policies
```

#### **3. Seed Production Data**
```bash
# Run seed data (be careful - this adds sample data!)
supabase db push --file database/seeds/all_seeds.sql

# Or manually run only essential seeds:
# - Skip sample products
# - Keep roles, subjects, level_types, codes
```

#### **4. Generate Production Types**
```bash
# Generate types from production schema
supabase gen types typescript --linked > types/supabase.ts
```

### **Option 2: Self-Hosted PostgreSQL**

#### **1. Connect to Production Database**
```bash
# Set production database URL
export DATABASE_URL="postgresql://user:pass@host:port/dbname"

# Or create .env.production
echo "DATABASE_URL=your-production-url" > .env.production
```

#### **2. Run Migrations**
```bash
# You'll need to modify scripts to use psql instead of Supabase CLI
# Example:
psql $DATABASE_URL -f database/drop/drop_all.sql
psql $DATABASE_URL -f database/tables/001_app_users.sql
# ... continue for all files
```

## 🔍 **Testing Checklist**

### **Database Structure Tests:**
- [ ] All 30 table files execute without errors
- [ ] All foreign key relationships are valid
- [ ] All indexes are created
- [ ] All triggers function correctly
- [ ] All RLS policies are applied

### **Seed Data Tests:**
- [ ] Roles: 3 records (PARENT, TEACHER, STUDENT)
- [ ] Level Types: 13 records (Primary 1-6, Secondary 1-5, JC 1-2)
- [ ] Subjects: 18 Singapore curriculum subjects
- [ ] System Codes: Order statuses, operation types, task statuses
- [ ] Sample Products: 8 test products (can remove in production)

### **Application Integration Tests:**
- [ ] User registration creates proper records
- [ ] Parent-child relationships work
- [ ] Credit system functions
- [ ] Order/purchase flow works
- [ ] Question/answer system functions
- [ ] Webhook processing works

### **Performance Tests:**
- [ ] Complex queries (leaderboard) perform well
- [ ] Concurrent user operations don't conflict
- [ ] Credit transactions are atomic
- [ ] Order processing is reliable

## 🚨 **Common Issues & Solutions**

### **Migration Fails:**
```bash
# Check dependencies
# Tables must be created in numbered order (001, 002, etc.)
# Foreign keys reference tables created earlier

# Fix: Check error message, verify table dependencies
```

### **Seed Data Fails:**
```bash
# Usually due to missing tables or constraint violations
# Fix: Run migrations first, then seeds

pnpm db:migrate
pnpm db:seed
```

### **Type Generation Fails:**
```bash
# Make sure database is accessible
# Fix: Check connection, verify schema exists

supabase status  # Check if local DB is running
```

### **Production Deploy Issues:**
```bash
# Check Supabase project settings
# Verify environment variables
# Check RLS policies aren't blocking operations
```

## 📊 **Monitoring Production**

### **Database Health Checks:**
```sql
-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(tablename::text)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(tablename::text) DESC;

-- Check active connections
SELECT count(*) as active_connections 
FROM pg_stat_activity;

-- Check recent errors
SELECT * FROM pg_stat_database WHERE datname = current_database();
```

### **Application Monitoring:**
- Monitor credit transaction volumes
- Track order processing success rates
- Watch for authentication failures
- Monitor webhook processing

This comprehensive testing approach ensures your database implementation is solid both in development and production!