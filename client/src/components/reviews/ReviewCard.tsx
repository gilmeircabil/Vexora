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
    <article className="bg-white border-2 border-black rounded-2xl p-5 shadow-[4px_4px_0px_#000000] flex flex-col justify-between space-y-4 h-full">
      <div className="space-y-3">
        {/* Top Row: User Profile Image, Display Name, Date, and Star Rating */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {review.userAvatar ? (
              <img
                src={review.userAvatar}
                alt={review.userName}
                className="w-10 h-10 rounded-xl border-2 border-black object-cover shrink-0 bg-[#FAF7F2]"
              />
            ) : (
              <div
                aria-hidden="true"
                className="w-10 h-10 rounded-xl bg-[#FACC15] border-2 border-black flex items-center justify-center font-black text-xs text-black shrink-0 shadow-[2px_2px_0px_#000000]"
              >
                {initials}
              </div>
            )}

            <div className="min-w-0">
              <h3 className="font-black text-sm text-black truncate">{review.userName}</h3>
              <time
                dateTime={review.createdAt}
                className="block text-[11px] font-mono font-bold text-neutral-500"
              >
                {formattedDate}
              </time>
            </div>
          </div>

          <div
            className="flex items-center gap-0.5 bg-[#FAF7F2] border border-black px-2 py-1 rounded-lg shrink-0"
            aria-label={`Rated ${review.rating} out of 5 stars`}
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-3.5 h-3.5 ${
                  star <= review.rating ? 'text-amber-500 fill-amber-400' : 'text-neutral-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Review Comment */}
        <p className="text-xs sm:text-sm font-semibold text-neutral-700 leading-relaxed break-words">
          &ldquo;{review.comment}&rdquo;
        </p>
      </div>
    </article>
  );
};
