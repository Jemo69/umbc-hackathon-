import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  fullWidth?: boolean;
  variant?: 'primary' | 'outline';
}

export const AuthButton = forwardRef<HTMLButtonElement, AuthButtonProps>(
  (
    {
      children,
      isLoading = false,
      fullWidth = false,
      variant = "primary",
      className = "",
      ...props
    },
    ref
  ) => {
    const baseClasses =
      "flex items-center justify-center rounded-m3-xl px-6 py-3 text-label-large font-medium transition-all duration-300 focus:outline-none focus-visible:ring-4 disabled:opacity-60 interactive";
    const variantClasses = {
      primary:
        "bg-primary-500 text-on-primary hover:bg-primary-600 shadow-m3-2 hover:shadow-m3-3 focus-visible:ring-primary-500/30",
      outline:
        "border border-outline text-on-surface hover:bg-primary-500/10 focus-visible:ring-primary-500/20 dark:border-outline-variant",
    };

    return (
      <button
        ref={ref}
        disabled={isLoading}
        className={`${baseClasses} ${variantClasses[variant]} ${
          fullWidth ? "w-full" : ""
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
