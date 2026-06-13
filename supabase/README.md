# ASMPCS Supabase Setup Guide

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in.
2. Click **New project**.
3. Choose your organisation, set a project name (e.g. `asmpcs-portal`), set a database password, and select a region closest to Nigeria (e.g. **Europe West** or **US East**).
4. Wait 1–2 minutes for the project to spin up.

## 2. Get Your Project URL and Anon Key

1. In the Supabase dashboard, go to **Project Settings → API**.
2. Copy the **Project URL** (looks like `https://xxxxxxxxxxx.supabase.co`).
3. Copy the **anon public** key under **Project API Keys**.

## 3. Update the .env File

Open `.env` at the project root and replace the placeholders:

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> `.env` is in `.gitignore` — it will never be committed.
> Never share these values or paste them in public.

## 4. Run the Migration

1. In the Supabase dashboard, go to **SQL Editor**.
2. Click **New query**.
3. Open `supabase/migrations/001_initial_schema.sql` from this project.
4. Copy the entire file contents and paste into the SQL editor.
5. Click **Run** (or press `Ctrl+Enter`).

This creates all 11 tables, all indexes, the `update_updated_at` trigger function, and enables Row Level Security with all policies.

## 5. Run the Seed Data

1. In the **SQL Editor**, click **New query** again.
2. Open `supabase/seed.sql` from this project.
3. Copy the entire file contents and paste into the SQL editor.
4. Click **Run**.

This inserts:
- 5 sample members with Nigerian names and FAAN/NAAM staff IDs
- 12 months of contribution records per member for 2025 (and 2 members for 2024)
- 2 active loans with full repayment schedules and guarantors
- 8 commodities across all 4 categories
- 10 notifications for the primary test member
- Dividend records for 2024 and 2025

> **Note:** Sample members are inserted without `auth_id`. To link a real Supabase auth user (after they sign up), run:
> ```sql
> UPDATE members
> SET auth_id = '<auth-user-uuid-from-supabase-auth-dashboard>'
> WHERE staff_id = 'FAAN-2018-0214';
> ```

## 6. Verify the Setup

Run these queries in the SQL Editor to confirm everything is in order:

```sql
-- Check tables were created
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check member count
SELECT COUNT(*) FROM members;

-- Check contribution count
SELECT COUNT(*) FROM savings_contributions;

-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

## 7. Auth Setup (When Ready to Wire Login)

1. In **Authentication → Providers**, ensure **Email** is enabled.
2. In **Authentication → URL Configuration**, set the **Site URL** to your Expo app URL (for development: `exp://localhost:8081`).
3. Optionally disable **Confirm email** during development (Authentication → Settings → Disable email confirmations).

## File Structure

```
supabase/
  migrations/
    001_initial_schema.sql   ← All tables, indexes, triggers, RLS
  seed.sql                   ← Development sample data
  README.md                  ← This file
src/
  lib/
    supabase.ts              ← Supabase client (import { supabase } from here)
.env                         ← Your credentials (never commit this)
```

## Using the Client in Code

```typescript
import { supabase } from '../src/lib/supabase';

// Example: fetch the current user's member record
const { data, error } = await supabase
  .from('members')
  .select('*')
  .eq('auth_id', (await supabase.auth.getUser()).data.user?.id)
  .single();
```
