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
    sm: 'shadow-[2px_2px_0px_#000000]',
    md: 'shadow-[2.5px_2.5px_0px_#000000]',
    lg: 'shadow-[3.5px_3.5px_0px_#000000]',
    xl: 'shadow-[5px_5px_0px_#000000]',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Visual Identity Icon: Geometric Diamond "V" Emblem */}
      <div
        className={`${iconSizes[size]} ${badgeShadow[size]} rounded-xl border-2 border-black flex items-center justify-center font-black transition-all ${
          monochrome
            ? 'bg-black text-white'
            : 'bg-[#FACC15] text-black group-hover:-translate-y-0.5 group-hover:-translate-x-0.5 group-hover:shadow-[4px_4px_0px_#000000]'
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
          className={`${textSizes[size]} font-black tracking-tight leading-none text-black font-sans`}
        >
          Vexora<span className="text-[#E11D48]">Mods</span>
        </span>
        {showTagline && (
          <span className="text-[10px] font-bold text-neutral-600 tracking-wider uppercase mt-1">
            Everything You Need. One Platform. Free.
          </span>
        )}
      </div>
    </div>
  );
};
