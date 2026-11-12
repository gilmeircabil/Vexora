import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  monochrome?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  showTagline = false,
  monochrome = false,
}) => {
  const iconSizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-4xl',
  };

  const badgeShadow = {
    sm: 'shadow-xs',
    md: 'shadow-sm',
    lg: 'shadow-md',
    xl: 'shadow-lg',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Visual Identity Icon: Geometric Diamond "V" Emblem */}
      <div
        data-testid="brand-emblem"
        className={`${iconSizes[size]} ${badgeShadow[size]} rounded-xl border flex items-center justify-center font-black transition-all ${
          monochrome
            ? 'bg-[var(--theme-surface)] text-[var(--theme-silver)] border-[var(--theme-gray-border)]'
            : 'bg-[var(--theme-yellow)] text-[var(--theme-canvas)] border-[var(--theme-yellow)] hover:bg-[var(--theme-yellow-hover)] shadow-xs'
        }`}
      >
        <svg
          className="w-[62%] h-[62%] stroke-[2.7]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Stylized Modern Vexora V Geometric Glyph */}
          <polygon points="12 2 2 7 12 12 22 7 12 2" fill="currentColor" fillOpacity="0.15" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
      </div>

      {/* Typography */}
      <div className="flex flex-col">
        <span
          className={`${textSizes[size]} font-black tracking-tight leading-none text-[var(--theme-silver)] font-sans`}
        >
          Vexora<span className="text-[var(--theme-yellow)]">Mods</span>
        </span>
        {showTagline && (
          <span className="text-[10px] font-medium text-[var(--theme-gray-muted)] tracking-wider uppercase mt-1">
            Everything You Need. One Platform. Free.
          </span>
        )}
      </div>
    </div>
  );
};
