import React from 'react';
import { cn } from '../../lib/cn.js';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ className, hoverable = false, children, ...props }) => {
  return (
    <div
      className={cn(
        'bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] rounded-2xl p-6 shadow-sm text-[var(--theme-dirty-white)] transition-all',
        hoverable &&
          'hover:-translate-y-0.5 hover:border-[var(--theme-gray-subtle)] hover:bg-[var(--theme-surface-raised)] cursor-pointer',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};
