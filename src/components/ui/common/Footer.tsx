import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
  return (
    <footer className="mt-16 py-12 border-t border-gray-200">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 items-center gap-y-8 md:gap-x-8">
        <div className="flex justify-center md:justify-start">
          <Link href="/" className="text-lg font-semibold text-blue-700 hover:text-blue-900 transition-colors">
            referenciales.cl
          </Link>
        </div>

        <div className="flex flex-col items-center md:items-end justify-center gap-y-1 text-center md:text-right">
          <Link href="/terms" className="text-sm text-gray-600 hover:text-gray-900">
            Términos
          </Link>
          <Link href="/privacy" className="text-sm text-gray-600 hover:text-gray-900">
            Privacidad
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
