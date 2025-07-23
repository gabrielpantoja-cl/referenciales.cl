'use client';

import React, { useState, useEffect, useRef } from 'react';
import { searchComunas, COMUNAS_CHILE } from '@/lib/comunas';

interface ComunaAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function ComunaAutocomplete({
  value,
  onChange,
  placeholder = 'Buscar comuna...',
  className = '',
  disabled = false
}: ComunaAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<typeof COMUNAS_CHILE>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [inputValue, setInputValue] = useState(value);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (inputValue.length > 0) {
      const results = searchComunas(inputValue);
      setSuggestions(results);
      setHighlightedIndex(-1);
    } else {
      setSuggestions([]);
    }
  }, [inputValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsOpen(true);
    
    // Si el usuario borra todo, también notificar al padre
    if (newValue === '') {
      onChange('');
    }
  };

  const handleSuggestionClick = (comuna: typeof COMUNAS_CHILE[0]) => {
    setInputValue(comuna.nombre);
    onChange(comuna.nombre);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          const selectedComuna = suggestions[highlightedIndex];
          handleSuggestionClick(selectedComuna);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleBlur = () => {
    // Pequeño delay para permitir clicks en las sugerencias
    setTimeout(() => {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }, 200);
  };

  const handleFocus = () => {
    if (inputValue.length > 0) {
      setIsOpen(true);
    }
  };

  // Scroll automático para el elemento resaltado
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [highlightedIndex]);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full ${className}`}
        autoComplete="off"
      />
      
      {isOpen && suggestions.length > 0 && (
        <ul
          ref={listRef}
          className="absolute z-[70] w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((comuna, index) => (
            <li key={`${comuna.codigo}-${comuna.nombre}`}>
              <button
                type="button"
                role="option"
                aria-selected={index === highlightedIndex}
                onClick={() => handleSuggestionClick(comuna)}
                className={`w-full text-left px-3 py-2 cursor-pointer hover:bg-blue-50 border-b border-gray-100 last:border-b-0 ${
                  index === highlightedIndex ? 'bg-blue-100' : ''
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">{comuna.nombre}</span>
                  <span className="text-sm text-gray-500">{comuna.region}</span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
      
      {isOpen && inputValue.length > 0 && suggestions.length === 0 && (
        <div className="absolute z-[70] w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-3">
          <div className="text-gray-500 text-sm">
            No se encontraron comunas que coincidan con &quot;{inputValue}&quot;
          </div>
        </div>
      )}
    </div>
  );
}