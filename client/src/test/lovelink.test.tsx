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
import { LoveLinkStudioPage } from '../pages/lovelink/LoveLinkStudioPage.js';
import { AppLayout } from '../components/layout/AppLayout.js';
import { MaintenanceProvider } from '../context/MaintenanceContext.js';
import { loveLinkApi, type PublicLetter } from '../services/loveLinkService.js';

describe('VexoraMods LoveLink Frontend Experience Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. LetterPaper Component', () => {
    it('renders recipient name, message, title, and sender name properly', () => {
      render(
        <LetterPaper
          recipientName="Someone Special"
          senderName="Alex"
          title="To The One I Adore"
          message="Every day with you is a gift."
          template="classic"
        />,
      );

      expect(screen.getByText(/Dearest Someone Special,/i)).toBeInTheDocument();
      expect(screen.getByText(/"To The One I Adore"/i)).toBeInTheDocument();
      expect(screen.getByText(/Every day with you is a gift./i)).toBeInTheDocument();
      expect(screen.getByText(/Alex/i)).toBeInTheDocument();
    });

    it('displays "Your Secret Admirer" when isAnonymous is true', () => {
      render(
        <LetterPaper
          recipientName="Someone Special"
          senderName="Alex"
          isAnonymous={true}
          message="A mystery note..."
          template="secret"
        />,
      );

      expect(screen.getByText(/Your Secret Admirer/i)).toBeInTheDocument();
      expect(screen.queryByText(/Alex/i)).not.toBeInTheDocument();
    });

    it('renders custom salutation, sign-off, paper layout, and polaroid photo style', () => {
      const { container } = render(
        <LetterPaper
          recipientName="Someone Special"
          senderName="Alex"
          message="Under the stars."
          customization={{
            salutation: 'My Sweetheart',
            signOff: 'Forever & Always,',
            paperLayout: 'midnight-velvet',
            photoStyle: 'polaroid',
            waxSeal: 'crown',
          }}
          attachments={['https://example.com/photo1.jpg']}
        />,
      );

      expect(screen.getByText(/My Sweetheart Someone Special,/i)).toBeInTheDocument();
      expect(screen.getByText(/Forever & Always,/i)).toBeInTheDocument();
      expect(container.querySelector('[data-paper-layout="midnight-velvet"]')).toBeInTheDocument();
      expect(container.querySelector('[data-photo-style="polaroid"]')).toBeInTheDocument();
    });
  });

  describe('2. EnvelopeExperience Component (Opening Animation & Reveal)', () => {
    const mockLetter: PublicLetter = {
      publicToken: 'test-token-123',
      recipientName: 'Someone Special',
      senderName: 'Alex',
      message: 'My sweetest love letter to you.',
      template: 'valentines',
      customization: { musicPreset: 'none' },
    };

    it('renders sealed envelope initially with Open Your Letter action', () => {
      render(<EnvelopeExperience letter={mockLetter} />);

      expect(screen.getByText(/A Letter for Someone Special/i)).toBeInTheDocument();
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

    it('allows recipient to send a reaction/reply and replay envelope after opening', async () => {
      vi.useFakeTimers();
      const reactSpy = vi.spyOn(loveLinkApi, 'submitReaction').mockResolvedValueOnce({
        success: true,
        recipientReaction: 'love',
        recipientReply: 'I love this!',
      });

      render(<EnvelopeExperience letter={mockLetter} />);
      fireEvent.click(screen.getByRole('button', { name: /Open Your Letter/i }));
      act(() => {
        vi.advanceTimersByTime(800);
      });
      vi.useRealTimers();

      // Select a reaction and submit reply
      const loveBtn = screen.getByRole('button', { name: /Loved It/i });
      fireEvent.click(loveBtn);

      const replyInput = screen.getByPlaceholderText(/Write a sweet note back/i);
      fireEvent.change(replyInput, { target: { value: 'I love this!' } });

      const sendBtn = screen.getByRole('button', { name: /Send Response/i });
      fireEvent.click(sendBtn);

      await waitFor(() => {
        expect(reactSpy).toHaveBeenCalledWith('test-token-123', {
          reaction: 'love',
          reply: 'I love this!',
        });
      });

      // Can replay the envelope
      const replayBtn = screen.getByRole('button', { name: /Seal & Replay/i });
      fireEvent.click(replayBtn);
      expect(screen.getByRole('button', { name: /Open Your Letter/i })).toBeInTheDocument();
    });
  });

  describe('5. Studio Custom Letter Designs & Custom Music Controls', () => {
    it('renders paper layout choices, custom music link/upload options, and envelope preview toggle', () => {
      render(
        <ToastProvider>
          <AuthProvider>
            <MemoryRouter initialEntries={['/lovelink/create']}>
              <LoveLinkStudioPage />
            </MemoryRouter>
          </AuthProvider>
        </ToastProvider>,
      );

      // Paper layout designs
      expect(screen.getByText(/Midnight Velvet/i)).toBeInTheDocument();
      expect(screen.getByText(/Ornate Vintage/i)).toBeInTheDocument();
      expect(screen.getByText(/Lined Notebook/i)).toBeInTheDocument();

      // Custom music option
      const musicSelect = screen.getByLabelText(/Ambient Music Preset/i);
      fireEvent.change(musicSelect, { target: { value: 'custom' } });
      expect(
        screen.getByPlaceholderText(/Spotify, YouTube, or direct audio URL/i),
      ).toBeInTheDocument();
      expect(screen.queryByText(/Valerie/i)).not.toBeInTheDocument();

      // Studio header is anchored at top-0 (no top-16 gap)
      const studioHeader = screen.getByTestId('lovelink-studio-header');
      expect(studioHeader.className).toContain('top-0');
      expect(studioHeader.className).not.toContain('top-16');
    });

    it('renders falling flower petals and ambient aurora background animation around the opened letter', () => {
      vi.useFakeTimers();
      const letterWithFlowers: PublicLetter = {
        publicToken: 'flower-token',
        recipientName: 'Someone Special',
        senderName: 'Yours Truly',
        message: 'Petals falling all around us.',
        template: 'valentines',
        customization: { particleEffect: 'petals', musicPreset: 'none' },
      };

      const { container } = render(<EnvelopeExperience letter={letterWithFlowers} />);
      fireEvent.click(screen.getByRole('button', { name: /Open Your Letter/i }));
      act(() => {
        vi.advanceTimersByTime(800);
      });
      vi.useRealTimers();

      const backdrop = container.querySelector('[data-particle-effect="petals"]');
      expect(backdrop).toBeInTheDocument();
      expect(container.querySelector('[data-ambient-aurora="true"]')).toBeInTheDocument();
      expect(container.querySelectorAll('.lovelink-falling-particle').length).toBeGreaterThanOrEqual(24);
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

    it('renders LoveLink as full-screen full-bleed layout without global footer', () => {
      const { container } = render(
        <AuthProvider>
          <MaintenanceProvider>
            <MemoryRouter initialEntries={['/lovelink']}>
              <Routes>
                <Route element={<AppLayout />}>
                  <Route path="/lovelink" element={<LoveLinkLandingPage />} />
                </Route>
              </Routes>
            </MemoryRouter>
          </MaintenanceProvider>
        </AuthProvider>,
      );

      const main = container.querySelector('main#main-content');
      expect(main?.className).toContain('w-full p-0');
      expect(main?.className).not.toContain('max-w-7xl');
      expect(container.querySelector('footer')).not.toBeInTheDocument();
    });
  });

  describe('4. Public Recipient Experience Guards', () => {
    it('prompts password unlock when letter is locked and unlocks upon correct password', async () => {
      const lockedLetter: PublicLetter = {
        publicToken: 'pw-token',
        recipientName: 'Someone Special',
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
        expect(screen.getByText(/Secret Letter for Someone Special/i)).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/Secret code/i);
      const unlockBtn = screen.getByRole('button', { name: /Unlock Letter/i });

      fireEvent.change(input, { target: { value: 'SecretKey' } });
      fireEvent.click(unlockBtn);

      await waitFor(() => {
        expect(screen.getByText(/A Letter for Someone Special/i)).toBeInTheDocument();
      });
    });

    it('displays scheduled surprise date if scheduledRevealAt is in the future', async () => {
      const futureDate = new Date(Date.now() + 86400000).toISOString();
      const scheduledLetter: PublicLetter = {
        publicToken: 'sched-token',
        recipientName: 'Someone Special',
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
        expect(screen.getByText(/A Surprise Awaits, Someone Special!/i)).toBeInTheDocument();
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
