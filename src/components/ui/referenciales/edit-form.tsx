// components/ui/referenciales/edit-form.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Prisma } from '@prisma/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/primitives/button';
import FormFields from './FormFields';
import { updateReferencial, deleteReferencial } from '@/lib/actions';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { Dialog } from '@/components/ui/dialog';
import { sanitizeInput } from '@/lib/sanitize';
import { usePermissions } from '@/lib/hooks/usePermissions';

interface User {
  id: string;
  name: string;
  role: string;
}

type ReferencialForm = Prisma.referencialesUncheckedCreateInput & { id: string };

interface FormState extends ReferencialForm {
  userId: string;
  conservadorId: string;
  updatedAt: Date;
}

export default function EditReferencialForm({
  referencial,
  users,
}: {
  referencial: ReferencialForm;
  users: User[];
}) {
  const router = useRouter();
  const { status } = useSession(); // Eliminamos session
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { canEdit, canDelete } = usePermissions();

  const [formState, setFormState] = useState<FormState>({
    id: referencial.id,
    userId: referencial.userId,
    fojas: referencial.fojas,
    numero: referencial.numero,
    anio: referencial.anio,
    cbr: referencial.cbr,
    comuna: referencial.comuna,
    rol: referencial.rol,
    predio: referencial.predio,
    vendedor: referencial.vendedor,
    comprador: referencial.comprador,
    superficie: referencial.superficie,
    monto: referencial.monto,
    fechaescritura: referencial.fechaescritura,
    lat: referencial.lat,
    lng: referencial.lng,
    observaciones: referencial.observaciones,
    conservadorId: referencial.conservadorId,
    updatedAt: new Date(),
  });

  // ✅ CORREGIDO: Redirect a la página correcta, no a la API
  useEffect(() => {
    if (status === 'unauthenticated') {
      toast.error('No estás autenticado');
      router.push('/auth/signin'); // ✅ CORREGIDO: /auth/signin en lugar de /api/auth/signin
    }
  }, [status, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prevState => ({
      ...prevState,
      [name]: sanitizeInput(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canEdit) {
      toast.error('No tienes permisos para editar');
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      const csrfToken = await fetch('/api/csrf').then(res => res.json());
      formData.append('csrf_token', csrfToken);

      Object.entries(formState).forEach(([key, value]) => {
        formData.append(key, value as string | Blob);
      });

      await updateReferencial(formData);
      toast.success('Referencial actualizado exitosamente');
      router.push('/dashboard/referenciales');
      router.refresh();
    } catch (error) {
      toast.error('Error al actualizar el referencial');
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!canDelete) {
      toast.error('No tienes permisos para eliminar');
      return;
    }

    try {
      setIsSubmitting(true);
      if (referencial.id) {
        await deleteReferencial(referencial.id);
        toast.success('Referencial eliminado exitosamente');
        router.push('/dashboard/referenciales');
        router.refresh();
      }
    } catch (error) {
      toast.error('Error al eliminar el referencial');
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-md bg-gray-50 p-4 md:p-6">
          {/* Usuario Name */}
          <div className="mb-4">
            <label htmlFor="user" className="mb-2 block text-sm font-medium">
              Elige usuario
            </label>
            <div className="relative">
              <select
                id="user"
                name="userId"
                className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                value={formState.userId}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                <option value="" disabled>
                  Seleccionar usuario
                </option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <FormFields 
            state={{ 
              errors: {}, 
              message: null, 
              messageType: null, 
              invalidFields: new Set(), 
              isSubmitting 
            }} 
            currentUser={{ 
              id: formState.userId, 
              name: users.find(user => user.id === formState.userId)?.name || '' 
            }} 
          />

          {/* Additional Fields */}
          <div className="mb-4">
            <label htmlFor="fojas" className="mb-2 block text-sm font-medium">
              Fojas
            </label>
            <div className="relative mt-2 rounded-md">
              <div className="relative">
                <input
                  id="fojas"
                  name="fojas"
                  type="number"
                  value={formState.fojas}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Ingrese el número de fojas"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-between gap-4">
          <Link
            href="/dashboard/referenciales"
            className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
          >
            Cancelar
          </Link>
          <div className="flex gap-4">
            {canDelete && (
              <Button 
                type="button" 
                onClick={() => setIsDeleteModalOpen(true)}
                className="bg-red-500 hover:bg-red-600"
                disabled={isSubmitting}
              >
                Eliminar Referencial
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Editar Referencial'}
            </Button>
          </div>
        </div>
      </form>

      <Dialog
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmar eliminación"
        description="¿Estás seguro de que deseas eliminar este referencial? Esta acción no se puede deshacer."
        buttons={[
          {
            label: 'Cancelar',
            onClick: () => setIsDeleteModalOpen(false),
            variant: 'secondary'
          },
          {
            label: 'Eliminar',
            onClick: handleDelete,
            variant: 'danger'
          }
        ]}
      />
    </>
  );
}
