'use client'

import {
  HomeIcon,
  DocumentDuplicateIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  ArrowUpTrayIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { name: 'Inicio', href: '/dashboard', icon: HomeIcon },
  {
    name: 'Referenciales',
    href: '/dashboard/referenciales',
    icon: DocumentDuplicateIcon,
  },
  { name: 'Mapa', href: '/dashboard/mapa', icon: MapPinIcon },
  {
    name: 'Subir Referenciales',
    href: '/dashboard/referenciales/create',
    icon: ArrowUpTrayIcon,
  },
  {
    name: 'Conservadores',
    href: '/dashboard/conservadores',
    icon: BuildingOfficeIcon,
  },
];

export default function NavLinks() {
  const pathname = usePathname();
  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={`flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3
            ${pathname === link.href ? 'bg-sky-100 text-blue-600' : ''}
            `}
          >
            <LinkIcon className="w-6" />
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}