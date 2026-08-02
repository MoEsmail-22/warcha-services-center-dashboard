import { useMemo, useState } from 'react';
import { MessageSquareText } from 'lucide-react';
import { useReviews } from '@/contexts';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { Button, Card, Modal } from '@/components/ui';
import Avatar from '@/components/ui/Avatar';
import RatingStars from '@/components/widgets/RatingStars';
import EmptyState from '@/components/widgets/EmptyState';
import Pagination from '@/components/widgets/Pagination';

const AVATAR_COLORS = ['#C8730A', '#E08B2F', '#B45F14', '#8A8074', '#A89A8A', '#7D7166'];
const REVIEWS_PAGE_SIZE = 3;

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function getRelativeTime(date, t) {
  const days = Math.max(
    0,
    Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24))
  );

  if (days === 0) return t('time.today');
  if (days === 1) return t('time.oneDayAgo');

  return t('time.daysAgo', { count: days });
}

export default function ReviewsPage() {
  const { t } = useAppTranslation('reviews');
  const { data: reviews, loading, replyReview } = useReviews();

  const [selectedReview, setSelectedReview] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const averageRating = useMemo(() => {
    if (!reviews.length) return 0;

    return reviews.reduce((total, review) => total + review.rating, 0) / reviews.length;
  }, [reviews]);

  const ratingBreakdown = useMemo(
    () =>
      [5, 4, 3, 2, 1].map((rating) => ({
        rating,
        count: reviews.filter((review) => review.rating === rating).length,
      })),
    [reviews]
  );

  const largestRatingCount = Math.max(...ratingBreakdown.map((item) => item.count), 1);
  const totalPages = Math.max(1, Math.ceil(reviews.length / REVIEWS_PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedReviews = reviews.slice(
    (safePage - 1) * REVIEWS_PAGE_SIZE,
    safePage * REVIEWS_PAGE_SIZE
  );

  const openReplyModal = (review) => {
    setSelectedReview(review);
    setReplyText(review.reply || '');
  };

  const closeReplyModal = () => {
    setSelectedReview(null);
    setReplyText('');
  };

  const handleReplySubmit = (event) => {
    event.preventDefault();

    if (!selectedReview || !replyText.trim()) return;

    replyReview(selectedReview.id, replyText.trim());
    closeReplyModal();
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-5">
        <h1
          className="text-2xl font-bold text-[#15201F]"
          style={{ fontFamily: "'Sora', sans-serif" }}
        >
          {t('title')}
        </h1>

        <p className="mt-1 text-sm text-[#5A6968]">
          {t('summary', {
            rating: averageRating.toFixed(1),
            count: reviews.length,
          })}
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,1fr)]">
        <Card padded={false} className="overflow-hidden">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-base font-semibold text-[#15201F]">{t('recentReviews')}</h2>
          </div>

          {loading ? (
            <div className="px-5 py-12 text-center text-sm text-gray-500">{t('loading')}</div>
          ) : reviews.length === 0 ? (
            <EmptyState
              icon={<MessageSquareText size={24} />}
              title={t('empty.title')}
              description={t('empty.description')}
            />
          ) : (
            <div className="divide-y divide-gray-100">
              {paginatedReviews.map((review, index) => {
                const customerName = review.customerId
                  ? `Customer ${review.customerId.replace('C-', '#')}`
                  : t('unknownCustomer');
                const initials = getInitials(customerName);

                return (
                  <article key={review.id} className="px-5 py-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar
                          initials={initials}
                          name={customerName}
                          color={AVATAR_COLORS[index % AVATAR_COLORS.length]}
                        />
                        <p className="truncate text-sm font-semibold text-[#15201F]">
                          {customerName}
                        </p>
                      </div>

                      <RatingStars rating={review.rating} size="sm" />
                    </div>

                    <p className="mt-3 text-sm leading-6 text-[#5A6968]">{review.comment}</p>

                    {review.reply && (
                      <div className="mt-3 rounded-lg bg-teal-50 px-3 py-2 text-sm text-[#0E5C5B]">
                        <span className="font-semibold">{t('yourReply')}:</span> {review.reply}
                      </div>
                    )}

                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        {getRelativeTime(review.createdAt, t)}
                      </span>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto px-0 py-0 text-[#0E5C5B] hover:bg-transparent hover:text-[#084746]"
                        onClick={() => openReplyModal(review)}
                      >
                        {review.reply ? t('editReply') : t('reply')}
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {!loading && reviews.length > REVIEWS_PAGE_SIZE && (
            <Pagination
              currentPage={safePage}
              totalItems={reviews.length}
              pageSize={REVIEWS_PAGE_SIZE}
              onPageChange={setCurrentPage}
              labels={{
                showing: t('showing', { defaultValue: 'Showing' }),
                of: t('of', { defaultValue: 'of' }),
                previous: t('previousPage', { defaultValue: 'Previous page' }),
                next: t('nextPage', { defaultValue: 'Next page' }),
              }}
            />
          )}
        </Card>

        <Card padded={false} className="h-fit overflow-hidden">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-base font-semibold text-[#15201F]">{t('ratingBreakdown')}</h2>
          </div>

          <div className="space-y-3 px-5 py-5">
            {ratingBreakdown.map(({ rating, count }) => (
              <div key={rating} className="grid grid-cols-[16px_1fr_24px] items-center gap-3">
                <span className="text-xs text-gray-500">{rating}</span>

                <div className="h-2 overflow-hidden rounded-full bg-[#EEF3F2]">
                  <div
                    className="h-full rounded-full bg-[#F2991A]"
                    style={{ width: `${(count / largestRatingCount) * 100}%` }}
                  />
                </div>

                <span className="text-end text-xs text-gray-400">{count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Modal
        open={Boolean(selectedReview)}
        onClose={closeReplyModal}
        title={selectedReview?.reply ? t('modal.editTitle') : t('modal.title')}
        footer={
          <>
            <Button variant="outline" type="button" onClick={closeReplyModal}>
              {t('actions.cancel')}
            </Button>
            <Button type="submit" form="reply-review-form">
              {selectedReview?.reply ? t('actions.update') : t('actions.send')}
            </Button>
          </>
        }
      >
        <form id="reply-review-form" onSubmit={handleReplySubmit}>
          <label htmlFor="review-reply" className="label">
            {t('modal.replyLabel')}
          </label>

          <textarea
            id="review-reply"
            className="input min-h-28 resize-y"
            value={replyText}
            onChange={(event) => setReplyText(event.target.value)}
            placeholder={t('modal.placeholder')}
            required
          />
        </form>
      </Modal>
    </div>
  );
}
