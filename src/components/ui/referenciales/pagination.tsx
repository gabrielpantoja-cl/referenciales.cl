"use client";

import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import Link from 'next/link';
import { generatePagination } from '@/lib/utils';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';

export default function Pagination({ totalPages }: { totalPages: number }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Asegurarse de que currentPage es siempre un número válido
  const currentPage = Math.max(1, Number(searchParams?.get('page')) || 1);

  // Crear URL de paginación de forma consistente y segura
  const createPageURL = useCallback((pageNumber: number) => {
    if (!searchParams) return pathname;
    
    // Siempre crear un nuevo objeto para evitar modificar el original
    const params = new URLSearchParams(searchParams.toString());
    
    if (pageNumber === 1) {
      params.delete('page');
    } else {
      params.set('page', pageNumber.toString());
    }
    
    const queryString = params.toString();
    return `${pathname}${queryString ? `?${queryString}` : ''}`;
  }, [pathname, searchParams]);

  // Función para manejar cambios de página con navegación programática
  const handlePageChange = useCallback((pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    
    const url = createPageURL(pageNumber);
    router.push(url);
    
    // Desplazarse al inicio de la tabla para mejor UX
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [createPageURL, router, totalPages]);

  // Manejar navegación con teclado para accesibilidad
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && currentPage > 1) {
        handlePageChange(currentPage - 1);
      } else if (e.key === 'ArrowRight' && currentPage < totalPages) {
        handlePageChange(currentPage + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, handlePageChange, totalPages]);

  // Generar array de páginas a mostrar
  const allPages = generatePagination(currentPage, totalPages);

  // Asegurarse de que el componente no renderiza con valores inválidos
  if (totalPages <= 0) return null;

  return (
    <nav aria-label="Paginación" className="flex flex-col items-center">
      <span className="text-sm text-gray-700 mb-2">
        Página <span className="font-bold">{currentPage}</span> de{' '}
        <span className="font-bold">{totalPages}</span>
      </span>
      
      <div className="inline-flex shadow-sm">
        <PaginationArrow
          direction="left"
          onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
          href={createPageURL(currentPage - 1)}
          isDisabled={currentPage <= 1}
        />

        <div className="flex -space-x-px">
          {allPages.map((page, index) => (
            <PaginationNumber
              key={`${page}-${index}`}
              href={createPageURL(page as number)}
              page={page}
              position={getPosition(page, allPages.length)}
              isActive={currentPage === page}
              onClick={() => typeof page === 'number' && handlePageChange(page)}
            />
          ))}
        </div>

        <PaginationArrow
          direction="right"
          onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
          href={createPageURL(currentPage + 1)}
          isDisabled={currentPage >= totalPages}
        />
      </div>
    </nav>
  );
}

function getPosition(page: number | string, pagesLength: number) {
  if (page === 1) return 'first';
  if (page === pagesLength) return 'last';
  if (pagesLength === 1) return 'single';
  if (page === '...') return 'middle';
  return undefined;
}

interface PaginationNumberProps {
  page: number | string;
  href: string;
  isActive: boolean;
  position?: 'first' | 'last' | 'middle' | 'single';
  onClick?: () => void;
}

function PaginationNumber({
  page,
  href,
  isActive,
  position,
  onClick
}: PaginationNumberProps) {
  const className = clsx(
    'flex h-10 w-10 items-center justify-center text-sm border',
    {
      'rounded-l-md': position === 'first' || position === 'single',
      'rounded-r-md': position === 'last' || position === 'single',
      'z-10 bg-primary border-primary text-white': isActive,
      'hover:bg-gray-100': !isActive && position !== 'middle',
      'text-gray-300': position === 'middle',
      'cursor-pointer': !isActive && position !== 'middle',
      'cursor-default': isActive || position === 'middle',
    }
  );

  if (isActive || position === 'middle') {
    return <div className={className}>{page}</div>;
  }

  return (
    <Link 
      href={href} 
      className={className} 
      onClick={(e) => {
        if (onClick) {
          e.preventDefault();
          onClick();
        }
      }}
      aria-current={isActive ? 'page' : undefined}
    >
      {page}
    </Link>
  );
}

interface PaginationArrowProps {
  href: string;
  direction: 'left' | 'right';
  isDisabled?: boolean;
  onClick?: () => void;
}

function PaginationArrow({
  href,
  direction,
  isDisabled,
  onClick
}: PaginationArrowProps) {
  const className = clsx(
    'flex h-10 w-10 items-center justify-center rounded-md border',
    {
      'pointer-events-none text-gray-300': isDisabled,
      'hover:bg-gray-100': !isDisabled,
      'mr-2 md:mr-4': direction === 'left',
      'ml-2 md:ml-4': direction === 'right',
      'cursor-pointer': !isDisabled,
    }
  );

  const icon = direction === 'left' ? (
    <ArrowLeftIcon className="w-4" />
  ) : (
    <ArrowRightIcon className="w-4" />
  );

  const label = direction === 'left' ? 'Página anterior' : 'Página siguiente';

  if (isDisabled) {
    return (
      <div className={className} aria-disabled="true" aria-label={label}>
        {icon}
      </div>
    );
  }

  return (
    <Link 
      className={className} 
      href={href}
      aria-label={label}
      onClick={(e) => {
        if (onClick) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {icon}
    </Link>
  );
}