// app/dashboard/referenciales/create/page.tsx
import Breadcrumbs from '@/components/ui/referenciales/breadcrumbs';
import ReferencialTableEditor from '@/components/ui/referenciales/ReferencialTableEditor';
import MinimalCsvUploader from '@/components/ui/referenciales/MinimalCsvUploader';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth.config';

export default async function Page() {
  // Obtener sesión del usuario actual
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id || !session?.user?.name) {
    return (
      <main>
        <div className="text-center py-8">
          <p className="text-red-600">Error: Usuario no autenticado</p>
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-6">
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Referenciales', href: '/dashboard/referenciales' },
          {
            label: 'Crear Referenciales',
            href: '/dashboard/referenciales/create',
            active: true,
          },
        ]}
      />
      
      {/* Tabla inteligente principal */}
      <ReferencialTableEditor 
        userId={session.user.id}
        userName={session.user.name}
      />
      
      {/* Separador */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">o</span>
        </div>
      </div>
      
      {/* Opción CSV minimalista */}
      <MinimalCsvUploader userId={session.user.id} />
    </main>
  );
}