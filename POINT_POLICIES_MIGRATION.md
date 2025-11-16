# Point Policies Migration

## Overview

This migration adds Row Level Security (RLS) policies to the `point` table, enabling admins to create, update, and delete points through the Point Editor interface.

## Migration Details

- **File**: `20251114170000_add_admin_point_policies.sql`
- **Timestamp**: 2025-11-14 17:00:00
- **Previous Migration**: `20251114160000_add_image_storage.sql`

## What This Migration Does

### 1. Enables Row Level Security (RLS)

```sql
ALTER TABLE public.point ENABLE ROW LEVEL SECURITY;
```

**Why**: RLS ensures that database access is controlled by policies, not just application logic.

### 2. Adds Read Policy (Public Access)

```sql
CREATE POLICY "Everyone can view points"
ON public.point FOR SELECT
TO public
USING (true);
```

**Purpose**: All users (authenticated and anonymous) can view points.
**Use Case**: Players need to see points on the game map.

### 3. Adds Create Policy (Admin Only)

```sql
CREATE POLICY "Only admins can create points"
ON public.point FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_role
        WHERE user_role.user_id = auth.uid()
        AND user_role.role = 'admin'
    )
);
```

**Purpose**: Only authenticated admin users can create new points.
**Use Case**: Point Editor - "Add Point" functionality.

### 4. Adds Update Policy (Admin Only)

```sql
CREATE POLICY "Only admins can update points"
ON public.point FOR UPDATE
TO authenticated
USING (...)
WITH CHECK (...);
```

**Purpose**: Only authenticated admin users can modify existing points.
**Use Case**: Point Editor - "Edit Point" functionality.

### 5. Adds Delete Policy (Admin Only)

```sql
CREATE POLICY "Only admins can delete points"
ON public.point FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_role
        WHERE user_role.user_id = auth.uid()
        AND user_role.role = 'admin'
    )
);
```

**Purpose**: Only authenticated admin users can delete points.
**Use Case**: Point Editor - "Delete Point" functionality.

## Migration Timeline

```
20251114135117 - Add Map System
20251114142750 - Fix Get Floor Points Return Types
20251114150000 - Add Floor Image Dimensions
20251114150100 - Add Update Floor Dimensions Helper
20251114160000 - Add Image Storage
20251114170000 - Add Admin Point Policies ← NEW
```

## How to Apply Migration

### Local Development

```bash
# Navigate to project root
cd congress-ingress

# Apply migration using Supabase CLI
supabase db reset

# Or apply just this migration
supabase migration up
```

### Production

```bash
# Push migration to production
supabase db push

# Or apply via Supabase Dashboard
# Dashboard → Database → Migrations → Run migration
```

## Verification

After applying the migration, verify it worked:

### 1. Check RLS is Enabled

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'point' AND schemaname = 'public';
```

Expected result: `rowsecurity = true`

### 2. Check Policies Exist

```sql
SELECT policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'point';
```

Expected policies:
- `Everyone can view points` (SELECT, public)
- `Only admins can create points` (INSERT, authenticated)
- `Only admins can update points` (UPDATE, authenticated)
- `Only admins can delete points` (DELETE, authenticated)

### 3. Test Admin Access

```sql
-- As admin user, try to create a point
INSERT INTO point (name, type) 
VALUES ('Test Point', 'claimable');

-- Should succeed ✅
```

### 4. Test Non-Admin Access

```sql
-- As regular user, try to create a point
INSERT INTO point (name, type) 
VALUES ('Test Point', 'claimable');

-- Should fail with RLS error ❌
```

## What This Enables

### ✅ Point Editor Features

1. **Create Points** (`/admin/point`)
   - Admins can add new points
   - Form validates and inserts into database
   - Non-admins cannot create points

2. **Edit Points** (`/admin/point`)
   - Admins can modify point properties
   - Updates name, type, level, health, faction
   - Non-admins cannot edit points

3. **Delete Points** (`/admin/point`)
   - Admins can remove points
   - Includes confirmation dialog
   - Non-admins cannot delete points

4. **View Points** (all users)
   - Everyone can view points on map
   - Game displays points to all players
   - No authentication required for reading

### 🔒 Security Model

```
Authenticated Admin
├─ Can CREATE points    ✅
├─ Can UPDATE points    ✅
├─ Can DELETE points    ✅
└─ Can SELECT points    ✅

Authenticated User
├─ Can CREATE points    ❌
├─ Can UPDATE points    ❌
├─ Can DELETE points    ❌
└─ Can SELECT points    ✅

Anonymous User
├─ Can CREATE points    ❌
├─ Can UPDATE points    ❌
├─ Can DELETE points    ❌
└─ Can SELECT points    ✅
```

## Rollback

If needed, you can rollback this migration:

```sql
-- Drop all policies
DROP POLICY IF EXISTS "Everyone can view points" ON public.point;
DROP POLICY IF EXISTS "Only admins can create points" ON public.point;
DROP POLICY IF EXISTS "Only admins can update points" ON public.point;
DROP POLICY IF EXISTS "Only admins can delete points" ON public.point;

-- Disable RLS (optional - only if you want to revert completely)
ALTER TABLE public.point DISABLE ROW LEVEL SECURITY;
```

**⚠️ Warning**: Disabling RLS means anyone can modify points without restrictions!

## Dependencies

This migration requires:

1. ✅ `public.point` table (created in initial migration)
2. ✅ `public.user_role` table (created in `20250718094803_add_user_roles.sql`)
3. ✅ `auth.uid()` function (provided by Supabase Auth)

## Impact on Existing Code

### Before Migration

```typescript
// All operations required service role key or no RLS
const { error } = await supabase.from('point').insert({ 
  name: 'New Point' 
});
// Would work without authentication ❌
```

### After Migration

```typescript
// Now requires admin authentication
const { error } = await supabase.from('point').insert({ 
  name: 'New Point' 
});
// Only works if user is admin ✅
```

### Game Display (No Change)

```typescript
// Viewing points still works for everyone
const { data } = await supabase.from('point').select('*');
// Works for all users ✅
```

## Related Files

- **Migration**: `supabase/migrations/20251114170000_add_admin_point_policies.sql`
- **Point Editor**: `game-client/src/routes/admin/point/+page.svelte`
- **Map Display**: `game-client/src/routes/game/map/+page.svelte`
- **Types**: `game-client/src/types/database.types.ts`

## Troubleshooting

### Issue: "new row violates row-level security policy"

**Cause**: User is not authenticated or not an admin.

**Solution**:
1. Verify user is logged in: `auth.getUser()`
2. Check user has admin role: `SELECT * FROM user_role WHERE user_id = '...'`
3. Ensure RLS check matches admin role exactly

### Issue: "Cannot read points"

**Cause**: RLS policy blocking SELECT.

**Solution**: The "Everyone can view points" policy should allow this. Check:
```sql
SELECT * FROM pg_policies WHERE tablename = 'point' AND cmd = 'SELECT';
```

### Issue: Admin can't create points

**Cause**: Admin role not properly assigned or RLS check failing.

**Solution**:
```sql
-- Check user has admin role
SELECT * FROM user_role WHERE user_id = auth.uid();

-- Manually verify the check
SELECT EXISTS (
    SELECT 1 FROM public.user_role
    WHERE user_role.user_id = auth.uid()
    AND user_role.role = 'admin'
);
```

## Testing Checklist

After applying migration:

- [ ] Verify RLS is enabled on `point` table
- [ ] Verify 4 policies exist (SELECT, INSERT, UPDATE, DELETE)
- [ ] Test admin can create point via Point Editor
- [ ] Test admin can edit point via Point Editor
- [ ] Test admin can delete point via Point Editor
- [ ] Test non-admin cannot create point
- [ ] Test non-admin cannot edit point
- [ ] Test non-admin cannot delete point
- [ ] Test all users can view points on map
- [ ] Test anonymous users can view points

## Additional Notes

- **Performance**: RLS policies add minimal overhead as they compile to SQL
- **Caching**: Supabase caches policy evaluation for performance
- **Indexes**: Consider adding index on `user_role(user_id, role)` if not exists
- **Monitoring**: Track failed RLS checks in Supabase logs

## Support

For issues:
1. Check Supabase logs for RLS violations
2. Verify user authentication status
3. Confirm admin role assignment
4. Review policy definitions match expectations

---

**Migration Status**: ✅ Ready to Apply

**Created**: 2025-11-14  
**Author**: Congress Ingress Team