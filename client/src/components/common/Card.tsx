import React from 'react';
import { cn } from '../../lib/cn.js';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ className, hoverable = false, children, ...props }) => {
  return (
    <div
      className={cn(
        'bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-2xs transition-all',
        hoverable &&
          'hover:border-indigo-400 hover:shadow-md cursor-pointer',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};
