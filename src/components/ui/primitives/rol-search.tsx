'use client';
import React from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

export default function RolSearch({ placeholder = 'ej: 1634-6' }: { placeholder?: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    const term = e.target.value.trim();
    params.set('page', '1');

    if (term) {
      params.set('rol', term);
    } else {
      params.delete('rol');
    }

    replace(`${pathname}?${params.toString()}`);
  }, 300);

  const defaultValue = searchParams?.get('rol')?.toString() ?? '';

  return (
    <div className="relative flex flex-shrink-0">
      <label htmlFor="rol-search" className="sr-only">
        Buscar por ROL de avaluo
      </label>
      <input
        id="rol-search"
        className="peer block w-full rounded-md border border-gray-200 py-[9px] px-3 text-sm outline-2 placeholder:text-gray-500 max-w-[160px]"
        placeholder={placeholder}
        onChange={handleSearch}
        defaultValue={defaultValue}
      />
    </div>
  );
}
