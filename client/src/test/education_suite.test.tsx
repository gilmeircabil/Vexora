import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { AuthProvider } from '../context/AuthContext.js';
import { ToastProvider } from '../context/ToastContext.js';
import { StudySpacePage } from '../pages/education/StudySpacePage.js';
import { StudySpaceHeader } from '../features/education/shared/StudySpaceHeader.js';
import { generateCertificatePdf } from '../features/education/shared/PdfExportHelper.js';
import { educationAudio } from '../features/education/shared/EducationAudio.js';

describe('VexoraMods Zero-Cost Education Suite Tests', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(async (url: string) => {
        if (typeof url === 'string' && url.includes('/api/auth/me')) {
          return {
            ok: true,
            json: async () => ({
              success: true,
              data: {
                id: 'student-123',
                email: 'student@example.com',
                username: 'Jane Student',
                role: 'user',
                educationRole: 'student',
              },
            }),
          };
        }
        if (typeof url === 'string' && url.includes('/api/education')) {
          return {
            ok: true,
            json: async () => ({
              success: true,
              data: [],
            }),
          };
        }
        return {
          ok: true,
          json: async () => ({ success: true, data: {} }),
        };
      }),
    );
  });

  describe('1. Client-Side PDF Certificate Generation (Zero-Cost)', () => {
    it('generates a valid binary PDF document without network or cloud APIs', async () => {
      const pdfBytes = await generateCertificatePdf({
        recipientName: 'Jane Doe',
        courseTitle: 'Full-Stack Web Development',
        achievementDescription: 'Successfully passed with Honors',
        date: '2026-11-01',
        instructorName: 'Prof. Ada Lovelace',
        institutionName: 'Open Academy',
        templateStyle: 'excellence',
      });

      expect(pdfBytes).toBeInstanceOf(Uint8Array);
      expect(pdfBytes.length).toBeGreaterThan(1000);

      // Verify PDF file signature (%PDF-)
      const pdfHeader = String.fromCharCode(...pdfBytes.slice(0, 5));
      expect(pdfHeader).toBe('%PDF-');
    });
  });

  describe('2. Web Audio API Zero-Cost Alerts', () => {
    it('plays tones and chime sequences safely without external audio asset downloads', () => {
      // Mock AudioContext
      const mockOscillator = {
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        frequency: { setValueAtTime: vi.fn() },
        type: 'sine',
      };
      const mockGain = {
        connect: vi.fn(),
        gain: {
          setValueAtTime: vi.fn(),
          linearRampToValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
        },
      };

      const mockAudioCtx = {
        state: 'running',
        currentTime: 0,
        destination: {},
        createOscillator: vi.fn().mockReturnValue(mockOscillator),
        createGain: vi.fn().mockReturnValue(mockGain),
        resume: vi.fn().mockResolvedValue(undefined),
      };

      vi.stubGlobal(
        'AudioContext',
        vi.fn().mockImplementation(() => mockAudioCtx),
      );

      expect(() => educationAudio.playBeep()).not.toThrow();
      expect(() => educationAudio.playChime()).not.toThrow();
    });
  });

  describe('3. Timetable Overlap & Conflict Detection', () => {
    interface TimetableSlot {
      day: string;
      startTime: string;
      endTime: string;
      subject: string;
    }

    const detectOverlaps = (entries: TimetableSlot[]): string[] => {
      const overlaps: string[] = [];
      for (let i = 0; i < entries.length; i++) {
        for (let j = i + 1; j < entries.length; j++) {
          const a = entries[i];
          const b = entries[j];
          if (!a || !b) continue;
          if (a.day === b.day) {
            if (a.startTime < b.endTime && a.endTime > b.startTime) {
              overlaps.push(`Conflict on ${a.day}: "${a.subject}" overlaps with "${b.subject}"`);
            }
          }
        }
      }
      return overlaps;
    };

    it('detects time conflicts on the same day', () => {
      const schedule: TimetableSlot[] = [
        { day: 'Monday', startTime: '09:00', endTime: '10:30', subject: 'Math' },
        { day: 'Monday', startTime: '10:00', endTime: '11:00', subject: 'Physics' },
      ];
      const conflicts = detectOverlaps(schedule);
      expect(conflicts.length).toBe(1);
      expect(conflicts[0]).toContain('Math');
      expect(conflicts[0]).toContain('Physics');
    });

    it('ignores adjacent back-to-back classes without overlap', () => {
      const schedule: TimetableSlot[] = [
        { day: 'Monday', startTime: '09:00', endTime: '10:00', subject: 'Math' },
        { day: 'Monday', startTime: '10:00', endTime: '11:00', subject: 'Physics' },
      ];
      const conflicts = detectOverlaps(schedule);
      expect(conflicts.length).toBe(0);
    });

    it('ignores overlapping times occurring on different days', () => {
      const schedule: TimetableSlot[] = [
        { day: 'Monday', startTime: '09:00', endTime: '10:30', subject: 'Math' },
        { day: 'Tuesday', startTime: '09:00', endTime: '10:30', subject: 'Physics' },
      ];
      const conflicts = detectOverlaps(schedule);
      expect(conflicts.length).toBe(0);
    });
  });

  describe('4. Grade & GPA Weighted Calculation Engine', () => {
    it('calculates weighted subject percentage accurately', () => {
      const assessments = [
        { score: 90, maxScore: 100, weight: 40 }, // 36%
        { score: 80, maxScore: 100, weight: 60 }, // 48%
      ];
      const totalWeight = assessments.reduce((sum, a) => sum + a.weight, 0);
      const earned = assessments.reduce((sum, a) => sum + (a.score / a.maxScore) * a.weight, 0);
      const finalPercent = (earned / totalWeight) * 100;
      expect(finalPercent).toBe(84);
    });

    it('calculates required final exam score accurately', () => {
      // Current grade: 85% on 70% of course; Target: 90%; Remaining: 30%
      const currentScore = 85;
      const completedWeight = 70;
      const targetGrade = 90;
      const remainingWeight = 100 - completedWeight; // 30%

      const needed =
        (targetGrade - (currentScore * completedWeight) / 100) / (remainingWeight / 100);
      expect(Math.round(needed * 10) / 10).toBe(101.7);
    });

    it('maps grades to configurable GPA scales (Standard 4.0, Honors 4.3, AP 5.0)', () => {
      const getGpaPoints = (score: number, scale: '4.0' | '4.3' | '5.0'): number => {
        if (scale === '5.0') {
          if (score >= 90) return 5.0;
          if (score >= 80) return 4.0;
          if (score >= 70) return 3.0;
          return 0;
        }
        if (scale === '4.3') {
          if (score >= 95) return 4.3;
          if (score >= 90) return 4.0;
          if (score >= 80) return 3.0;
          return 0;
        }
        // Standard 4.0
        if (score >= 90) return 4.0;
        if (score >= 80) return 3.0;
        if (score >= 70) return 2.0;
        if (score >= 60) return 1.0;
        return 0;
      };

      expect(getGpaPoints(92, '4.0')).toBe(4.0);
      expect(getGpaPoints(96, '4.3')).toBe(4.3);
      expect(getGpaPoints(92, '5.0')).toBe(5.0);
      expect(getGpaPoints(85, '4.0')).toBe(3.0);
    });
  });

  describe('5. Spaced Repetition (Leitner Box Progression)', () => {
    const advanceLeitnerBox = (currentBox: number, isKnown: boolean): number => {
      if (isKnown) {
        return Math.min(5, currentBox + 1);
      }
      return 1; // Reset on failure
    };

    it('advances box by 1 on success up to maximum box 5', () => {
      expect(advanceLeitnerBox(1, true)).toBe(2);
      expect(advanceLeitnerBox(2, true)).toBe(3);
      expect(advanceLeitnerBox(4, true)).toBe(5);
      expect(advanceLeitnerBox(5, true)).toBe(5);
    });

    it('drops card back to Box 1 when forgotten', () => {
      expect(advanceLeitnerBox(4, false)).toBe(1);
      expect(advanceLeitnerBox(2, false)).toBe(1);
    });
  });

  describe('6. Study Space Navigation (Student-Only Workspace)', () => {
    it('renders the Study Space page with Student Workspace navigation tabs and no Teacher Workspace features', async () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <ToastProvider>
              <StudySpacePage />
            </ToastProvider>
          </AuthProvider>
        </BrowserRouter>,
      );

      expect(screen.getAllByText(/Student Workspace/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Study Planner/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Flashcard Maker/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Practice Tests & Quizzes/i).length).toBeGreaterThan(0);

      // Teacher Workspace and teacher tools must not exist
      expect(screen.queryByText(/Teacher Workspace/i)).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /lesson plan creator/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /worksheet generator/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /exam builder/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /attendance tracker/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /gradebook ledger/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /rubric builder/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /certificate generator/i })).not.toBeInTheDocument();
    });

    it('does NOT render the StudySpaceHeader strip inside StudySpacePage', () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <ToastProvider>
              <StudySpacePage />
            </ToastProvider>
          </AuthProvider>
        </BrowserRouter>,
      );

      expect(screen.queryByText('Zero-Cost Education')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Full Screen/i })).not.toBeInTheDocument();
    });

    it('renders StudySpaceHeader with Student Workspace badge and Fullscreen Toggle without Teacher Workspace button', () => {
      const handleToggleSidebar = vi.fn();
      const handleToggleMobileNav = vi.fn();
      const handleToggleFullscreen = vi.fn();

      const { rerender } = render(
        <BrowserRouter>
          <StudySpaceHeader
            activeTab="flashcards"
            isSidebarCollapsed={false}
            onToggleSidebar={handleToggleSidebar}
            onToggleMobileNav={handleToggleMobileNav}
            isFullscreen={false}
            onToggleFullscreen={handleToggleFullscreen}
          />
        </BrowserRouter>,
      );

      expect(screen.getByText(/Student Workspace/i)).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /teacher workspace/i })).not.toBeInTheDocument();
      const fullscreenBtn = screen.getByRole('button', { name: /full screen/i });
      expect(fullscreenBtn).toBeInTheDocument();

      fireEvent.click(fullscreenBtn);
      expect(handleToggleFullscreen).toHaveBeenCalledTimes(1);

      rerender(
        <BrowserRouter>
          <StudySpaceHeader
            activeTab="flashcards"
            isSidebarCollapsed={false}
            onToggleSidebar={handleToggleSidebar}
            onToggleMobileNav={handleToggleMobileNav}
            isFullscreen={true}
            onToggleFullscreen={handleToggleFullscreen}
          />
        </BrowserRouter>,
      );

      expect(screen.getByRole('button', { name: /exit full screen/i })).toBeInTheDocument();
    });
  });
});
