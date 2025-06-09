import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import type { DialogProps } from './types';

export function DialogClient({ open, onClose, title, description, buttons }: DialogProps) {
  const [mounted, setMounted] = React.useState(false);
  
  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      
      // Add a class to body that can be used to handle any conflicts
      document.body.classList.add('dialog-open');
    } else {
      document.body.style.overflow = '';
      document.body.classList.remove('dialog-open');
    }
    
    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('dialog-open');
    };
  }, [open]);

  if (!open || !mounted) return null;
  
  // Construct the dialog markup
  const dialogContent = (
    <div
      className="fixed inset-0 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity" 
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Enter' && onClose()}
        role="button"
        tabIndex={0}
        aria-label="Cerrar diálogo"
      />
      
      {/* Dialog content */}
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        <p className="mt-2 text-gray-600">{description}</p>
        
        <div className="mt-6 flex justify-end gap-3">
          {buttons.map((button, index) => (
            <button
              key={index}
              onClick={button.onClick}
              className={cn(
                "rounded-md px-4 py-2 text-sm font-medium",
                button.variant === 'danger' 
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              {button.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
  
  // Use createPortal to render the dialog at the end of the document body
  // This ensures it's outside of any stacking contexts created by parent elements
  return createPortal(dialogContent, document.body);
}