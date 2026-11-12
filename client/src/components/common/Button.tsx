import React from 'react';
import { cn } from '../../lib/cn.js';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-bold rounded-xl transition-all select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';

    const variants = {
      primary:
        'bg-[var(--theme-yellow)] text-[var(--theme-canvas)] hover:bg-[var(--theme-yellow-hover)] border border-[var(--theme-yellow)] shadow-xs font-bold',
      secondary:
        'bg-[var(--theme-surface)] text-[var(--theme-silver)] border border-[var(--theme-gray-border)] hover:bg-[var(--theme-surface-raised)] shadow-xs',
      outline:
        'bg-transparent text-[var(--theme-silver)] border border-[var(--theme-gray-border)] hover:bg-[var(--theme-surface)]',
      ghost:
        'border-transparent shadow-none hover:shadow-none bg-transparent text-[var(--theme-gray-muted)] hover:text-[var(--theme-silver)] hover:bg-[var(--theme-surface)]',
      danger: 'bg-red-950/60 text-red-300 border border-red-800 hover:bg-red-900 hover:text-white shadow-xs',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 gap-1.5',
      md: 'text-sm px-4 py-2 gap-2',
      lg: 'text-base px-5 py-2.5 gap-2.5',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
