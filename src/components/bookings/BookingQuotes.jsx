/**
 * BookingQuotes — the quotes of one booking, in the booking details drawer.
 *
 * Two sources:
 *   1. booking.pendingQuote — from GET /Workshop/bookings/{id}: the quote waiting
 *      for the customer's answer (shown in full).
 *   2. The workshop's quotes list (QuotesContext, GET /Workshop/quotes) matched by
 *      bookingId — every quote sent for this booking, including answered ones.
 */
import { FileText } from 'lucide-react';
import { useQuotes } from '@/contexts/QuotesContext';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import StatusBadge from '@/components/widgets/StatusBadge';
import { formatQuoteCurrency } from '@/utils/quotes';

export default function BookingQuotes({ booking }) {
  const { t, i18n } = useAppTranslation('bookings');
  const { recentQuotes } = useQuotes();
  const text = (key, defaultValue) => t(`quotes.${key}`, { defaultValue });

  const isArabic = i18n.language?.startsWith('ar');
  const locale = isArabic ? 'ar-EG' : 'en-US';
  const currency = isArabic ? 'ج.م' : 'EGP';
  const money = (amount) => formatQuoteCurrency(amount, locale, currency);

  const pending = booking.pendingQuote ?? null;
  // Every quote sent for this booking; the pending one is shown in full above.
  const history = recentQuotes.filter(
    (quote) =>
      quote.bookingId != null &&
      String(quote.bookingId) === String(booking.id) &&
      !(pending && String(quote.id) === String(pending.id))
  );

  return (
    <section className="mb-6">
      <h3 className="mb-3 text-xs font-bold tracking-wide text-[#5A6968] uppercase">
        {text('title', 'Quotes')}
      </h3>

      {!pending && history.length === 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-dashed border-[#E8E2D8] px-4 py-3">
          <FileText className="h-4 w-4 shrink-0 text-[#8A8074]" aria-hidden="true" />
          <p className="text-sm text-[#5A6968]">
            {text('none', 'No quotes for this booking yet.')}
          </p>
        </div>
      )}

      {/* 1. The quote waiting for the customer (from the booking details) */}
      {pending && (
        <div className="rounded-xl border border-[#CFE2DF] bg-[#F7FBFA] p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-sm font-bold text-[#0E5C5B]">
              {text('pending', 'Waiting for the customer')}
            </p>
            <StatusBadge status={pending.status} />
          </div>

          {pending.lineItems.length > 0 && (
            <ul className="space-y-1.5">
              {pending.lineItems.map((line) => (
                <li key={line.id} className="flex items-start justify-between gap-3 text-sm">
                  <span className="text-[#15201F]">{line.label}</span>
                  <span className="shrink-0 font-semibold text-[#15201F]">
                    {money(line.amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-3 flex items-center justify-between border-t border-[#D9E7E5] pt-2.5">
            <span className="text-sm font-bold text-[#15201F]">{text('total', 'Total')}</span>
            <span className="text-base font-bold text-[#0E5C5B]">{money(pending.amount)}</span>
          </div>

          {pending.note && (
            <p className="mt-2.5 text-xs whitespace-pre-line text-[#5A6968]">{pending.note}</p>
          )}
          {pending.sentAt && <p className="mt-2 text-[11px] text-[#8A8074]">{pending.sentAt}</p>}
        </div>
      )}

      {/* 2. Earlier quotes for this booking (from the quotes list) */}
      {history.length > 0 && (
        <div className={pending ? 'mt-4' : ''}>
          <p className="mb-2 text-xs font-semibold text-[#5A6968]">
            {text('history', 'Earlier quotes')}
          </p>
          <ul className="divide-y divide-gray-100 rounded-xl border border-gray-100">
            {history.map((quote) => (
              <li key={quote.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm text-[#15201F]">{quote.service}</p>
                  {quote.sentAt && <p className="text-[11px] text-[#8A8074]">{quote.sentAt}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-sm font-semibold text-[#15201F]">
                    {money(quote.amount)}
                  </span>
                  <StatusBadge status={quote.status} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
