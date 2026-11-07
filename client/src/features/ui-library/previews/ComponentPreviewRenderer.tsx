import React from 'react';
import { ComponentLivePreview } from './ComponentLivePreview.js';
import { WebsiteLayoutLivePreview } from './WebsiteLayoutLivePreview.js';
import { DashboardLayoutLivePreview } from './DashboardLayoutLivePreview.js';
import { DesignStyleLivePreview } from './DesignStyleLivePreview.js';

interface Props {
  itemId: string;
  itemType?: 'component' | 'website-layout' | 'dashboard-layout' | 'design-style';
  variationId?: string;
  previewMode?: 'desktop' | 'tablet' | 'mobile';
  className?: string;
}

export const ComponentPreviewRenderer: React.FC<Props> = ({
  itemId,
  itemType = 'component',
  variationId,
  previewMode = 'desktop',
  className = '',
}) => {
  // Determine width based on device preview mode
  let containerWidthClass = 'w-full';
  if (previewMode === 'tablet') {
    containerWidthClass = 'max-w-[768px] mx-auto';
  } else if (previewMode === 'mobile') {
    containerWidthClass = 'max-w-[375px] mx-auto';
  }

  const renderContent = () => {
    switch (itemType) {
      case 'website-layout':
        return <WebsiteLayoutLivePreview layoutId={itemId} />;
      case 'dashboard-layout':
        return <DashboardLayoutLivePreview dashboardId={itemId} />;
      case 'design-style':
        return <DesignStyleLivePreview styleId={itemId} />;
      case 'component':
      default:
        return <ComponentLivePreview componentId={itemId} variationId={variationId} />;
    }
  };

  return (
    <div className={`transition-all duration-300 ${containerWidthClass} ${className}`}>
      {renderContent()}
    </div>
  );
};
