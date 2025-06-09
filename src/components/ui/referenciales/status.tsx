/*
Este es el componente ReferencialStatus que se utilizaba para mostrar el estado de un referencial.
Recibía un 'status' como prop y mostraba un elemento 'span' con un estilo y un contenido diferentes 
dependiendo del valor de 'status'. Si 'status' era 'pending', se mostraba el texto "Pending" junto 
con un icono de reloj. Si 'status' era 'paid', se mostraba el texto "Paid" junto con un icono de verificación. 
Los estilos también cambiaban dependiendo del valor de 'status'.

import { CheckIcon, ClockIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

export default function ReferencialStatus({ status }: { status: string }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2 py-1 text-xs',
        {
          'bg-gray-100 text-gray-500': status === 'pending',
          'bg-green-500 text-white': status === 'paid',
        },
      )}
    >
      {status === 'pending' ? (
        <>
          Pending
          <ClockIcon className="ml-1 w-4 text-gray-500" />
        </>
      ) : null}
      {status === 'paid' ? (
        <>
          Paid
          <CheckIcon className="ml-1 w-4 text-white" />
        </>
      ) : null}
    </span>
  );
}
*/