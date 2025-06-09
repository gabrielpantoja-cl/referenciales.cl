// app/dashboard/referenciales/create/page.tsx
import Form from '@/components/ui/referenciales/create-form';
import Breadcrumbs from '@/components/ui/referenciales/breadcrumbs';
import CsvUploader from '@/components/ui/referenciales/CsvUploader';
import { fetchUsers } from '@/lib/users';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth.config'; // Importa authOptions desde auth.config.ts

export default async function Page() {
  // Obtener sesión del usuario actual
  const session = await getServerSession(authOptions);
  const allUsers = await fetchUsers();
  
  // Filtrar para obtener solo el usuario actual con nombre válido
  const currentUser = allUsers.find(user => 
    user.id === session?.user?.id && user.name !== null
  );

  // Asegurar que el tipo sea { id: string; name: string }[]
  const users = currentUser ? [{
    id: currentUser.id,
    name: currentUser.name as string // Type assertion ya que sabemos que name no es null
  }] : [];
  
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Referenciales', href: '/dashboard/referenciales' },
          {
            label: 'Crear Referencial',
            href: '/dashboard/referenciales/create',
            active: true,
          },
        ]}
      />
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="md:col-span-1">
          <h2 className="text-xl font-bold mb-4">Crear Referencial Individual</h2>
          <Form users={users} />
        </div>
        
        <div className="md:col-span-1">
          <h2 className="text-xl font-bold mb-4">Carga Masiva CSV</h2>
          <CsvUploader users={users} />
        </div>
      </div>
    </main>
  );
}