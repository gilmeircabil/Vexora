import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { AiImageEnhancerPage } from '../pages/ai/AiImageEnhancerPage.js';
import { AiCodeExplainerPage } from '../pages/ai/AiCodeExplainerPage.js';
import { AiDocumentSummarizerPage } from '../pages/ai/AiDocumentSummarizerPage.js';
import { AiWritingAssistantPage } from '../pages/ai/AiWritingAssistantPage.js';
import { AiChatPage } from '../pages/ai/AiChatPage.js';
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

  it('renders dedicated tool page AiChatPage with Full Screen focus mode toggle button', () => {
    render(
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <AiChatPage />
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>,
    );

    const fullscreenBtn = screen.getByRole('button', { name: /full screen/i });
    expect(fullscreenBtn).toBeInTheDocument();

    fireEvent.click(fullscreenBtn);
    expect(screen.getByRole('button', { name: /exit full screen/i })).toBeInTheDocument();
  });
});
