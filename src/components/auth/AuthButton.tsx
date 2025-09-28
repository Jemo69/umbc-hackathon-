import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  fullWidth?: boolean;
  variant?: 'primary' | 'outline';
}

export const AuthButton = forwardRef<HTMLButtonElement, AuthButtonProps>(
  ({ children, isLoading = false, fullWidth = false, variant = 'primary', className = '', ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={isLoading}
        className={`flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${
          variant === 'primary' 
            ? 'border border-transparent bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500'
            : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-primary-500'
        } ${
          fullWidth ? 'w-full' : ''
        } ${className}`}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

AuthButton.displayName = 'AuthButton';
