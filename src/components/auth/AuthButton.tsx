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
    const baseClasses = 'flex items-center justify-center font-bold transition-all duration-300 focus-ring interactive disabled:opacity-60 disabled:pointer-events-none';
    
    const sizeClasses = {
      sm: 'px-4 py-2 text-label-medium rounded-m3-md h-10',
      md: 'px-6 py-4 text-label-large rounded-m3-lg h-14',
      lg: 'px-8 py-5 text-title-medium rounded-m3-xl h-16'
    };
    
    const variantClasses = {
      primary: 'bg-primary-500 text-white shadow-m3-3 hover:bg-primary-600 hover:shadow-m3-4 transform hover:-translate-y-0.5 active:bg-primary-700',
      secondary: 'bg-secondary-500 text-white shadow-m3-3 hover:bg-secondary-600 hover:shadow-m3-4 transform hover:-translate-y-0.5 active:bg-secondary-700',
      outline: 'border-2 border-primary-500 bg-transparent text-primary-500 hover:bg-primary-500/10 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 dark:hover:bg-primary-500/10 shadow-m3-1 hover:shadow-m3-2'
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
