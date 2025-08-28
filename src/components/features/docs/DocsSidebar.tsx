'use client';

import { useState } from 'react';
import { ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import type { DocItem } from '@/types/docs';

interface DocsSidebarProps {
  structure: DocItem[];
  selectedDoc: string;
  onDocSelect: (docId: string) => void;
}

export function DocsSidebar({ structure, selectedDoc, onDocSelect }: DocsSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['introduccion']));

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">📚 Documentación</h1>
        <p className="text-sm text-gray-600 mt-2">Referenciales.cl</p>
      </div>
      
      <nav className="space-y-1">
        {structure.map((section) => (
          <div key={section.id}>
            <button
              onClick={() => toggleSection(section.id)}
              className="flex items-center justify-between w-full px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
            >
              <span>{section.title}</span>
              {expandedSections.has(section.id) ? (
                <ChevronDownIcon className="h-4 w-4" />
              ) : (
                <ChevronRightIcon className="h-4 w-4" />
              )}
            </button>
            
            {expandedSections.has(section.id) && section.children && (
              <div className="ml-4 mt-1 space-y-1">
                {section.children.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => onDocSelect(doc.id)}
                    className={`block w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                      selectedDoc === doc.id
                        ? 'bg-blue-100 text-blue-900 font-medium'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    {doc.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}