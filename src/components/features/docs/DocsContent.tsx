'use client';

import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import remarkGfm from 'remark-gfm';

interface DocsContentProps {
  selectedDoc: string;
}

const DOC_PATH_MAP: Record<string, string> = {
  'introduccion-index': '01-introduccion/index',
  'arquitectura-general': '01-introduccion/arquitectura-general',
  'tecnologias': '01-introduccion/tecnologias',
  'desarrollo-index': '02-desarrollo/index',
  'autenticacion': '03-arquitectura/autenticacion',
  'base-datos': '03-arquitectura/base-datos',
  'estructura-proyecto': '03-arquitectura/estructura-proyecto',
  'api-publica': '04-api/api-publica',
  'integraciones': '04-api/integraciones',
  'referenciales': '05-modulos/referenciales',
  'estadisticas-avanzadas': '05-modulos/estadisticas-avanzadas',
  'mapa-interactivo': '05-modulos/mapa-interactivo',
  'chatbot': '05-modulos/chatbot',
  'deployment-index': '06-deployment/index',
  'soluciones-comunes': '07-mantenimiento/soluciones-comunes',
  'cookies-compliance': '08-recursos/cookies-compliance',
  'github-automation': '08-recursos/github-automation',
  'roles-permisos': '08-recursos/roles-permisos'
};

export function DocsContent({ selectedDoc }: DocsContentProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDoc = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const docPath = DOC_PATH_MAP[selectedDoc];
        if (!docPath) {
          setError('Documento no encontrado');
          return;
        }

        const response = await fetch(`/api/docs/${docPath}`);
        if (!response.ok) {
          throw new Error('Error al cargar el documento');
        }
        
        const docContent = await response.text();
        setContent(docContent);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    loadDoc();
  }, [selectedDoc]);

  if (loading) {
    return (
      <div className="flex-1 p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded mb-4 w-1/2"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded w-5/6"></div>
            <div className="h-4 bg-gray-300 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-red-800 font-medium">Error al cargar el documento</h3>
          <p className="text-red-600 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-8">
        <div className="prose prose-lg max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || '');
                
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={tomorrow}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code
                    className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm"
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
              h1: ({ children }) => (
                <h1 className="text-3xl font-bold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
                  {children}
                </h3>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-blue-500 bg-blue-50 p-4 my-4 italic">
                  {children}
                </blockquote>
              ),
              table: ({ children }) => (
                <div className="overflow-x-auto my-6">
                  <table className="min-w-full border border-gray-300 rounded-lg">
                    {children}
                  </table>
                </div>
              ),
              th: ({ children }) => (
                <th className="px-4 py-3 bg-gray-100 border-b border-gray-300 text-left font-semibold">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="px-4 py-3 border-b border-gray-200">
                  {children}
                </td>
              )
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}