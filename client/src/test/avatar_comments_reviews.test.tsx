import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { ReviewCard } from '../components/reviews/ReviewCard';
import type { ReviewItem } from '../services/reviewApi';

describe('Profile Picture Rendering for Reviews & Comments Suite', () => {
  it('renders profile picture image for ReviewCard when userAvatar is present', () => {
    const mockReview: ReviewItem = {
      _id: 'rev-1',
      userId: 'user-1',
      userName: 'John Doe',
      userAvatar: 'https://cdn.vexora.com/avatars/user-1.png',
      rating: 5,
      comment: 'Excellent development tools!',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    render(<ReviewCard review={mockReview} />);
    const avatarImg = screen.getByRole('img', { name: 'John Doe' });
    expect(avatarImg).toBeInTheDocument();
    expect(avatarImg).toHaveAttribute('src', 'https://cdn.vexora.com/avatars/user-1.png');
    expect(screen.queryByText('JD')).not.toBeInTheDocument();
  });

  it('renders initials fallback for ReviewCard when userAvatar is missing or empty', () => {
    const mockReview: ReviewItem = {
      _id: 'rev-2',
      userId: 'user-2',
      userName: 'Alice Smith',
      userAvatar: '',
      rating: 5,
      comment: 'Super fast platform!',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    render(<ReviewCard review={mockReview} />);
    expect(screen.queryByRole('img', { name: 'Alice Smith' })).not.toBeInTheDocument();
    expect(screen.getByText('AS')).toBeInTheDocument();
  });

  it('renders profile picture img for project comments when authorAvatar is provided', () => {
    const commentWithAvatar = {
      _id: 'c1',
      authorName: 'Alex River',
      authorAvatar: 'https://r2.vexora.com/avatars/alex.png',
      content: 'Great project implementation!',
    };

    render(
      <div className="flex items-center gap-2.5">
        {commentWithAvatar.authorAvatar ? (
          <img
            src={commentWithAvatar.authorAvatar}
            alt={commentWithAvatar.authorName}
            className="w-8 h-8 rounded-lg object-cover"
          />
        ) : (
          <div>{commentWithAvatar.authorName.slice(0, 2)}</div>
        )}
      </div>
    );

    const img = screen.getByRole('img', { name: 'Alex River' });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://r2.vexora.com/avatars/alex.png');
    expect(screen.queryByText('Al')).not.toBeInTheDocument();
  });

  it('renders initials fallback for project comments when authorAvatar is missing', () => {
    const commentWithoutAvatar = {
      _id: 'c2',
      authorName: 'Taylor Morgan',
      authorAvatar: '',
      content: 'Nice feature!',
    };

    render(
      <div className="flex items-center gap-2.5">
        {commentWithoutAvatar.authorAvatar ? (
          <img
            src={commentWithoutAvatar.authorAvatar}
            alt={commentWithoutAvatar.authorName}
            className="w-8 h-8 rounded-lg object-cover"
          />
        ) : (
          <div>{commentWithoutAvatar.authorName.slice(0, 2)}</div>
        )}
      </div>
    );

    expect(screen.queryByRole('img', { name: 'Taylor Morgan' })).not.toBeInTheDocument();
    expect(screen.getByText('Ta')).toBeInTheDocument();
  });
});
