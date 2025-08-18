# Role-Based Access Control Implementation

## Overview

This document describes the role-based access control (RBAC) system implemented for Referenciales.cl. The system allows only specific admin users to perform CRUD operations and view sensitive buyer/seller data.

## Admin Users

The following email addresses have automatic admin privileges:
- `gabrielpantojarivera@gmail.com`
- `monacaniqueo@gmail.com`

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
- Automatically assign admin role to specified emails
- Fetch user role from database during authentication

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
- `/dashboard/referenciales/[id]/edit`

### 4. Custom Auth Hook (✅ Implemented)

Created `src/hooks/useAuth.ts` with utilities:
```typescript
const {
  isAuthenticated,
  user,
  userRole,
  isAdmin,
  canCreateReferenciales,
  canEditReferenciales,
  canDeleteReferenciales,
  canViewSensitiveData
} = useAuth();
```

### 5. Component Updates (✅ Implemented)

#### Table Component (`src/components/ui/referenciales/table.tsx`)
- Shows/hides sensitive fields (comprador, vendedor) based on user role
- Dynamically filters table headers
- Admin users see all data, regular users see redacted data

#### Dashboard Page (`src/app/dashboard/referenciales/page.tsx`)
- Shows "Create" button only for admin users
- Displays admin mode indicator
- Conditional rendering based on permissions

#### API Routes (`src/app/api/referenciales/upload-csv/route.ts`)
- Authentication checks for protected endpoints
- Role-based authorization for admin operations
- Secure session management

## Usage Examples

### Frontend Component with Role Checks

```tsx
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { canCreateReferenciales, canViewSensitiveData, userRole } = useAuth();

  return (
    <div>
      {/* Admin-only actions */}
      {canCreateReferenciales && (
        <button>Create New Referencial</button>
      )}

      {/* Conditional data display */}
      {canViewSensitiveData ? (
        <p>Buyer: {data.comprador}</p>
      ) : (
        <p>Buyer: • • • • •</p>
      )}

      {/* Role indicator */}
      <div>Current role: {userRole}</div>
    </div>
  );
}
```

### API Route with Admin Protection

```typescript
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth.config';

export async function POST(request: NextRequest) {
  // Check authentication
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  // Check admin permissions
  if (session.user.role !== 'admin' && session.user.role !== 'superadmin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  // Admin-only logic here
}
```

## Security Features

### 1. Sensitive Data Protection
- Buyer and seller names are hidden from non-admin users
- Database queries remain the same for performance
- Frontend filtering ensures data protection

### 2. Route Protection
- Middleware intercepts unauthorized requests
- Admin-only pages return 403 errors for regular users
- API endpoints validate permissions server-side

### 3. Automatic Role Assignment
- Admin emails are automatically assigned admin role on login
- No manual database updates required
- Roles are fetched fresh on each session

## Testing the Implementation

### As a Regular User:
1. Login with a non-admin Google account
2. Visit `/dashboard/referenciales`
3. Should see:
   - No "Create" button
   - Redacted buyer/seller data (• • • • •)
   - No admin mode indicator

### As an Admin User:
1. Login with `gabrielpantojarivera@gmail.com` or `monacaniqueo@gmail.com`
2. Visit `/dashboard/referenciales`
3. Should see:
   - "Create" button available
   - Full buyer/seller data visible
   - "Modo Administrador" indicator
   - Access to `/dashboard/referenciales/create`

### Testing API Protection:
```bash
# This should fail for non-admin users
curl -X POST http://localhost:3000/api/referenciales/upload-csv \
  -H "Authorization: Bearer <non-admin-token>" \
  -F "file=@test.csv"

# Should return 403 Forbidden
```

## Security Considerations

1. **Role Verification**: Roles are verified both client-side (for UI) and server-side (for security)
2. **Session Management**: Roles are included in JWT tokens and refreshed appropriately
3. **Data Protection**: Sensitive data is filtered at the component level but remains available for authorized users
4. **Audit Trail**: All authentication events are logged for security monitoring

## Production Deployment Notes

1. **Environment Variables**: Ensure all required NextAuth environment variables are set
2. **Database Permissions**: The application user should have appropriate database permissions
3. **HTTPS**: Always use HTTPS in production for secure authentication
4. **Session Security**: NextAuth handles secure session management automatically

This implementation provides secure, role-based access control while maintaining the existing functionality for all users and adding enhanced capabilities for administrators.