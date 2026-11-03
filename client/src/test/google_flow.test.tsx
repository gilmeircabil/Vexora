import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { searchTools, isAiPoweredTool, TOOL_BY_ID } from '../tools/catalog.js';
import { GoogleFlowTool } from '../features/external/GoogleFlowTool.js';
import { ToolCard } from '../components/common/ToolCard.js';
import { ToolsDirectoryPage } from '../pages/ToolsDirectoryPage.js';
import { AuthProvider } from '../context/AuthContext.js';
import { ToastProvider } from '../context/ToastContext.js';

describe('Google Flow External AI Tool Integration Suite', () => {
  it('registers Google Flow in TOOL_CATALOG with required external metadata', () => {
    const flow = TOOL_BY_ID.get('google-flow');
    expect(flow).toBeDefined();
    expect(flow?.name).toBe('Google Flow');
    expect(flow?.isExternal).toBe(true);
    expect(flow?.externalUrl).toBe('https://labs.google/fx/tools/flow');
    expect(flow?.provider).toBe('Google');
    expect(flow?.toolType).toBe('ai-powered');
    expect(isAiPoweredTool(flow!)).toBe(true);
    expect(flow?.features).toContain('AI video generation');
    expect(flow?.features).toContain('AI image generation');
    expect(flow?.features).toContain('Visual storytelling');
    expect(flow?.externalNotice).toContain('Google Flow is an external service operated by Google');
  });

  it('finds Google Flow via keywords and searchTools function', () => {
    const resultsGoogle = searchTools('google');
    expect(resultsGoogle.some((t) => t.id === 'google-flow')).toBe(true);

    const resultsFlow = searchTools('flow');
    expect(resultsFlow.some((t) => t.id === 'google-flow')).toBe(true);

    const resultsVideo = searchTools('video generation');
    expect(resultsVideo.some((t) => t.id === 'google-flow')).toBe(true);

    const resultsStorytelling = searchTools('visual storytelling');
    expect(resultsStorytelling.some((t) => t.id === 'google-flow')).toBe(true);
  });

  it('renders ToolCard with both External Tool and AI badges for Google Flow', () => {
    const flow = TOOL_BY_ID.get('google-flow')!;
    render(
      <BrowserRouter>
        <ToolCard tool={flow} />
      </BrowserRouter>,
    );

    expect(screen.getByText('Google Flow')).toBeInTheDocument();
    expect(screen.getByText('External Tool')).toBeInTheDocument();
    expect(screen.getByText('AI')).toBeInTheDocument();
    expect(screen.getByText('View External Tool')).toBeInTheDocument();
  });

  it('renders GoogleFlowTool launcher with external service notice, capabilities, and secure link', () => {
    render(<GoogleFlowTool />);

    // Verify Title and Provider
    expect(screen.getByText('Google Flow Creative Workspace')).toBeInTheDocument();
    expect(screen.getByText('Provider: Google')).toBeInTheDocument();

    // Verify External Service Notice
    expect(
      screen.getByText(/Google Flow is an external service operated by Google/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Google account requirements, availability, and usage limits apply/i),
    ).toBeInTheDocument();

    // Verify Capabilities
    expect(screen.getByText('AI Image Generation')).toBeInTheDocument();
    expect(screen.getByText('AI Video Generation')).toBeInTheDocument();
    expect(screen.getByText('Visual Storytelling')).toBeInTheDocument();
    expect(screen.getByText('AI-Assisted Creative Workflows')).toBeInTheDocument();
    expect(screen.getByText('Creative Experimentation')).toBeInTheDocument();

    // Verify Launch CTA with secure attributes
    const launchBtn = screen.getByTestId('launch-google-flow-btn');
    expect(launchBtn).toBeInTheDocument();
    expect(launchBtn).toHaveAttribute('href', 'https://labs.google/fx/tools/flow');
    expect(launchBtn).toHaveAttribute('target', '_blank');
    expect(launchBtn).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('displays Google Flow in ToolsDirectoryPage under All and AI-Powered views', () => {
    render(
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <ToolsDirectoryPage />
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>,
    );

    // Should be visible in the catalog
    expect(screen.getByText('Google Flow')).toBeInTheDocument();

    // Switch to AI-Powered
    const aiBtn = screen.getByRole('button', { name: /AI-Powered/i });
    fireEvent.click(aiBtn);
    expect(screen.getByText('Google Flow')).toBeInTheDocument();

    // Search specifically for "Flow"
    const searchInput = screen.getByPlaceholderText(/Search all/i);
    fireEvent.change(searchInput, { target: { value: 'Flow' } });
    expect(screen.getByText('Google Flow')).toBeInTheDocument();
  });
});
