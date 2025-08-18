"use client";

import { formatDateToLocal } from '@/lib/utils';
import { Referencial } from '@/types/referenciales';
import { useAuth } from '@/hooks/useAuth';

const SENSITIVE_FIELDS = ['comprador', 'vendedor'];
const isSensitiveField = (key: string) => SENSITIVE_FIELDS.includes(key);

const formatFieldValue = (key: string, value: any, referencial: Referencial, canViewSensitiveData: boolean) => {
  if (isSensitiveField(key) && !canViewSensitiveData) {
    return '• • • • •';
  }

  if (key === 'fechaescritura' && value) {
    return formatDateToLocal(new Date(value).toISOString());
  }
  if ((key === 'monto' || key === 'superficie') && value !== undefined) {
    return value.toLocaleString('es-CL');
  }
  if (key === 'conservador' && referencial.conservadores) {
    return referencial.conservadores.nombre;
  }
  return value || '';
};

interface ReferencialTableProps {
  query: string;
  currentPage: number;
  referenciales: Referencial[]; 
}

type BaseKeys = keyof Omit<Referencial, 'user' | 'conservadores'>;
type DisplayKeys = BaseKeys | 'conservador';

const ALL_TABLE_HEADERS: { key: DisplayKeys, label: string }[] = [
  { key: 'conservador', label: 'Conservador' },
  { key: 'fojas', label: 'Fojas' },
  { key: 'numero', label: 'Número' },
  { key: 'anio', label: 'Año' },
  { key: 'comprador', label: 'Comprador' },
  { key: 'vendedor', label: 'Vendedor' },
  { key: 'predio', label: 'Predio' },
  { key: 'comuna', label: 'Comuna' },
  { key: 'rol', label: 'Rol' },
  { key: 'fechaescritura', label: 'Fecha de escritura' },
  { key: 'monto', label: 'Monto ($)' },
  { key: 'superficie', label: 'Superficie (m²)' },
  { key: 'observaciones', label: 'Observaciones' },
];

export default function ReferencialesTable({
  query,
  currentPage,
  referenciales, 
}: ReferencialTableProps) {
  const { canViewSensitiveData } = useAuth();

  // Filtrar headers basado en permisos del usuario
  const VISIBLE_HEADERS = ALL_TABLE_HEADERS.filter(
    header => canViewSensitiveData || !SENSITIVE_FIELDS.includes(header.key as string)
  );
  return (
    <div className="mt-6 flow-root w-full">
      <div className="w-full">
        {/* Mostrar información de la página actual */}
        <div className="text-sm text-gray-500 mb-2">
          Mostrando página {currentPage} {query ? `con filtro "${query}"` : ""} • Total: {referenciales.length} referenciales
        </div>
        
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0 w-full">
          {referenciales.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">No hay resultados para mostrar</p>
              {query && <p className="text-sm text-gray-400 mt-2">Prueba con una búsqueda diferente</p>}
            </div>
          ) : (
            <>
              {/* Vista móvil */}
              <div className="md:hidden">
                {referenciales.map((referencial) => (
                  <div key={referencial.id} className="mb-2 w-full rounded-md bg-white p-4">
                    <div className="flex items-center justify-between border-b pb-4">
                      <div>
                        {VISIBLE_HEADERS.map(({ key, label }) => (
                          <p key={String(key)} className={key === 'cbr' ? 'font-medium' : ''}>
                            {label}: {
                              key === 'conservador' 
                                ? (referencial.conservadores?.nombre || '-') 
                                : formatFieldValue(key as string, (referencial as any)[key], referencial, canViewSensitiveData)
                            }
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Vista desktop */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full text-gray-900">
                  <thead className="rounded-lg text-left text-sm font-normal">
                    <tr>
                      {VISIBLE_HEADERS.map(({ key, label }) => (
                        <th key={String(key)} scope="col" className="px-3 py-5 font-medium">
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {referenciales.map((referencial) => (
                      <tr key={referencial.id} 
                          className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg">
                        {VISIBLE_HEADERS.map(({ key }) => (
                          <td key={String(key)} className="whitespace-nowrap px-3 py-3">
                            {key === 'conservador' 
                              ? (referencial.conservadores?.nombre || '-') 
                              : formatFieldValue(key as string, (referencial as any)[key], referencial, canViewSensitiveData)
                            }
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}