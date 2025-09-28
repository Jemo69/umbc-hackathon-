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
      <div className="relative">
        <input
          id={inputId}
          ref={ref}
          className={`peer block w-full appearance-none rounded-m3-md border bg-transparent px-3 py-4 text-body-large text-on-surface transition-colors duration-300 focus:outline-none focus:ring-2 dark:border-white/20 ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500/30"
              : "border-outline focus:border-primary-500 focus:ring-primary-500/30"
          } ${className}`}
          placeholder=" "
          {...props}
        />
        <label
          htmlFor={inputId}
          className={`absolute left-3 top-4 z-10 origin-[0] -translate-y-7 scale-75 transform text-body-medium duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-7 peer-focus:scale-75 ${
            error
              ? "text-red-600 dark:text-red-500"
              : "text-gray-600 dark:text-gray-400"
          } peer-focus:text-primary-600 dark:peer-focus:text-primary-400`}
        >
          {label}{' '}
          {required && (
            <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
              (required)
            </span>
          )}
        </label>
        {error && (
          <p
            className="mt-1 text-body-small text-red-500"
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
