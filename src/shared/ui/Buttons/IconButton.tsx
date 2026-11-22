import { cn } from '@/shared/lib';
import { type ButtonHTMLAttributes, forwardRef } from 'react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'primary' | 'ghost' | 'destructive' | 'dangerGhost';
  ariaLabel: string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, size = 'md', variant = 'default', className, ariaLabel, disabled, ...props }, ref) => {
    const sizes = {
      sm: 'w-8 h-8 p-1.5',
      md: 'w-10 h-10 p-2',
      lg: 'w-12 h-12 p-2.5',
    };

    const variants = {
      default: 'bg-gray-800 text-white hover:bg-gray-700',
      primary: 'bg-blue-500 text-white hover:bg-blue-600',
      ghost: 'bg-transparent hover:bg-gray-800 text-gray-300',
      dangerGhost: 'bg-transparent text-red-400 hover:bg-red-500/10 hover:text-red-300',
      destructive: 'bg-red-100 text-red-600 hover:bg-red-200',
    };

    return (
      <button
        ref={ref}
        type="button"
        aria-label={ariaLabel}
        title={ariaLabel}
        disabled={disabled}
        className={cn(
          'rounded-xl flex items-center justify-center transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed',
          sizes[size],
          variants[variant],
          className,
        )}
        {...props}
      >
        {icon}
      </button>
    );
  },
);
