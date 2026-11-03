import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { AI_TOOLS_REGISTRY } from '../lib/ai/aiToolsRegistry.js';
import { AiToolsDashboardPage } from '../pages/AiToolsDashboardPage.js';
import { AiImageEnhancerPage } from '../pages/ai/AiImageEnhancerPage.js';
import { AiCodeExplainerPage } from '../pages/ai/AiCodeExplainerPage.js';
import { AiDocumentSummarizerPage } from '../pages/ai/AiDocumentSummarizerPage.js';
import { AiWritingAssistantPage } from '../pages/ai/AiWritingAssistantPage.js';
import { ToastProvider } from '../context/ToastContext.js';
import { AuthProvider } from '../context/AuthContext.js';

describe('AI Tools Frontend Registry & Pages Suite', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            service: { nodeBackend: 'online' },
            readyTools: {
              'ai-image-enhancer': true,
              'ai-background-remover': true,
              'ai-object-remover': true,
              'ai-photo-restoration': true,
              'ai-ocr': true,
            },
          },
        }),
      }),
    );
  });

  it('validates AI_TOOLS_REGISTRY contains all 8 tools across image, document, developer, and writing categories', () => {
    expect(AI_TOOLS_REGISTRY.length).toBe(8);

    const categories = new Set(AI_TOOLS_REGISTRY.map((t) => t.category));
    expect(categories.has('image')).toBe(true);
    expect(categories.has('document')).toBe(true);
    expect(categories.has('developer')).toBe(true);
    expect(categories.has('writing')).toBe(true);

    for (const tool of AI_TOOLS_REGISTRY) {
      expect(tool.id).toBeDefined();
      expect(tool.name).toBeDefined();
      expect(tool.route).toMatch(/^\/ai-tools\//);
      expect(tool.creditCost).toBe(0);
      expect(tool.isFree).toBe(true);
      expect(tool.requiredModel).toBeDefined();
    }
  });

  it('renders AiToolsDashboardPage with header, search, and tool cards', async () => {
    render(
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <AiToolsDashboardPage />
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>,
    );

    expect(screen.getByText(/Free & Built-in AI Tools/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search AI tools/i)).toBeInTheDocument();
    expect(screen.getByText('AI Image Enhancer')).toBeInTheDocument();
    expect(screen.getByText('AI Background Remover')).toBeInTheDocument();
    expect(screen.getByText('AI Document OCR')).toBeInTheDocument();
    expect(screen.getByText('AI Code Explainer & Debugger')).toBeInTheDocument();
  });

  it('renders dedicated tool page AiImageEnhancerPage', () => {
    render(
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <AiImageEnhancerPage />
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>,
    );

    expect(screen.getByText('AI Image Enhancer')).toBeInTheDocument();
    expect(screen.getByText('Upscale Factor')).toBeInTheDocument();
    expect(screen.getByText('Enhancement Mode')).toBeInTheDocument();
  });

  it('renders dedicated tool page AiCodeExplainerPage', () => {
    render(
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <AiCodeExplainerPage />
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>,
    );

    expect(screen.getByText(/AI Code Explainer & Bug Debugger/i)).toBeInTheDocument();
    expect(screen.getByText(/Explain Code Logic/i)).toBeInTheDocument();
    expect(screen.getByText(/Debug & Fix Errors/i)).toBeInTheDocument();
  });

  it('renders dedicated tool page AiDocumentSummarizerPage', () => {
    render(
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <AiDocumentSummarizerPage />
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>,
    );

    expect(screen.getByText(/AI Document Summarizer & Q&A/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Executive Summary/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Ask Document Q&A/i)).toBeInTheDocument();
  });

  it('renders dedicated tool page AiWritingAssistantPage', () => {
    render(
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <AiWritingAssistantPage />
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>,
    );

    expect(screen.getByText(/AI Writing & ATS Resume Assistant/i)).toBeInTheDocument();
    expect(screen.getByText(/ATS Resume Builder/i)).toBeInTheDocument();
    expect(screen.getByText(/Tone & Grammar Rewrite/i)).toBeInTheDocument();
  });
});
