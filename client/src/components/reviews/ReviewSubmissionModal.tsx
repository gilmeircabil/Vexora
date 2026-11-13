import React, { useState } from 'react';
import { Link } from 'react-router';
import { Star, X, Send, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';
import { reviewApi, type ReviewItem } from '../../services/reviewApi.js';

interface ReviewSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted: (newReview: ReviewItem) => void;
}

const RATING_LABELS: Record<number, string> = {
  1: '1 Star — Needs Improvement',
  2: '2 Stars — Fair',
  3: '3 Stars — Good',
  4: '4 Stars — Great',
  5: '5 Stars — Excellent!',
};

export const ReviewSubmissionModal: React.FC<ReviewSubmissionModalProps> = ({
  isOpen,
  onClose,
  onSubmitted,
}) => {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const activeStar = hoverRating || rating;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast('Please sign in to submit a review.', 'error');
      return;
    }

    if (rating < 1 || rating > 5) {
      toast('Please select a star rating between 1 and 5.', 'error');
      return;
    }

    const trimmedComment = comment.replace(/<[^>]*>?/gm, '').trim();
    if (trimmedComment.length < 3) {
      toast('Please write a review comment of at least 3 characters.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await reviewApi.submitReview({
        rating,
        comment: trimmedComment,
        userAvatar: user?.avatarUrl,
      });

      if (res.success && res.data) {
        toast(res.message || 'Thank you! Your review has been published.', 'success');
        setComment('');
        setRating(5);
        onSubmitted(res.data);
        onClose();
      } else {
        toast(res.error || 'Could not submit your review.', 'error');
      }
    } catch {
      toast('Network error while submitting review.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="write-review-modal-title"
    >
      <div className="bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 relative text-[var(--theme-dirty-white)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-lg bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] text-[10px] font-mono font-bold uppercase text-[var(--theme-dirty-white)] mb-1.5">
              Community Feedback
            </span>
            <h2 id="write-review-modal-title" className="text-xl sm:text-2xl font-extrabold text-[var(--theme-dirty-white)]">
              Write a Review for VexoraMods
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close review form"
            className="p-2 rounded-xl bg-[var(--theme-surface-raised)] hover:bg-[var(--theme-gray-border)] border border-[var(--theme-gray-border)] text-[var(--theme-gray-muted)] hover:text-[var(--theme-dirty-white)] cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>

        {!isAuthenticated ? (
          <div className="bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] rounded-2xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-gray-border)] flex items-center justify-center mx-auto text-[var(--theme-dirty-white)] shadow-xs">
              <Lock className="w-5 h-5 text-[var(--theme-dirty-white)]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[var(--theme-dirty-white)]">Sign In to Share Your Review</h3>
              <p className="text-xs font-normal text-[var(--theme-gray-muted)]">
                To keep reviews authentic and prevent spam, please sign in with your free VexoraMods
                account.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <Link
                to="/login"
                onClick={onClose}
                className="px-5 py-2.5 rounded-full bg-[var(--theme-yellow)] hover:bg-[var(--theme-yellow-hover)] text-xs font-bold uppercase text-[var(--theme-canvas)] border border-[var(--theme-yellow)] shadow-sm"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={onClose}
                className="px-5 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold uppercase text-slate-200 shadow-sm"
              >
                Create Free Account
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between text-xs font-medium text-slate-400 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2">
              <span>Posting publicly as:</span>
              <span className="font-bold text-slate-100">{user?.name}</span>
            </div>

            {/* 1-5 Star Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold uppercase text-slate-300">
                Your Rating *
              </label>
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-2xl p-3.5">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                      className="p-1 rounded-lg hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= activeStar ? 'text-amber-500 fill-amber-400' : 'text-slate-700'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="ml-2 text-xs font-mono font-bold text-slate-300">
                  {RATING_LABELS[activeStar]}
                </span>
              </div>
            </div>

            {/* Review Comment */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="review-comment-input"
                  className="block text-xs font-mono font-bold uppercase text-slate-300"
                >
                  Your Review *
                </label>
                <span className="text-[11px] font-mono text-slate-400">
                  {comment.length}/1500
                </span>
              </div>
              <textarea
                id="review-comment-input"
                rows={4}
                maxLength={1500}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with VexoraMods tools, Studio, or the Learning Hub..."
                required
                className="w-full p-3.5 text-xs sm:text-sm bg-[var(--theme-surface-raised)] border border-[var(--theme-gray-border)] rounded-2xl font-normal text-[var(--theme-dirty-white)] placeholder:[var(--theme-gray-dim)] focus:outline-none focus:border-[var(--theme-dirty-white)]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-full bg-[var(--theme-surface-raised)] hover:bg-[var(--theme-gray-border)] border border-[var(--theme-gray-border)] text-xs font-bold uppercase text-[var(--theme-dirty-white-muted)] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[var(--theme-yellow)] hover:bg-[var(--theme-yellow-hover)] text-xs font-bold uppercase tracking-wider text-[var(--theme-canvas)] shadow-sm cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Submitting...' : 'Submit Review'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
