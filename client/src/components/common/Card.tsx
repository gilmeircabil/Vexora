import React from 'react';
import { cn } from '../../lib/cn.js';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ className, hoverable = false, children, ...props }) => {
  return (
    <div
      className={cn(
        'bg-white border-2 border-black rounded-2xl p-5 shadow-[4px_4px_0px_#000000] transition-all',
        hoverable &&
          'hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0px_#000000] cursor-pointer',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};
