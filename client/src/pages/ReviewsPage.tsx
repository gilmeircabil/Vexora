import React, { useState, useEffect, useCallback } from 'react';
import { Star, PenSquare, Filter, ArrowLeft, AlertCircle } from 'lucide-react';
import { Link } from 'react-router';
import { reviewApi, type ReviewItem, type ReviewDistribution } from '../services/reviewApi.js';
import { ReviewCard } from '../components/reviews/ReviewCard.js';
import { ReviewSubmissionModal } from '../components/reviews/ReviewSubmissionModal.js';

export const ReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [summary, setSummary] = useState<{
    averageRating: number;
    totalApproved: number;
    distribution: ReviewDistribution;
  }>({
    averageRating: 0,
    totalApproved: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
  });

  const [selectedStar, setSelectedStar] = useState<number | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<'newest' | 'highest' | 'lowest'>('newest');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isWriteModalOpen, setIsWriteModalOpen] = useState<boolean>(false);

  const loadReviews = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError('');
      try {
        const res = await reviewApi.listReviews({
          page,
          limit: 12,
          rating: selectedStar,
          sort: sortOrder,
        });
        if (res.success && res.data) {
          setReviews(res.data.reviews);
          setSummary(res.data.summary);
          setPagination(res.data.pagination);
        } else {
          setError(res.error || 'Failed to load reviews.');
        }
      } catch {
        setError('Unable to reach server to load reviews.');
      } finally {
        setLoading(false);
      }
    },
    [selectedStar, sortOrder],
  );

  useEffect(() => {
    document.title = 'Ratings & Reviews — VexoraMods';
    loadReviews(1);
  }, [loadReviews]);

  return (
    <div className="space-y-10 pb-12">
      {/* Open Editorial Header & Rating Breakdown */}
      <div className="border-b-2 border-black pb-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-black uppercase text-black hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsWriteModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FACC15] hover:bg-[#EAB308] border-2 border-black text-xs font-black uppercase tracking-wider text-black shadow-[3px_3px_0px_#000000] cursor-pointer"
          >
            <PenSquare className="w-4 h-4 stroke-[2.5]" />
            <span>Write a Review</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-2">
            <h1 className="text-3xl sm:text-4xl font-black text-black">
              What People Say About VexoraMods
            </h1>
            <p className="text-sm font-semibold text-neutral-700 leading-relaxed">
              Your feedback helps us improve and build better tools for everyone. Every rating and
              review below comes directly from registered VexoraMods members.
            </p>
          </div>

          {/* Open Summary & 5-Star Distribution */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-12 gap-6 items-center lg:border-l-2 lg:border-black/15 lg:pl-8">
            <div className="sm:col-span-5 text-center sm:border-r-2 sm:border-black/15 sm:pr-4 space-y-1.5">
              <div className="text-4xl sm:text-5xl font-black text-black">
                {summary.totalApproved > 0 ? summary.averageRating.toFixed(1) : '0.0'}
              </div>
              <div className="flex items-center justify-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      summary.totalApproved > 0 && star <= Math.round(summary.averageRating)
                        ? 'text-amber-500 fill-amber-400'
                        : 'text-neutral-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs font-mono font-bold text-neutral-600">
                {summary.totalApproved}{' '}
                {summary.totalApproved === 1 ? 'approved review' : 'approved reviews'}
              </p>
            </div>

            <div className="sm:col-span-7 space-y-1.5">
              {([5, 4, 3, 2, 1] as const).map((star) => {
                const count = summary.distribution[star] || 0;
                const pct =
                  summary.totalApproved > 0 ? Math.round((count / summary.totalApproved) * 100) : 0;
                return (
                  <div
                    key={star}
                    className="flex items-center gap-2.5 text-xs font-mono font-bold text-black"
                  >
                    <span className="w-10 shrink-0 flex items-center gap-1">
                      <span>{star}</span>
                      <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-black/10 overflow-hidden">
                      <div
                        className="h-full bg-black transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-neutral-600">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Sort Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b-2 border-black/15">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 text-xs font-mono font-black uppercase text-black mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </span>
          <button
            type="button"
            onClick={() => setSelectedStar(undefined)}
            className={`px-3 py-1 rounded-xl text-xs font-black border-2 transition-all cursor-pointer ${
              selectedStar === undefined
                ? 'bg-[#FACC15] border-black text-black shadow-[2px_2px_0px_#000000]'
                : 'bg-[#FAF7F2] border-black/30 text-neutral-700 hover:border-black'
            }`}
          >
            All Ratings
          </button>
          {[5, 4, 3, 2, 1].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setSelectedStar(star)}
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-black border-2 transition-all cursor-pointer ${
                selectedStar === star
                  ? 'bg-[#FACC15] border-black text-black shadow-[2px_2px_0px_#000000]'
                  : 'bg-[#FAF7F2] border-black/30 text-neutral-700 hover:border-black'
              }`}
            >
              <span>{star}</span>
              <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <label
            htmlFor="reviews-sort-select"
            className="text-xs font-mono font-black uppercase text-black"
          >
            Sort:
          </label>
          <select
            id="reviews-sort-select"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'newest' | 'highest' | 'lowest')}
            className="px-3 py-1.5 rounded-xl bg-[#FAF7F2] border-2 border-black text-xs font-black text-black focus:outline-none"
          >
            <option value="newest">Most Recent</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
          </select>
        </div>
      </div>

      {/* Reviews Grid / Loading / Error / Empty States */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="h-44 rounded-2xl bg-white border-2 border-black p-5 animate-pulse shadow-[4px_4px_0px_#000000]"
            />
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border-2 border-black rounded-2xl p-6 text-center space-y-2 shadow-[4px_4px_0px_#000000]">
          <AlertCircle className="w-6 h-6 text-red-600 mx-auto" />
          <p className="text-sm font-black text-black">{error}</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white border-2 border-black rounded-2xl p-10 text-center space-y-4 shadow-[4px_4px_0px_#000000]">
          <p className="text-lg font-black text-black">Be the first to review VexoraMods.</p>
          <p className="text-xs font-semibold text-neutral-600 max-w-md mx-auto">
            Share your thoughts on our tools, Studio design editor, or Learning Hub to help guide
            future improvements.
          </p>
          <button
            type="button"
            onClick={() => setIsWriteModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FACC15] hover:bg-[#EAB308] border-2 border-black text-xs font-black uppercase text-black shadow-[3px_3px_0px_#000000] cursor-pointer"
          >
            <PenSquare className="w-4 h-4" />
            <span>Write a Review</span>
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((rev) => (
              <ReviewCard key={rev._id} review={rev} />
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => loadReviews(pagination.page - 1)}
                className="px-4 py-2 rounded-xl bg-white border-2 border-black text-xs font-black uppercase disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>
              <span className="text-xs font-mono font-black text-black">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => loadReviews(pagination.page + 1)}
                className="px-4 py-2 rounded-xl bg-white border-2 border-black text-xs font-black uppercase disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      <ReviewSubmissionModal
        isOpen={isWriteModalOpen}
        onClose={() => setIsWriteModalOpen(false)}
        onSubmitted={() => {
          loadReviews(1);
        }}
      />
    </div>
  );
};
