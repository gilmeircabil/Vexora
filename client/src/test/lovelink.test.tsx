import React, { act } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter, Route, Routes } from 'react-router';
import { ToastProvider } from '../context/ToastContext.js';
import { AuthProvider } from '../context/AuthContext.js';
import { LetterPaper } from '../components/lovelink/LetterPaper.js';
import { EnvelopeExperience } from '../components/lovelink/EnvelopeExperience.js';
import { LoveLinkLandingPage } from '../pages/lovelink/LoveLinkLandingPage.js';
import { LoveLinkRecipientPage } from '../pages/lovelink/LoveLinkRecipientPage.js';
import { loveLinkApi, type PublicLetter } from '../services/loveLinkService.js';

describe('VexoraMods LoveLink Frontend Experience Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. LetterPaper Component', () => {
    it('renders recipient name, message, title, and sender name properly', () => {
      render(
        <LetterPaper
          recipientName="Valerie"
          senderName="Alex"
          title="To The One I Adore"
          message="Every day with you is a gift."
          template="classic"
        />,
      );

      expect(screen.getByText(/Dearest Valerie,/i)).toBeInTheDocument();
      expect(screen.getByText(/"To The One I Adore"/i)).toBeInTheDocument();
      expect(screen.getByText(/Every day with you is a gift./i)).toBeInTheDocument();
      expect(screen.getByText(/Alex/i)).toBeInTheDocument();
    });

    it('displays "Your Secret Admirer" when isAnonymous is true', () => {
      render(
        <LetterPaper
          recipientName="Valerie"
          senderName="Alex"
          isAnonymous={true}
          message="A mystery note..."
          template="secret"
        />,
      );

      expect(screen.getByText(/Your Secret Admirer/i)).toBeInTheDocument();
      expect(screen.queryByText(/Alex/i)).not.toBeInTheDocument();
    });
  });

  describe('2. EnvelopeExperience Component (Opening Animation & Reveal)', () => {
    const mockLetter: PublicLetter = {
      publicToken: 'test-token-123',
      recipientName: 'Valerie',
      senderName: 'Alex',
      message: 'My sweetest love letter to you.',
      template: 'valentines',
      customization: { musicPreset: 'none' },
    };

    it('renders sealed envelope initially with Open Your Letter action', () => {
      render(<EnvelopeExperience letter={mockLetter} />);

      expect(screen.getByText(/A Letter for Valerie/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Open Your Letter/i })).toBeInTheDocument();
      // Message should not be visible before opening
      expect(screen.queryByText(/My sweetest love letter to you/i)).not.toBeInTheDocument();
    });

    it('transitions to open letter when Open Your Letter is clicked', async () => {
      vi.useFakeTimers();
      const onOpenMock = vi.fn();

      render(<EnvelopeExperience letter={mockLetter} onOpen={onOpenMock} />);

      const openBtn = screen.getByRole('button', { name: /Open Your Letter/i });
      fireEvent.click(openBtn);

      // Fast forward past the envelope opening animation delay (700ms)
      act(() => {
        vi.advanceTimersByTime(800);
      });

      expect(screen.getByText(/My sweetest love letter to you./i)).toBeInTheDocument();
      expect(onOpenMock).toHaveBeenCalled();
      vi.useRealTimers();
    });
  });

  describe('3. LoveLink Landing Page', () => {
    it('renders headline, call-to-actions, and all 8 romantic template cards', () => {
      render(
        <AuthProvider>
          <MemoryRouter>
            <LoveLinkLandingPage />
          </MemoryRouter>
        </AuthProvider>,
      );

      expect(
        screen.getByText(/Every message deserves a/i),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: /Create Your Letter/i }),
      ).toBeInTheDocument();
      expect(screen.getByText(/Classic Love Letter/i)).toBeInTheDocument();
      expect(screen.getByText(/Valentine's Day/i)).toBeInTheDocument();
      expect(screen.getByText(/Cute and Playful/i)).toBeInTheDocument();
      expect(screen.getByText(/Minimalist/i)).toBeInTheDocument();
      expect(screen.getByText(/Secret Admirer/i)).toBeInTheDocument();
      expect(screen.getByText(/Anniversary/i)).toBeInTheDocument();
      expect(screen.getByText(/Friendship Letter/i)).toBeInTheDocument();
      expect(screen.getByText(/Appreciation Letter/i)).toBeInTheDocument();
    });
  });

  describe('4. Public Recipient Experience Guards', () => {
    it('prompts password unlock when letter is locked and unlocks upon correct password', async () => {
      const lockedLetter: PublicLetter = {
        publicToken: 'pw-token',
        recipientName: 'Valerie',
        senderName: 'Alex',
        template: 'classic',
        customization: {},
        isPasswordProtected: true,
        isLocked: true,
      };

      const unlockedLetter: PublicLetter = {
        ...lockedLetter,
        message: 'Unlocked secret message!',
        isLocked: false,
      };

      vi.spyOn(loveLinkApi, 'getPublicLetter').mockResolvedValueOnce(lockedLetter);
      vi.spyOn(loveLinkApi, 'verifyPassword').mockResolvedValueOnce(unlockedLetter);

      render(
        <MemoryRouter initialEntries={['/lovelink/open/pw-token']}>
          <Routes>
            <Route path="/lovelink/open/:token" element={<LoveLinkRecipientPage />} />
          </Routes>
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText(/Secret Letter for Valerie/i)).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/Secret code/i);
      const unlockBtn = screen.getByRole('button', { name: /Unlock Letter/i });

      fireEvent.change(input, { target: { value: 'SecretKey' } });
      fireEvent.click(unlockBtn);

      await waitFor(() => {
        expect(screen.getByText(/A Letter for Valerie/i)).toBeInTheDocument();
      });
    });

    it('displays scheduled surprise date if scheduledRevealAt is in the future', async () => {
      const futureDate = new Date(Date.now() + 86400000).toISOString();
      const scheduledLetter: PublicLetter = {
        publicToken: 'sched-token',
        recipientName: 'Valerie',
        senderName: 'Alex',
        template: 'classic',
        customization: {},
        isScheduled: true,
        scheduledRevealAt: futureDate,
      };

      vi.spyOn(loveLinkApi, 'getPublicLetter').mockResolvedValueOnce(scheduledLetter);

      render(
        <MemoryRouter initialEntries={['/lovelink/open/sched-token']}>
          <Routes>
            <Route path="/lovelink/open/:token" element={<LoveLinkRecipientPage />} />
          </Routes>
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText(/A Surprise Awaits, Valerie!/i)).toBeInTheDocument();
      });
    });

    it('displays expired notice when letter has expired', async () => {
      vi.spyOn(loveLinkApi, 'getPublicLetter').mockRejectedValueOnce(new Error('EXPIRED'));

      render(
        <MemoryRouter initialEntries={['/lovelink/open/expired-token']}>
          <Routes>
            <Route path="/lovelink/open/:token" element={<LoveLinkRecipientPage />} />
          </Routes>
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText(/Letter Has Expired/i)).toBeInTheDocument();
      });
    });
  });
});
