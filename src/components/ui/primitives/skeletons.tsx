// Loading animation
  const shimmer =
    'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';

  export function CardSkeleton() {
    return (
      <div
        className={`${shimmer} relative overflow-hidden rounded-xl bg-gray-100 p-2 shadow-sm`}
      >
        <div className="flex p-4">
          <div className="h-5 w-5 rounded-md bg-gray-200" />
          <div className="ml-2 h-6 w-16 rounded-md bg-gray-200 text-sm font-medium" />
        </div>
        <div className="flex items-center justify-center truncate rounded-xl bg-white px-4 py-8">
          <div className="h-7 w-20 rounded-md bg-gray-200" />
        </div>
      </div>
    );
  }

  export function CardsSkeleton() {
    return (
      <>
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </>
    );
  }

  export function RevenueChartSkeleton() {
    return (
      <div className={`${shimmer} relative w-full overflow-hidden md:col-span-4`}>
        <div className="mb-4 h-8 w-36 rounded-md bg-gray-100" />
        <div className="rounded-xl bg-gray-100 p-4">
          <div className="sm:grid-cols-13 mt-0 grid h-[410px] grid-cols-12 items-end gap-2 rounded-md  bg-white p-4 md:gap-4" />
          <div className="flex items-center pb-2 pt-6">
            <div className="h-5 w-5 rounded-full bg-gray-200" />
            <div className="ml-2 h-4 w-20 rounded-md bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  export function ReferencialSkeleton() {
    return (
      <div className="flex flex-row items-center justify-between border-b border-gray-100 py-4">
        <div className="flex items-center">
          <div className="mr-2 h-8 w-8 rounded-full bg-gray-200" />
          <div className="min-w-0">
            <div className="h-5 w-40 rounded-md bg-gray-200" />
            <div className="mt-2 h-4 w-12 rounded-md bg-gray-200" />
          </div>
        </div>
        <div className="mt-2 h-4 w-12 rounded-md bg-gray-200" />
      </div>
    );
  }

  export function LatestReferencialesSkeleton() {
    return (
      <div
        className={`${shimmer} relative flex w-full flex-col overflow-hidden md:col-span-4 lg:col-span-4`}
      >
        <div className="mb-4 h-8 w-36 rounded-md bg-gray-100" />
        <div className="flex grow flex-col justify-between rounded-xl bg-gray-100 p-4">
          <div className="bg-white px-6">
            <ReferencialSkeleton />
            <ReferencialSkeleton />
            <ReferencialSkeleton />
            <ReferencialSkeleton />
            <ReferencialSkeleton />
            <div className="flex items-center pb-2 pt-6">
              <div className="h-5 w-5 rounded-full bg-gray-200" />
              <div className="ml-2 h-4 w-20 rounded-md bg-gray-200" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  export default function DashboardSkeleton() {
    return (
      <>
        <div
          className={`${shimmer} relative mb-4 h-8 w-36 overflow-hidden rounded-md bg-gray-100`}
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
          <RevenueChartSkeleton />
          <LatestReferencialesSkeleton />
        </div>
      </>
    );
  }

  export function TableRowSkeleton() {
    return (
      <tr className="w-full border-b border-gray-100 last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg">
        {/* Conservador */}
        <td className="relative overflow-hidden whitespace-nowrap py-3 pl-6 pr-3">
          <div className="h-6 w-32 rounded bg-gray-100"></div>
        </td>
        {/* Fojas */}
        <td className="whitespace-nowrap px-3 py-3">
          <div className="h-6 w-16 rounded bg-gray-100"></div>
        </td>
        {/* Número */}
        <td className="whitespace-nowrap px-3 py-3">
          <div className="h-6 w-16 rounded bg-gray-100"></div>
        </td>
        {/* Año */}
        <td className="whitespace-nowrap px-3 py-3">
          <div className="h-6 w-16 rounded bg-gray-100"></div>
        </td>
        {/* Predio */}
        <td className="whitespace-nowrap px-3 py-3">
          <div className="h-6 w-48 rounded bg-gray-100"></div>
        </td>
        {/* Comuna */}
        <td className="whitespace-nowrap px-3 py-3">
          <div className="h-6 w-28 rounded bg-gray-100"></div>
        </td>
        {/* Rol */}
        <td className="whitespace-nowrap px-3 py-3">
          <div className="h-6 w-24 rounded bg-gray-100"></div>
        </td>
        {/* Fecha de escritura */}
        <td className="whitespace-nowrap px-3 py-3">
          <div className="h-6 w-36 rounded bg-gray-100"></div>
        </td>
        {/* Monto ($) */}
        <td className="whitespace-nowrap px-3 py-3">
          <div className="h-6 w-40 rounded bg-gray-100"></div>
        </td>
        {/* Superficie (m²) */}
        <td className="whitespace-nowrap px-3 py-3">
          <div className="h-6 w-24 rounded bg-gray-100"></div>
        </td>
        {/* Observaciones */}
        <td className="whitespace-nowrap px-3 py-3">
          <div className="h-6 w-52 rounded bg-gray-100"></div>
        </td>
        {/* Acciones */}
        <td className="whitespace-nowrap py-3 pl-6 pr-3">
          <div className="flex justify-end gap-3">
            <div className="h-[38px] w-[38px] rounded bg-gray-100"></div>
            <div className="h-[38px] w-[38px] rounded bg-gray-100"></div>
          </div>
        </td>
      </tr>
    );
  }

  export function ReferencialesMobileSkeleton() {
    return (
      <div className="mb-2 w-full rounded-md bg-white p-4">
        {/* Encabezado con información principal */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            {/* Ícono/Avatar */}
            <div className="h-8 w-8 rounded-full bg-gray-100"></div>
            {/* Título principal */}
            <div className="h-6 w-32 rounded bg-gray-100"></div>
          </div>
          {/* Indicador/Estado */}
          <div className="h-6 w-16 rounded bg-gray-100"></div>
        </div>

        {/* Contenido principal */}
        <div className="mt-4 space-y-4">
          {/* Detalles en dos columnas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="h-6 w-24 rounded bg-gray-100"></div>
              <div className="h-6 w-32 rounded bg-gray-100"></div>
            </div>
            <div className="space-y-2">
              <div className="h-6 w-28 rounded bg-gray-100"></div>
              <div className="h-6 w-20 rounded bg-gray-100"></div>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="mt-4 flex justify-end gap-2">
          <div className="h-10 w-10 rounded bg-gray-100"></div>
          <div className="h-10 w-10 rounded bg-gray-100"></div>
        </div>
      </div>
    );
  }

  export function ReferencialesTableSkeleton() {
    return (
      <div className="mt-6 flow-root">
        <div className="inline-block min-w-full align-middle">
          <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
            {/* Vista Móvil */}
            <div className="block md:hidden">
              <ReferencialesMobileSkeleton />
              <ReferencialesMobileSkeleton />
              <ReferencialesMobileSkeleton />
              <ReferencialesMobileSkeleton />
              <ReferencialesMobileSkeleton />
              <ReferencialesMobileSkeleton />
            </div>
            
            {/* Vista Escritorio - tabla completa */}
            <div className="hidden md:block">
              <table className="min-w-full text-gray-900">
                <thead className="rounded-lg text-left text-sm font-normal">
                  <tr>
                    <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                      Conservador
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Fojas
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Número
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Año
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Predio
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Comuna
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Rol
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Fecha de escritura
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Monto ($)
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Superficie (m²)
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Observaciones
                    </th>
                    <th scope="col" className="relative pb-4 pl-3 pr-6 pt-2 sm:pr-6">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }
