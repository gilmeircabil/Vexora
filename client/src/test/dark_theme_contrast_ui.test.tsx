import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QuizMaker } from '../features/education/student/QuizMaker.js';
import { GradeCalculator } from '../features/education/student/GradeCalculator.js';
import { SmartImageStudio } from '../features/images/SmartImageStudio.js';
import AiImageEnhancerTool from '../features/images/AiImageEnhancerTool.js';
import { DocumentQuizGenerator } from '../features/education/doc-quiz/DocumentQuizGenerator.js';
import { ToastProvider } from '../context/ToastContext.js';
import { AuthProvider } from '../context/AuthContext.js';
import { MemoryRouter } from 'react-router';

describe('Dark Theme & Contrast UI Consistency Suite', () => {
  it('ensures QuizMaker alert banner does not use jarring light-mode bg-amber-50 / text-amber-900', () => {
    const { container } = render(
      <ToastProvider>
        <AuthProvider>
          <MemoryRouter>
            <QuizMaker />
          </MemoryRouter>
        </AuthProvider>
      </ToastProvider>
    );

    const banner = screen.getByText(/Automated Scoring Policy:/i).closest('div');
    expect(banner?.parentElement?.className || banner?.className).not.toContain('bg-amber-50');
    expect(banner?.parentElement?.className || banner?.className).not.toContain('text-amber-900');
  });

  it('ensures DocumentQuizGenerator does not use stark white step ribbons or conflicting sample cards', () => {
    const { container } = render(
      <ToastProvider>
        <AuthProvider>
          <MemoryRouter>
            <DocumentQuizGenerator />
          </MemoryRouter>
        </AuthProvider>
      </ToastProvider>
    );

    const step1 = screen.getByText(/1\. Upload Document/i).closest('div');
    expect(step1?.className).not.toContain('bg-[var(--theme-dirty-white)]');
    expect(step1?.className).toContain('bg-[var(--theme-yellow)]');

    const sampleButton = screen.getByText(/Cell Structure and Organelles/i).closest('button');
    expect(sampleButton?.className).not.toContain('hover:bg-[var(--theme-dirty-white)]');

    const savedQuizzesBtn = screen.getByRole('button', { name: /Saved Quizzes/i });
    expect(savedQuizzesBtn.className).not.toContain('text-neutral-800');
    expect(savedQuizzesBtn.className).not.toContain('hover:bg-neutral-100');

    const dropzone = screen.getByText(/Create a Quiz from Your Documents/i).closest('div[class*="border"]');
    expect(dropzone?.className).not.toContain('border-black');
  });

  it('ensures GradeCalculator table percentage and action buttons have high dark-mode contrast', () => {
    const { container } = render(
      <ToastProvider>
        <AuthProvider>
          <MemoryRouter>
            <GradeCalculator />
          </MemoryRouter>
        </AuthProvider>
      </ToastProvider>
    );

    expect(container.innerHTML).not.toContain('text-neutral-800');
    expect(container.innerHTML).not.toContain('bg-[#4ADE80]');
    expect(container.innerHTML).not.toContain('hover:bg-neutral-50');
  });

  it('ensures SmartImageStudio dropzone does not turn cream #f3ede1 with invisible text on hover', () => {
    const { container } = render(
      <ToastProvider>
        <AuthProvider>
          <MemoryRouter>
            <SmartImageStudio />
          </MemoryRouter>
        </AuthProvider>
      </ToastProvider>
    );

    const dropzone = screen.getByText(/Drop your image here/i).closest('div[class*="border"]');
    expect(dropzone?.className).not.toContain('hover:bg-[#f3ede1]');
    expect(dropzone?.className).not.toContain('border-black');
  });

  it('ensures AiImageEnhancerTool dropzone and options sidebar do not use bg-white with white text', () => {
    const { container } = render(
      <ToastProvider>
        <AuthProvider>
          <MemoryRouter>
            <AiImageEnhancerTool />
          </MemoryRouter>
        </AuthProvider>
      </ToastProvider>
    );

    const dropzone = screen.getByText(/Click to upload an image/i).closest('div[class*="border"]');
    expect(dropzone?.className).not.toContain('bg-white');

    const sidebar = screen.getByText(/Enhancement Options/i).closest('div[class*="rounded-3xl"]');
    expect(sidebar?.className).not.toContain('bg-white');
  });
});
