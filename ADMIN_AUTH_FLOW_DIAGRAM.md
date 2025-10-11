# Admin Authentication Flow Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          ADMIN AUTHENTICATION SYSTEM                     │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│ 1. FIRST ADMIN CREATION FLOW                                             │
└──────────────────────────────────────────────────────────────────────────┘

   User                  Frontend               Supabase Auth      Database
    │                       │                         │               │
    ├──GET /admin/login────>│                         │               │
    │                       │                         │               │
    │                       ├──Check admin exists────────────────────>│
    │                       │                         │               │
    │                       │<────────admin_users table empty─────────┤
    │                       │                         │               │
    │<──Show signup form────┤                         │               │
    │                       │                         │               │
    ├──Submit signup form──>│                         │               │
    │                       │                         │               │
    │                       ├──signUp(email, pwd)────>│               │
    │                       │                         │               │
    │                       │<──auth.users created────┤               │
    │                       │                         │               │
    │                       ├──INSERT admin_users────────────────────>│
    │                       │   (id, email, role='superadmin')        │
    │                       │                         │               │
    │                       │                         │  ┌──RLS Check───┐
    │                       │                         │  │Table empty?  │
    │                       │                         │  │YES → Allow   │
    │                       │                         │  └──────────────┘
    │                       │                         │               │
    │                       │<────────Success─────────────────────────┤
    │                       │                         │               │
    │<──Success message─────┤                         │               │
    │                       │                         │               │

┌──────────────────────────────────────────────────────────────────────────┐
│ 2. SUPERADMIN LOGIN FLOW                                                 │
└──────────────────────────────────────────────────────────────────────────┘

   User                  Frontend               Supabase Auth      Database
    │                       │                         │               │
    ├──GET /admin/login────>│                         │               │
    │                       │                         │               │
    │                       ├──Check admin exists────────────────────>│
    │                       │                         │               │
    │                       │<────────admin exists────────────────────┤
    │                       │                         │               │
    │<──Show login form─────┤                         │               │
    │                       │                         │               │
    ├──Submit login form───>│                         │               │
    │                       │                         │               │
    │                       ├──signIn(email, pwd)────>│               │
    │                       │                         │               │
    │                       │<──Session created───────┤               │
    │                       │                         │               │
    │                       ├──Check admin status────────────────────>│
    │                       │   SELECT * FROM admin_users             │
    │                       │   WHERE id = auth.uid()                 │
    │                       │                         │               │
    │                       │                         │  ┌──RLS Check───┐
    │                       │                         │  │id=auth.uid()?│
    │                       │                         │  │YES → Allow   │
    │                       │                         │  └──────────────┘
    │                       │                         │               │
    │                       │<────────Admin record────────────────────┤
    │                       │   {id, email, role='superadmin'}        │
    │                       │                         │               │
    │<──Redirect to dashboard┤                        │               │
    │                       │                         │               │

┌──────────────────────────────────────────────────────────────────────────┐
│ 3. SUPERADMIN CREATES NEW ADMIN                                          │
└──────────────────────────────────────────────────────────────────────────┘

 Superadmin              Frontend               Supabase Auth      Database
    │                       │                         │               │
    ├──Request: Create admin>│                        │               │
    │                       │                         │               │
    │                       ├──Create auth user──────>│               │
    │                       │                         │               │
    │                       │<──User created──────────┤               │
    │                       │                         │               │
    │                       ├──INSERT admin_users────────────────────>│
    │                       │   (id, email, role='admin')             │
    │                       │                         │               │
    │                       │                         │  ┌──RLS Check───┐
    │                       │                         │  │auth.uid() is │
    │                       │                         │  │superadmin?   │
    │                       │                         │  │YES → Allow   │
    │                       │                         │  └──────────────┘
    │                       │                         │               │
    │                       │<────────Success─────────────────────────┤
    │                       │                         │               │
    │<──Success message─────┤                         │               │
    │                       │                         │               │

┌──────────────────────────────────────────────────────────────────────────┐
│ 4. REGULAR ADMIN LOGIN (Read-Only)                                       │
└──────────────────────────────────────────────────────────────────────────┘

   Admin                 Frontend               Supabase Auth      Database
    │                       │                         │               │
    ├──Login───────────────>│                         │               │
    │                       │                         │               │
    │                       ├──signIn────────────────>│               │
    │                       │                         │               │
    │                       │<──Session created───────┤               │
    │                       │                         │               │
    │                       ├──Check admin status────────────────────>│
    │                       │   SELECT * FROM admin_users             │
    │                       │   WHERE id = auth.uid()                 │
    │                       │                         │               │
    │                       │                         │  ┌──RLS Check───┐
    │                       │                         │  │id=auth.uid()?│
    │                       │                         │  │YES → Allow   │
    │                       │                         │  └──────────────┘
    │                       │                         │               │
    │                       │<────────Admin record────────────────────┤
    │                       │   {id, email, role='admin'}             │
    │                       │                         │               │
    │<──Access granted──────┤                         │               │
    │   (read-only)         │                         │               │
    │                       │                         │               │
    ├──Try to create admin─>│                         │               │
    │                       │                         │               │
    │                       ├──INSERT admin_users────────────────────>│
    │                       │                         │               │
    │                       │                         │  ┌──RLS Check───┐
    │                       │                         │  │auth.uid() is │
    │                       │                         │  │superadmin?   │
    │                       │                         │  │NO → DENY     │
    │                       │                         │  └──────────────┘
    │                       │                         │               │
    │                       │<────────ERROR───────────────────────────┤
    │                       │   "Permission denied"                   │
    │                       │                         │               │
    │<──Error message───────┤                         │               │
    │                       │                         │               │
```

## RLS Policy Logic

```
┌─────────────────────────────────────────────────────────────────────────┐
│ admin_access_policy - Comprehensive Access Control                      │
└─────────────────────────────────────────────────────────────────────────┘

USING Clause (Read Access - SELECT, UPDATE, DELETE conditions)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    ┌────────────────────────────────────────────┐
    │ Is admin_users table empty?                │
    │                                            │
    │  YES ──> ALLOW (first admin creation)      │
    │   NO ──> Continue to next check            │
    └────────────────────────────────────────────┘
                      │
                      ↓
    ┌────────────────────────────────────────────┐
    │ Is current user a superadmin?              │
    │ (role = 'superadmin')                      │
    │                                            │
    │  YES ──> ALLOW (full access to all rows)   │
    │   NO ──> Continue to next check            │
    └────────────────────────────────────────────┘
                      │
                      ↓
    ┌────────────────────────────────────────────┐
    │ Is user reading their own record?          │
    │ (id = auth.uid() AND user is admin)        │
    │                                            │
    │  YES ──> ALLOW (read own record only)      │
    │   NO ──> DENY                              │
    └────────────────────────────────────────────┘


WITH CHECK Clause (Write Access - INSERT, UPDATE validation)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    ┌────────────────────────────────────────────┐
    │ Is admin_users table empty?                │
    │                                            │
    │  YES ──> ALLOW (first admin creation)      │
    │   NO ──> Continue to next check            │
    └────────────────────────────────────────────┘
                      │
                      ↓
    ┌────────────────────────────────────────────┐
    │ Is current user a superadmin?              │
    │ (role = 'superadmin')                      │
    │                                            │
    │  YES ──> ALLOW (can create/modify admins)  │
    │   NO ──> DENY                              │
    └────────────────────────────────────────────┘
```

## Database Schema

```
┌─────────────────────────────────────────────────────────────────────────┐
│ admin_users table                                                        │
├─────────────────────────────────────────────────────────────────────────┤
│ Column        │ Type          │ Constraints                             │
├───────────────┼───────────────┼─────────────────────────────────────────┤
│ id            │ uuid          │ PRIMARY KEY, FK(auth.users.id)          │
│ email         │ text          │ UNIQUE NOT NULL                         │
│ role          │ text          │ NOT NULL, CHECK(IN('superadmin','admin'))│
│ created_at    │ timestamptz   │ DEFAULT now()                           │
└─────────────────────────────────────────────────────────────────────────┘

Row Level Security: ENABLED
Policy: admin_access_policy (FOR ALL operations)
```

## Security Model

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Access Matrix                                                            │
├─────────────────────────────────────────────────────────────────────────┤
│ Operation        │ First Admin │ Superadmin │ Regular Admin │ User      │
├──────────────────┼─────────────┼────────────┼───────────────┼───────────┤
│ Create First     │ ✓ YES       │ N/A        │ N/A           │ N/A       │
│ View All Admins  │ ✗ NO        │ ✓ YES      │ ✗ NO          │ ✗ NO      │
│ View Own Record  │ ✓ YES       │ ✓ YES      │ ✓ YES         │ ✗ NO      │
│ Create Admin     │ ✗ NO        │ ✓ YES      │ ✗ NO          │ ✗ NO      │
│ Update Admin     │ ✗ NO        │ ✓ YES      │ ✗ NO          │ ✗ NO      │
│ Delete Admin     │ ✗ NO        │ ✓ YES      │ ✗ NO          │ ✗ NO      │
└─────────────────────────────────────────────────────────────────────────┘
```
