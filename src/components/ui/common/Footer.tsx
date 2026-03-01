import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
  const githubDiscussionsUrl = 'https://github.com/gabrielpantoja-cl/referenciales.cl/discussions';

  return (
    <footer className="mt-16 py-12 border-t border-gray-200">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 items-center gap-y-8 md:gap-x-8">
        <div className="flex justify-center md:justify-start">
          <Link href="/" className="text-lg font-semibold text-blue-700 hover:text-blue-900 transition-colors">
            referenciales.cl
          </Link>
        </div>

        <div className="flex flex-col items-center gap-y-5 md:flex-row md:items-start md:justify-center md:gap-x-10">
          <div className="text-center md:text-left">
            <a
              href={githubDiscussionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="GitHub Discussions (Consultas públicas/técnicas)"
              className="text-sm font-medium text-gray-700 hover:text-black underline inline-flex items-center"
            >
              <span>Discusiones GitHub</span>
            </a>
            <p className="text-xs text-gray-500 mt-1">Preguntas técnicas y comunidad</p>
          </div>
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
