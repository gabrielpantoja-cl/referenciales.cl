// components/ui/alert.tsx - Para mensajes informativos

import React from 'react';
import { cn } from '@/lib/utils'; // Asegúrate de tener una función de utilidad para concatenar clases

interface AlertProps {
  variant?: 'default' | 'destructive';
  className?: string;
  children: React.ReactNode;
}

interface AlertDescriptionProps {
  className?: string;
  children: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({ variant = 'default', className, children }) => {
  const baseClasses = 'p-4 rounded-md';
  const variantClasses = variant === 'destructive' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700';

  return (
    <div className={cn(baseClasses, variantClasses, className)}>
      {children}
    </div>
  );
};

export const AlertDescription: React.FC<AlertDescriptionProps> = ({ className, children }) => {
  return (
    <div className={cn('text-sm', className)}>
      {children}
    </div>
  );
};