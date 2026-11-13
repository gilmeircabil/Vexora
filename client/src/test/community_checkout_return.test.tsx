import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { CommunityPage } from '../pages/community/CommunityPage.js';
import { AuthProvider } from '../context/AuthContext.js';
import { ToastProvider } from '../context/ToastContext.js';

describe('Community checkout return', () => {
  it('verifies the donation by donation_id and shows the verified amount', async () => {
    let calls = 0;
    const fetchMock = vi.fn(async (url: string) => ({
      ok: true,
      json: async () =>
        url.includes('/api/donations/d1/status')
          ? {
              success: true,
              data: { displayName: 'Ana', amount: 150, currency: 'PHP', paymentStatus: ++calls > 1 ? 'succeeded' : 'pending' },
            }
          : { success: true, data: {} },
    }));
    vi.stubGlobal('fetch', fetchMock);

    render(
      <ToastProvider>
        <AuthProvider>
          <MemoryRouter initialEntries={['/community?status=success&donation_id=d1']}>
            <CommunityPage />
          </MemoryRouter>
        </AuthProvider>
      </ToastProvider>,
    );

    expect(await screen.findByText(/₱150/, {}, { timeout: 5000 })).toBeInTheDocument();
    expect(calls).toBeGreaterThan(1); // polled until succeeded
  });
});
