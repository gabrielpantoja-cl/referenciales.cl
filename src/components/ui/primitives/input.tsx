// components/ui/input.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string[];
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, ...props }, ref) => {
    const hasError = error && error.length > 0;
    
    return (
      <div className="mb-4">
        {label && (
          <label 
            htmlFor={props.id} 
            className={cn(
              "mb-2 block text-sm font-medium",
              hasError ? "text-red-700" : ""
            )}
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative mt-2 rounded-md">
          <input
            type={type}
            className={cn(
              "flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              hasError 
                ? "border-red-500 bg-red-50 text-red-900 focus-visible:ring-red-500" 
                : "border-input bg-background focus-visible:ring-ring",
              className
            )}
            aria-invalid={hasError ? "true" : "false"}
            aria-describedby={hasError ? `${props.id}-error` : undefined}
            ref={ref}
            {...props}
          />
        </div>
        {hasError && (
          <div
            id={`${props.id}-error`}
            aria-live="polite"
            className="mt-2 text-sm text-red-600 flex items-start space-x-1"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 mt-0.5 flex-shrink-0" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" 
                clipRule="evenodd" 
              />
            </svg>
            <div>
              {error.map((e) => (
                <p key={e}>{e}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };