import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

export function useAuth() {
  const { data: session, status } = useSession();

  const isLoading = status === 'loading';
  const isAuthenticated = !!session?.user;
  const user = session?.user;
  const userRole = session?.user?.role || 'user';

  // Log para debugging en consola - solo cuando hay cambios en la sesión
  useEffect(() => {
    if (status !== 'loading') {
      console.log('🔐 [USEAUTH-HOOK]', {
        status,
        isAuthenticated,
        userRole,
        userId: user?.id,
        userEmail: user?.email,
        timestamp: new Date().toISOString()
      });
    }
  }, [status, isAuthenticated, userRole, user?.id, user?.email]);

  const isAdmin = userRole === 'admin' || userRole === 'superadmin';
  const isSuperAdmin = userRole === 'superadmin';
  const isUser = userRole === 'user';

  // Función para verificar si el usuario puede realizar operaciones CRUD
  const canCreateReferenciales = isAuthenticated; // Todos los usuarios autenticados pueden crear
  const canEditReferenciales = isAdmin;
  const canDeleteReferenciales = isAdmin;
  const canViewSensitiveData = isAdmin;

  return {
    // Estado de autenticación
    isLoading,
    isAuthenticated,
    user,
    userRole,

    // Verificaciones de rol
    isAdmin,
    isSuperAdmin,
    isUser,

    // Permisos específicos
    canCreateReferenciales,
    canEditReferenciales,
    canDeleteReferenciales,
    canViewSensitiveData,
  };
}