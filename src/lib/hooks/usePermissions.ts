// lib/hooks/usePermissions.ts
import { useSession } from 'next-auth/react';

interface Permissions {
  canEdit: boolean;
  canDelete: boolean;
  canCreate: boolean;
  canView: boolean;
}

const DEFAULT_PERMISSIONS: Permissions = {
  canEdit: false,
  canDelete: false,
  canCreate: false,
  canView: true,
};

const ROLE_PERMISSIONS: Record<string, Permissions> = {
  ADMIN: {
    canEdit: true,
    canDelete: true,
    canCreate: true,
    canView: true,
  },
  EDITOR: {
    canEdit: true,
    canDelete: false,
    canCreate: true,
    canView: true,
  },
  USER: {
    ...DEFAULT_PERMISSIONS,
  },
};

export function usePermissions(): Permissions {
  const { data: session } = useSession();
  const userRole = session?.user?.role || 'USER';
  
  return ROLE_PERMISSIONS[userRole] || DEFAULT_PERMISSIONS;
}