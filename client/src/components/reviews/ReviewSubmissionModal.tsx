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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="write-review-modal-title"
    >
      <div className="bg-white border-2 border-black rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-[8px_8px_0px_#000000] space-y-5 relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-lg bg-[#FACC15] border border-black text-[10px] font-mono font-black uppercase text-black mb-1.5">
              Community Feedback
            </span>
            <h2 id="write-review-modal-title" className="text-xl sm:text-2xl font-black text-black">
              Write a Review for VexoraMods
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close review form"
            className="p-2 rounded-xl bg-[#FAF7F2] hover:bg-neutral-200 border-2 border-black text-black cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {!isAuthenticated ? (
          <div className="bg-[#FAF7F2] border-2 border-black rounded-2xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FACC15] border-2 border-black flex items-center justify-center mx-auto shadow-[2px_2px_0px_#000000]">
              <Lock className="w-5 h-5 text-black" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-black">Sign In to Share Your Review</h3>
              <p className="text-xs font-semibold text-neutral-600">
                To keep reviews authentic and prevent spam, please sign in with your free VexoraMods
                account.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <Link
                to="/login"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-[#FACC15] hover:bg-[#EAB308] border-2 border-black text-xs font-black uppercase text-black shadow-[3px_3px_0px_#000000]"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-100 border-2 border-black text-xs font-black uppercase text-black shadow-[3px_3px_0px_#000000]"
              >
                Create Free Account
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-neutral-700 bg-[#FAF7F2] border border-black/30 rounded-xl px-3.5 py-2">
              <span>Posting publicly as:</span>
              <span className="font-black text-black">{user?.name}</span>
            </div>

            {/* 1-5 Star Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-mono font-black uppercase text-black">
                Your Rating *
              </label>
              <div className="flex items-center gap-2 bg-[#FAF7F2] border-2 border-black rounded-2xl p-3.5">
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
                          star <= activeStar ? 'text-amber-500 fill-amber-400' : 'text-neutral-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="ml-2 text-xs font-mono font-black text-black">
                  {RATING_LABELS[activeStar]}
                </span>
              </div>
            </div>

            {/* Review Comment */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="review-comment-input"
                  className="block text-xs font-mono font-black uppercase text-black"
                >
                  Your Review *
                </label>
                <span className="text-[11px] font-mono text-neutral-500">
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
                className="w-full p-3.5 text-xs sm:text-sm bg-[#FAF7F2] border-2 border-black rounded-2xl font-semibold text-black focus:outline-none focus:bg-white"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-neutral-100 border-2 border-black text-xs font-black uppercase text-black cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#4ADE80] hover:bg-emerald-400 border-2 border-black text-xs font-black uppercase tracking-wider text-black shadow-[3px_3px_0px_#000000] cursor-pointer disabled:opacity-50"
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
