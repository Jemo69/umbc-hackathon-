import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  fullWidth?: boolean;
  variant?: 'primary' | 'outline' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

export const AuthButton = forwardRef<HTMLButtonElement, AuthButtonProps>(
  ({ children, isLoading = false, fullWidth = false, variant = 'primary', size = 'md', className = '', ...props }, ref) => {
    const baseClasses = 'flex items-center justify-center font-medium transition-all duration-200 focus-ring interactive disabled:opacity-50 disabled:pointer-events-none';
    
    const sizeClasses = {
      sm: 'px-3 py-2 text-label-medium rounded-m3-sm h-10',
      md: 'px-6 py-3 text-label-large rounded-m3-md h-12',
      lg: 'px-8 py-4 text-title-small rounded-m3-lg h-14'
    };
    
    const variantClasses = {
      primary: 'm3-primary shadow-m3-2 hover:shadow-m3-3',
      secondary: 'm3-secondary shadow-m3-2 hover:shadow-m3-3',
      outline: 'border-2 border-primary-500 bg-transparent text-primary-600 hover:bg-primary-50 shadow-m3-1 hover:shadow-m3-2'
    };
    
    return (
      <button
        ref={ref}
        disabled={isLoading || props.disabled}
        className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${
          fullWidth ? 'w-full' : ''
        } ${className}`}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

AuthButton.displayName = 'AuthButton';
