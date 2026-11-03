import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { MaintenanceModal, LockedPageModal } from '../components/common/LockedPageModal.js';
import {
  PAGE_LOCKS,
  getRouteLockStatus,
  DEFAULT_MAINTENANCE_DATA,
  type MaintenanceConfigData,
} from '../config/pageLocks.js';

describe('MaintenanceModal & Dynamic Page Locks Suite', () => {
  it('has page locks configured for all platform pages with boolean values', () => {
    expect(typeof PAGE_LOCKS.HOME).toBe('boolean');
    expect(typeof PAGE_LOCKS.TOOLS).toBe('boolean');
    expect(typeof PAGE_LOCKS.STUDIO).toBe('boolean');
    expect(typeof PAGE_LOCKS.LEARNING).toBe('boolean');
    expect(typeof PAGE_LOCKS.STUDY_SPACE).toBe('boolean');
    expect(typeof PAGE_LOCKS.COMMUNITY).toBe('boolean');
    expect(typeof PAGE_LOCKS.REVIEWS).toBe('boolean');
    expect(typeof PAGE_LOCKS.DEVELOPER_PROJECTS).toBe('boolean');
    expect(typeof PAGE_LOCKS.DASHBOARD).toBe('boolean');
    expect(typeof PAGE_LOCKS.ABOUT).toBe('boolean');
    expect(typeof PAGE_LOCKS.PRIVACY).toBe('boolean');
    expect(typeof PAGE_LOCKS.TERMS).toBe('boolean');
    expect(typeof PAGE_LOCKS.LICENSES).toBe('boolean');
    expect(typeof PAGE_LOCKS.CONTRIBUTING).toBe('boolean');
  });

  it('correctly evaluates route lock status based on static fallback', () => {
    expect(getRouteLockStatus('/study').isLocked).toBe(PAGE_LOCKS.STUDY_SPACE);
    expect(getRouteLockStatus('/study/some-subpath').isLocked).toBe(PAGE_LOCKS.STUDY_SPACE);
    expect(getRouteLockStatus('/community').isLocked).toBe(PAGE_LOCKS.COMMUNITY);
    expect(getRouteLockStatus('/support').isLocked).toBe(PAGE_LOCKS.COMMUNITY);

    // Unlocked default routes
    expect(getRouteLockStatus('/').isLocked).toBe(PAGE_LOCKS.HOME);
    expect(getRouteLockStatus('/tools').isLocked).toBe(PAGE_LOCKS.TOOLS);
    expect(getRouteLockStatus('/tools/pdf-merger').isLocked).toBe(PAGE_LOCKS.TOOLS);
    expect(getRouteLockStatus('/studio').isLocked).toBe(PAGE_LOCKS.STUDIO);
    expect(getRouteLockStatus('/learning').isLocked).toBe(PAGE_LOCKS.LEARNING);
    expect(getRouteLockStatus('/reviews').isLocked).toBe(PAGE_LOCKS.REVIEWS);
    expect(getRouteLockStatus('/about').isLocked).toBe(PAGE_LOCKS.ABOUT);
  });

  it('evaluates dynamic maintenance configuration when provided', () => {
    const customConfig: MaintenanceConfigData = {
      global: false,
      title: 'Scheduled System Maintenance',
      message: 'Tools are temporarily undergoing database optimizations.',
      estimatedReturn: '10:30 PM UTC',
      pages: {
        ...DEFAULT_MAINTENANCE_DATA.pages,
        TOOLS: true,
        STUDIO: true,
      },
    };

    expect(getRouteLockStatus('/tools', customConfig).isLocked).toBe(true);
    expect(getRouteLockStatus('/tools/image-resizer', customConfig).isLocked).toBe(true);
    expect(getRouteLockStatus('/category/pdf', customConfig).isLocked).toBe(true);
    expect(getRouteLockStatus('/studio', customConfig).isLocked).toBe(true);
    expect(getRouteLockStatus('/learning', customConfig).isLocked).toBe(false);
    expect(getRouteLockStatus('/', customConfig).isLocked).toBe(false);
  });

  it('locks all routes when global maintenance is enabled', () => {
    const globalConfig: MaintenanceConfigData = {
      global: true,
      title: 'Emergency Global Maintenance',
      message: 'All features offline for infrastructure upgrade.',
      estimatedReturn: 'Soon',
      pages: { ...DEFAULT_MAINTENANCE_DATA.pages },
    };

    expect(getRouteLockStatus('/', globalConfig).isLocked).toBe(true);
    expect(getRouteLockStatus('/tools', globalConfig).isLocked).toBe(true);
    expect(getRouteLockStatus('/studio', globalConfig).isLocked).toBe(true);
    expect(getRouteLockStatus('/learning', globalConfig).isLocked).toBe(true);
    expect(getRouteLockStatus('/community', globalConfig).isLocked).toBe(true);
  });

  it('renders Neo-Brutalist MaintenanceModal with title, description, and return badge', () => {
    render(
      <BrowserRouter>
        <MaintenanceModal
          title="Scheduled Maintenance"
          description="This section is currently undergoing updates. Please check back shortly."
          pageTitle="Design Studio"
          estimatedReturn="11:00 PM UTC"
          accentColor="#38BDF8"
        />
      </BrowserRouter>,
    );

    // Title & Description
    expect(screen.getByRole('heading', { name: /Scheduled Maintenance/i })).toBeInTheDocument();
    expect(
      screen.getByText(/This section is currently undergoing updates. Please check back shortly./i),
    ).toBeInTheDocument();

    // Under Maintenance Badge & Estimated Return Time
    expect(screen.getByText(/Under Maintenance/i)).toBeInTheDocument();
    expect(screen.getByText(/11:00 PM UTC/i)).toBeInTheDocument();

    // Navigation Link back to home
    expect(screen.getByRole('link', { name: /Homepage/i })).toHaveAttribute('href', '/');
  });

  it('maintains backward compatibility with LockedPageModal export', () => {
    render(
      <BrowserRouter>
        <LockedPageModal
          title="Maintenance Mode"
          description="Legacy alias compatibility test."
        />
      </BrowserRouter>,
    );

    expect(screen.getByRole('heading', { name: /Maintenance Mode/i })).toBeInTheDocument();
  });
});
