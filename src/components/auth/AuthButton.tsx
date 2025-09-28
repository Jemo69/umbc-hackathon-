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
    const baseClasses = 'flex items-center justify-center font-bold transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-background interactive disabled:opacity-60 disabled:pointer-events-none';
    
    const sizeClasses = {
      sm: 'px-4 py-2 text-label-medium rounded-m3-md h-10',
      md: 'px-6 py-3 text-label-large rounded-m3-lg h-12',
      lg: 'px-8 py-4 text-title-medium rounded-m3-xl h-14'
    };
    
    const variantClasses = {
      primary: 'bg-primary-800 text-white shadow-m3-2 hover:bg-primary-900 hover:shadow-m3-3 focus-visible:ring-primary-500',
      secondary: 'bg-secondary-800 text-white shadow-m3-2 hover:bg-secondary-900 hover:shadow-m3-3 focus-visible:ring-secondary-500',
      outline: 'border-2 border-primary-600 bg-transparent text-primary-600 hover:bg-primary-600/10 dark:text-primary-400 dark:border-primary-400 dark:hover:bg-primary-400/10 focus-visible:ring-primary-500'
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
