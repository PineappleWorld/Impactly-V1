# Admin Authentication System Fix

## Overview
This fix addresses the admin authentication system by updating the database schema and application code to properly handle admin user creation and access control.

## Changes Made

### 1. Database Migration (supabase/migrations/20251011000000_fix_admin_authentication_system.sql)

#### Table Structure Updates
- Added CHECK constraint on `role` column to enforce valid values: `'superadmin'` or `'admin'`
- Ensured `role` column is NOT NULL
- Maintained existing table structure: `id`, `email`, `role`, `created_at`, `updated_at`

#### RLS Policy Changes
Replaced all existing conflicting policies with a single comprehensive policy named `admin_access_policy` that:

1. **Allows first admin creation**: When the `admin_users` table is empty, any authenticated user can create the first admin
2. **Superadmin full access**: Superadmins can perform all operations (SELECT, INSERT, UPDATE, DELETE)
3. **Admin read access**: Regular admins can read their own admin record

### 2. Application Code Updates (app/admin/login/page.tsx)

Updated the admin signup handler to insert complete admin user data:
- `id`: User ID from auth.users
- `email`: User's email address
- `role`: Set to `'superadmin'` for the first admin user

## How It Works

### First Admin Creation Flow
1. User navigates to `/admin/login`
2. If no admin exists, signup form is displayed
3. User creates account with email/password
4. Account is created in `auth.users`
5. Admin record is inserted with `role='superadmin'`
6. RLS policy allows this because table is empty

### Subsequent Admin Logins
1. User signs in with email/password
2. Application checks if user exists in `admin_users` table
3. RLS policy allows user to read their own record
4. User is granted admin access if record exists

### Admin Management
- Superadmins can create new admins (with role 'admin' or 'superadmin')
- Regular admins can only view their own record
- All admin operations are protected by RLS policies

## Testing

To test the implementation:
1. Run the migration in Supabase SQL Editor
2. Navigate to `/admin/login`
3. Create first admin account
4. Sign in and access admin dashboard
5. Verify superadmin can manage settings

## Security Considerations

- First admin creation is protected by requiring authentication
- Only superadmins can create additional admins
- Regular admins have read-only access to their own record
- Role changes require superadmin privileges
- RLS policies are enforced at the database level
