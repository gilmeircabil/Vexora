import React from 'react';
import * as LucideIcons from 'lucide-react';

interface IconProps {
  name: string;
  className?: string;
  size?: number;
}

export const Icon: React.FC<IconProps> = ({ name, className = 'w-5 h-5', size }) => {
  const iconsMap = LucideIcons as unknown as Record<
    string,
    React.ComponentType<{ className?: string; size?: number }>
  >;
  const LucideIcon = iconsMap[name] || LucideIcons.Wrench;

  return <LucideIcon className={className} size={size} />;
};
