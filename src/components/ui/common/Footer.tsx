// Ubicación: components/ui/common/Footer.tsx
import React from 'react';
import Link from 'next/link'; // Para enlaces internos (Términos, Privacidad)
import WhatsAppIcon from '@/components/ui/common/WhatsAppIcon'; // Usa alias de ruta si está configurado
// Opcional: Importa un icono de GitHub si tienes uno disponible y quieres usarlo
// import { FaGithub } from 'react-icons/fa';

const Footer: React.FC = () => {
  // --- URLs (Asegúrate que sean correctas) ---
  const githubDiscussionsUrl = 'https://github.com/TheCuriousSloth/referenciales.cl/discussions';
  const whatsappUrl = 'https://wa.me/56931769472'; // Tu número dedicado
  // --- Fin URLs ---

  return (
    // Aumentado margen superior (mt-16) y padding vertical (py-12) para más "aire"
    <footer className="mt-16 py-12 border-t border-gray-200">
      {/* Contenedor principal con padding horizontal y más gap vertical en móvil (gap-y-8) */}
      {/* Nuevo layout: grid para mejor control de columnas en desktop */}
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 items-center gap-y-8 md:gap-x-8">
        {/* Columna 1: Botón/Enlace a inicio */}
        <div className="flex justify-center md:justify-start">
          <Link href="/" className="text-lg font-semibold text-blue-700 hover:text-blue-900 transition-colors">
            referenciales.cl
          </Link>
        </div>

        {/* Columna 2: Enlaces de Contacto/Comunidad */}
        <div className="flex flex-col items-center gap-y-5 md:flex-row md:items-start md:justify-center md:gap-x-10">
          {/* Bloque GitHub Discussions */}
          <div className="text-center md:text-left">
            <a
              href={githubDiscussionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="GitHub Discussions (Consultas públicas/técnicas)"
              className="text-sm font-medium text-gray-700 hover:text-black underline inline-flex items-center"
            >
              {/* <FaGithub className="h-4 w-4 mr-1" /> Opcional Icono */}
               <span>Discusiones GitHub</span>
            </a>
            {/* Descripción corta */}
            <p className="text-xs text-gray-500 mt-1">Preguntas técnicas y comunidad</p>
          </div>

          {/* Bloque WhatsApp Link */}
          <div className="text-center md:text-left">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="WhatsApp (Consultas rápidas/directas)" // Tooltip útil
              // Estilos mantenidos: green color/hover
              className="text-sm font-medium text-green-600 hover:text-green-800 inline-flex items-center"
            >
              {/* Span para tamaño del icono */}
              <span className="inline-block h-4 w-4">
                <WhatsAppIcon />
              </span>
              <span className="ml-1">WhatsApp</span>
            </a>
             {/* Descripción corta */}
            <p className="text-xs text-gray-500 mt-1">Consultas rápidas y directas</p>
          </div>
        </div>

        {/* Columna 3: Enlaces Legales agrupados en columna */}
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
