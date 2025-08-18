# Role-Based Access Control Implementation

## Overview

This document describes the role-based access control (RBAC) system implemented for Referenciales.cl. The system allows only admin users to perform CRUD operations and view sensitive buyer/seller data.

## Admin Role Assignment

Admin roles are assigned manually in the database using SQL scripts. This approach provides better security than hardcoding email addresses in the application code.

### Setting Admin Roles

Execute the following SQL script in Neon database console:

```sql
-- Update existing users to admin role
UPDATE "User" 
SET role = 'admin' 
WHERE email IN ('admin-email-1@domain.com', 'admin-email-2@domain.com');

-- Verify the changes
SELECT id, email, role FROM "User" WHERE role = 'admin';
```

See `sql/assign_admin_roles.sql` for the complete script.

## Implementation Details

### 1. Database Schema (✅ Already Exists)

The `User` model in `prisma/schema.prisma` includes:
```prisma
model User {
  // ... other fields
  role Role @default(user)
  // ... other fields
}

enum Role {
  user
  admin
  superadmin
}
```

### 2. Authentication Configuration (✅ Implemented)

Updated `src/lib/auth.config.ts` to:
- Include role in JWT tokens and sessions
- Read user roles from database only (no hardcoded emails)
- Maintain existing roles during user updates

### 3. Middleware Protection (✅ Implemented)

Updated `src/middleware.ts` to:
- Protect admin-only routes
- Check user roles before allowing access
- Return appropriate error responses for unauthorized access

Protected admin-only paths:
- `/dashboard/referenciales/create`
- `/dashboard/referenciales/edit`
- `/api/referenciales/create`
- `/api/referenciales/update`
- `/api/referenciales/delete`
- `/api/referenciales/upload-csv`

### 4. Custom Auth Hook (✅ Implemented)

Created `src/hooks/useAuth.ts` with utilities:
```typescript
const { isAdmin, canCreateReferenciales, canViewSensitiveData } = useAuth();
```

### 5. Component-Level Protection (✅ Implemented)

#### Table Component (`src/components/ui/referenciales/table.tsx`)
- Conditionally shows/hides sensitive buyer/seller data
- Redacts data for non-admin users with "• • • • •"

#### Dashboard Page (`src/app/dashboard/referenciales/page.tsx`)
- Shows "Create" button only for admin users
- Displays admin role indicator

### 6. API Protection (✅ Implemented)

#### Server-side Validation
All admin-only API endpoints verify:
- User authentication (valid session)
- User authorization (admin role)
- Return 403 Forbidden for unauthorized access

Example implementation:
```typescript
// Check authentication
const session = await getServerSession(authOptions);
if (!session?.user?.id) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

// Check authorization
const user = await prisma.user.findUnique({
  where: { id: session.user.id },
  select: { role: true }
});

if (user?.role !== 'admin') {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

## Security Features

### Double Protection
- **Client-side**: UI controls hide/show elements based on role
- **Server-side**: API endpoints validate permissions

### Data Privacy
- Sensitive buyer/seller names are hidden from regular users
- Data appears as "• • • • •" for non-admin users
- Only admin users see full property transaction details

### Session Security
- Roles stored in secure JWT tokens
- Database lookup for role verification
- No sensitive data in client-side storage

## User Experience

### Regular Users (role: 'user')
- ✅ Can view property listings
- ✅ Can use maps and basic features
- ❌ Cannot create/edit/delete properties
- ❌ Cannot see buyer/seller names
- ❌ Cannot access CSV upload

### Admin Users (role: 'admin')
- ✅ All regular user features
- ✅ Can create/edit/delete properties
- ✅ Can see full buyer/seller information
- ✅ Can upload CSV files
- ✅ See admin mode indicator in UI

## Maintenance

### Adding New Admin Users
1. User must login at least once (creates account with 'user' role)
2. Execute SQL script to update their role to 'admin'
3. User will have admin privileges on next login

### Removing Admin Access
```sql
UPDATE "User" SET role = 'user' WHERE email = 'former-admin@domain.com';
```

### Verification Scripts
Use `sql/verify_roles.sql` to check current role assignments and verify system state.

## Technical Notes

- **NextAuth.js v4**: Compatible with existing authentication system
- **TypeScript**: Fully typed with proper role definitions
- **Performance**: No additional database queries for role checks (cached in JWT)
- **Backwards Compatible**: Existing functionality preserved for all users
- **Production Ready**: Secure implementation without hardcoded values

## Files Modified

- ✅ `src/lib/auth.config.ts` - Role inclusion in sessions
- ✅ `src/middleware.ts` - Route protection
- ✅ `src/hooks/useAuth.ts` - Custom auth utilities
- ✅ `src/types/next-auth.d.ts` - TypeScript definitions
- ✅ `src/components/ui/referenciales/table.tsx` - Conditional data display
- ✅ `src/app/dashboard/referenciales/page.tsx` - Admin UI elements
- ✅ `src/app/api/referenciales/upload-csv/route.ts` - API protection

## SQL Scripts

- ✅ `sql/assign_admin_roles.sql` - Set admin roles
- ✅ `sql/verify_roles.sql` - Verify role assignments