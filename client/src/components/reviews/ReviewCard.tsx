import React from 'react';
import { Star } from 'lucide-react';
import type { ReviewItem } from '../../services/reviewApi.js';

interface ReviewCardProps {
  review: ReviewItem;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  const initials = (review.userName || 'V')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const formattedDate = new Date(review.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <article className="bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4 h-full text-[var(--theme-dirty-white)]">
      <div className="space-y-3">
        {/* Top Row: User Profile Image, Display Name, Date, and Star Rating */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {review.userAvatar ? (
              <img
                src={review.userAvatar}
                alt={review.userName}
                className="w-10 h-10 rounded-xl border border-[var(--theme-gray-border)] object-cover shrink-0 bg-[var(--theme-canvas)]"
              />
            ) : (
              <div
                aria-hidden="true"
                className="w-10 h-10 rounded-xl bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] flex items-center justify-center font-bold text-xs text-[var(--theme-dirty-white)] shrink-0 shadow-xs"
              >
                {initials}
              </div>
            )}

            <div className="min-w-0">
              <h3 className="font-bold text-sm text-[var(--theme-dirty-white)] truncate">{review.userName}</h3>
              <time
                dateTime={review.createdAt}
                className="block text-[11px] font-mono font-medium text-[var(--theme-gray-muted)]"
              >
                {formattedDate}
              </time>
            </div>
          </div>

          <div
            className="flex items-center gap-0.5 bg-slate-900/80 border border-slate-800 px-2 py-1 rounded-lg shrink-0"
            aria-label={`Rated ${review.rating} out of 5 stars`}
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-3.5 h-3.5 ${
                  star <= review.rating ? 'text-amber-500 fill-amber-400' : 'text-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Review Comment */}
        <p className="text-xs sm:text-sm font-normal text-slate-300 leading-relaxed break-words">
          &ldquo;{review.comment}&rdquo;
        </p>
      </div>
    </article>
  );
};
