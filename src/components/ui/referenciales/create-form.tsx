// components/ui/referenciales/create-form.tsx
'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/primitives/button';
import { createReferencial } from '@/lib/actions';
import { useSession, SessionProvider } from 'next-auth/react';
import { validateReferencial } from '@/lib/validation';
import FormFields from './FormFields';
import { ValidationResult } from '@/types/types';

interface FormState {
  errors: { [key: string]: string[] };
  message: string | null;
  messageType: 'error' | 'success' | null;
  invalidFields: Set<string>;
  isSubmitting: boolean;
  redirecting: boolean;
}

interface User {
  id: string;
  name: string | null;
}

interface FormProps {
  users: User[];
}

const Form: React.FC<FormProps> = ({ users }) => (
  <SessionProvider>
    <InnerForm users={users} />
  </SessionProvider>
);

const InnerForm: React.FC<FormProps> = ({ users }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const mounted = useRef(true);
  const [isCreated, setIsCreated] = useState(false);
  
  const [state, setState] = useState<FormState>({
    message: null,
    messageType: null,
    errors: {},
    invalidFields: new Set(),
    isSubmitting: false,
    redirecting: false
  });

  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  const userId = session?.user?.id;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!userId) {
      setState(prev => ({
        ...prev,
        message: "Error: Usuario no autenticado",
        messageType: 'error',
        errors: { auth: ['Se requiere autenticación'] }
      }));
      return;
    }

    try {
      setState(prev => ({ 
        ...prev, 
        isSubmitting: true, 
        message: "Procesando solicitud...",
        messageType: 'success',
        errors: {},
        invalidFields: new Set()
      }));

      const formData = new FormData(e.currentTarget);
      formData.set('userId', userId);

      const validationResult: ValidationResult = validateReferencial(formData);

      if (!validationResult.isValid) {
        setState(prev => ({
          ...prev,
          isSubmitting: false,
          errors: validationResult.errors,
          message: validationResult.message || "Por favor complete todos los campos requeridos",
          messageType: 'error',
          invalidFields: new Set(Object.keys(validationResult.errors))
        }));
        
        // Scroll to the first field with an error
        const firstErrorField = Object.keys(validationResult.errors)[0];
        const element = document.getElementById(firstErrorField);
        if (element) {
          // Smooth scroll to the element
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Focus the element
          setTimeout(() => element.focus(), 500);
        }
        
        return;
      }

      const result = await createReferencial(formData);

      if (!mounted.current) return;

      if (result?.errors) {
        const errorFields = new Set(Object.keys(result.errors));
        
        setState(prev => ({
          ...prev,
          errors: result.errors,
          message: result.message || "Error al crear el referencial. Revisa los campos marcados en rojo.",
          messageType: 'error',
          invalidFields: errorFields,
          isSubmitting: false
        }));
        
        // Scroll to the first field with an error
        const firstErrorField = Object.keys(result.errors)[0];
        const element = document.getElementById(firstErrorField);
        if (element) {
          // Smooth scroll to the element
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Focus the element
          setTimeout(() => element.focus(), 500);
        }
        
        return;
      }

      // Si la creación fue exitosa
      setIsCreated(true);
      setState(prev => ({
        ...prev,
        message: "¡Referencial creado exitosamente!",
        messageType: 'success',
        isSubmitting: false,
        redirecting: true
      }));

      // Redirección inmediata
      router.push('/dashboard/referenciales');
      router.refresh();

    } catch (error) {
      console.error('Error al crear referencial:', error);
      
      if (mounted.current) {
        setState(prev => ({
          ...prev,
          message: error instanceof Error
            ? `Error al crear el referencial: ${error.message}`
            : "Error inesperado al procesar el formulario",
          messageType: 'error',
          isSubmitting: false,
          redirecting: false
        }));
      }
    }
  };

  const currentUser = useMemo(() => ({
    id: session?.user?.id || '',
    name: session?.user?.name || ''
  }), [session?.user?.id, session?.user?.name]);

  // Count errors to show in the error summary
  const errorCount = Object.keys(state.errors).length;

  return (
    <form onSubmit={handleSubmit}>
      {/* Error Summary at the top of the form */}
      {errorCount > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md" role="alert">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {errorCount === 1 
                  ? "Hay 1 error en el formulario"
                  : `Hay ${errorCount} errores en el formulario`}
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-disc pl-5 space-y-1">
                  {Object.keys(state.errors).map(field => (
                    <li key={field}>
                      <button 
                        type="button"
                        className="underline hover:text-red-800 focus:outline-none"
                        onClick={() => {
                          const element = document.getElementById(field);
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            setTimeout(() => element.focus(), 500);
                          }
                        }}
                      >
                        {field}: {state.errors[field][0]}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Form fields */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Crear Nuevo Referencial</h2>
          <p className="text-sm text-gray-500">Completa todos los campos requeridos marcados con <span className="text-red-500">*</span></p>
        </div>

        <FormFields state={state} currentUser={currentUser} />

        {/* Messages */}
        {state.message && state.messageType === 'success' && (
          <div
            id="message"
            aria-live="polite"
            className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md"
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{state.message}</p>
              </div>
            </div>
          </div>
        )}

        {isCreated && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">¡Referencial creado exitosamente!</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6">
          <h3 className="text-lg font-medium flex items-center">
            <span className="inline-block w-2 h-2 mr-2 bg-green-500 rounded-full"></span>
            Referenciales.cl
          </h3>
          <p>{users.length} usuarios conectados</p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/referenciales"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancelar
        </Link>
        <Button
          type="submit"
          disabled={state.isSubmitting || state.redirecting}
          className={errorCount > 0 ? "bg-red-600 hover:bg-red-700" : ""}
        >
          {state.isSubmitting 
            ? 'Creando...' 
            : state.redirecting 
              ? 'Redirigiendo...' 
              : errorCount > 0
                ? `Corregir ${errorCount} ${errorCount === 1 ? 'error' : 'errores'}`
                : 'Crear Referencial'
          }
        </Button>
      </div>
    </form>
  );
};

export default Form;