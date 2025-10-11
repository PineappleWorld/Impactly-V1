# Admin Authentication System - Test Plan

## Prerequisites
- Supabase project set up
- Database migrations applied up to 20251004033258
- Application deployed

## Test Scenarios

### Test 1: Apply Migration
**Objective**: Verify migration executes without errors

**Steps**:
1. Open Supabase Dashboard
2. Navigate to SQL Editor
3. Copy contents of `supabase/migrations/20251011000000_fix_admin_authentication_system.sql`
4. Paste into SQL Editor
5. Execute

**Expected Results**:
- ✅ Migration executes successfully
- ✅ No error messages
- ✅ admin_users table structure updated
- ✅ CHECK constraint added
- ✅ Old policies removed
- ✅ New policy created

**Verification SQL**:
```sql
-- Check table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'admin_users';

-- Check constraints
SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_name = 'admin_users_role_check';

-- Check policies
SELECT policyname 
FROM pg_policies 
WHERE tablename = 'admin_users';
```

---

### Test 2: First Admin Creation
**Objective**: Create the first superadmin account

**Preconditions**:
- admin_users table is empty
- User is not logged in

**Steps**:
1. Navigate to `/admin/login`
2. Verify "Create Admin Account" form is displayed
3. Enter email: `admin@impactly.test`
4. Enter password: `SecurePassword123!`
5. Click "Create Admin Account"

**Expected Results**:
- ✅ Success message displayed
- ✅ Account created in auth.users
- ✅ Record created in admin_users with:
  - id: matches auth.users.id
  - email: admin@impactly.test
  - role: superadmin
  - created_at: current timestamp

**Verification SQL**:
```sql
SELECT au.id, au.email, au.role, au.created_at
FROM admin_users au
JOIN auth.users u ON au.id = u.id
WHERE au.email = 'admin@impactly.test';
```

---

### Test 3: Superadmin Login
**Objective**: Verify superadmin can log in

**Preconditions**:
- First admin account created

**Steps**:
1. Navigate to `/admin/login`
2. Verify login form is displayed (not signup form)
3. Enter email: `admin@impactly.test`
4. Enter password: `SecurePassword123!`
5. Click "Sign In"

**Expected Results**:
- ✅ User is authenticated
- ✅ Redirected to `/admin/dashboard`
- ✅ Admin dashboard displays
- ✅ User email shown in header
- ✅ Sign Out button available

---

### Test 4: Superadmin Access to Dashboard
**Objective**: Verify superadmin can access all features

**Preconditions**:
- Logged in as superadmin

**Steps**:
1. On admin dashboard, verify tabs are visible:
   - Featured
   - Data Sync
   - API Keys
   - Payment
   - Security
2. Click on each tab
3. Attempt to modify settings

**Expected Results**:
- ✅ All tabs accessible
- ✅ Can view settings
- ✅ Can modify settings
- ✅ Changes are saved successfully

---

### Test 5: Create Additional Admin (Superadmin)
**Objective**: Superadmin creates another superadmin

**Preconditions**:
- Logged in as superadmin
- Has Supabase access

**Steps**:
1. Execute SQL as superadmin:
```sql
-- First create auth user
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at)
VALUES (
  gen_random_uuid(),
  'admin2@impactly.test',
  crypt('SecurePassword456!', gen_salt('bf')),
  now()
);

-- Then create admin record
INSERT INTO admin_users (id, email, role)
SELECT id, email, 'superadmin'
FROM auth.users
WHERE email = 'admin2@impactly.test';
```

**Expected Results**:
- ✅ Second superadmin created successfully
- ✅ Can log in with new credentials
- ✅ Has full admin access

**Note**: In production, this would be done through an admin UI, not SQL.

---

### Test 6: Create Regular Admin
**Objective**: Superadmin creates a regular admin

**Steps**:
1. Execute SQL as superadmin:
```sql
-- First create auth user
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at)
VALUES (
  gen_random_uuid(),
  'regularadmin@impactly.test',
  crypt('SecurePassword789!', gen_salt('bf')),
  now()
);

-- Then create admin record with role='admin'
INSERT INTO admin_users (id, email, role)
SELECT id, email, 'admin'
FROM auth.users
WHERE email = 'regularadmin@impactly.test';
```

**Expected Results**:
- ✅ Regular admin created successfully
- ✅ Role is 'admin', not 'superadmin'

---

### Test 7: Regular Admin Login and Access
**Objective**: Verify regular admin has limited access

**Preconditions**:
- Regular admin account created

**Steps**:
1. Log in as regular admin
2. Navigate to dashboard
3. Attempt to view settings
4. Attempt to modify settings (if possible)

**Expected Results**:
- ✅ Can log in successfully
- ✅ Can view own admin record
- ✅ **Cannot** create new admins
- ✅ May have read-only access to settings (depends on other policies)

---

### Test 8: Prevent Second First Admin
**Objective**: Verify cannot create admin via signup when admins exist

**Preconditions**:
- At least one admin exists
- User is not logged in

**Steps**:
1. Navigate to `/admin/login`
2. Verify login form is displayed
3. Verify signup form is NOT displayed

**Expected Results**:
- ✅ Only login form visible
- ✅ No option to create new admin account
- ✅ Cannot bypass via API calls (RLS prevents it)

---

### Test 9: Role Constraint Validation
**Objective**: Verify invalid roles are rejected

**Steps**:
1. Attempt to insert admin with invalid role:
```sql
INSERT INTO admin_users (id, email, role)
VALUES (
  gen_random_uuid(),
  'invalid@impactly.test',
  'invalidrole'
);
```

**Expected Results**:
- ✅ Insert fails with CHECK constraint violation
- ✅ Error message mentions role constraint

---

### Test 10: RLS Policy Enforcement
**Objective**: Verify non-admin users cannot access admin_users

**Steps**:
1. Create regular user (not admin)
2. Attempt to query admin_users table

**Expected Results**:
- ✅ Query returns empty result (not error, but no rows)
- ✅ Cannot see other users' admin records
- ✅ Cannot insert own admin record

---

## Negative Tests

### N1: Cannot Create Admin When One Exists
```sql
-- This should fail (when admins exist)
INSERT INTO admin_users (id, email, role)
VALUES (gen_random_uuid(), 'test@test.com', 'superadmin');
```
**Expected**: INSERT fails due to RLS policy

### N2: Regular Admin Cannot Create Other Admins
**Precondition**: Logged in as regular admin
```sql
INSERT INTO admin_users (id, email, role)
VALUES (gen_random_uuid(), 'newadmin@test.com', 'admin');
```
**Expected**: INSERT fails due to RLS policy

### N3: Invalid Role Rejected
```sql
INSERT INTO admin_users (id, email, role)
VALUES (gen_random_uuid(), 'test@test.com', 'manager');
```
**Expected**: CHECK constraint violation

---

## Rollback Test

### Test 11: Rollback Procedure
**Objective**: Verify system can be restored if needed

**Steps**:
1. Document current state
2. Create rollback migration to restore previous policies
3. Test that old behavior is restored
4. Re-apply new migration

**Expected Results**:
- ✅ Can rollback to previous state
- ✅ Can re-apply new migration
- ✅ Data integrity maintained

---

## Performance Tests

### Test 12: Policy Performance
**Objective**: Verify RLS policies don't cause performance issues

**Steps**:
1. Insert 1000 admin records (using seed script)
2. Query admin_users as superadmin
3. Measure query time
4. Query admin_users as regular admin
5. Measure query time

**Expected Results**:
- ✅ Superadmin queries complete in < 100ms
- ✅ Regular admin queries complete in < 50ms
- ✅ No infinite recursion errors
- ✅ No timeout errors

---

## Sign-off Checklist

- [ ] Migration applied successfully
- [ ] First admin created
- [ ] Superadmin login works
- [ ] Regular admin login works
- [ ] RLS policies enforce correctly
- [ ] Role constraint works
- [ ] Negative tests pass
- [ ] Performance acceptable
- [ ] Documentation complete
- [ ] Ready for production

---

## Troubleshooting

### Issue: Migration fails
**Solution**: Check for existing data with null roles, fix data first

### Issue: Cannot create first admin
**Solution**: Verify admin_users table is truly empty, check RLS is enabled

### Issue: Infinite recursion error
**Solution**: Verify old policies are dropped, only new policy exists

### Issue: Regular admin has too much access
**Solution**: Review other table policies that reference admin_users
