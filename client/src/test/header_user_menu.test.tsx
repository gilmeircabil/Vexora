import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router';
import { Header } from '../components/layout/Header';

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 'u1',
      name: 'System Administrator',
      username: 'systemadministr',
      email: 'admin@vexoramods.com',
      role: 'admin',
      avatarUrl: '',
    },
    isAuthenticated: true,
    isLoading: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    updateUser: vi.fn(),
  }),
}));

describe('Header User Profile Dropdown Suite', () => {
  it('renders Account Dashboard, Admin Console, Sign Out, and does NOT render LoveLink', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Header />
      </MemoryRouter>
    );

    // Open desktop user menu dropdown
    const avatarButton = screen.getByLabelText('User account menu');
    fireEvent.click(avatarButton);

    expect(screen.getByText('Account Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Admin Console')).toBeInTheDocument();
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
    // LoveLink should NOT be present in the user profile dropdown
    expect(screen.queryByText('My Letters (LoveLink)')).toBeNull();
  });
});
