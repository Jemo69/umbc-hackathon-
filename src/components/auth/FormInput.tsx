import { InputHTMLAttributes, forwardRef } from 'react';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, required = false, id, className = "", ...props }, ref) => {
    const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, "-")}`;

    return (
      <div>
        <label
          htmlFor={inputId}
          className="block text-body-medium font-medium text-on-surface-variant mb-2"
        >
          {label} {required && <span className="text-red-600">*</span>}
        </label>
        <input
          id={inputId}
          ref={ref}
          className={`block w-full rounded-m3-lg border-2 bg-white/30 dark:bg-black/30 px-4 py-3 text-body-large text-on-surface transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-background backdrop-blur-sm dark:border-surface-700 ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : "border-outline focus:border-primary-500 focus:ring-primary-500"
          } ${className}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && (
          <p
            className="mt-2 text-body-small text-red-600 dark:text-red-400"
            id={`${inputId}-error`}
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';
