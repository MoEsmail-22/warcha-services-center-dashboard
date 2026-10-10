import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Send, Search, FilePenLine, Trash2, FileText } from 'lucide-react';
import { EmptyState } from '../components/widgets/EmptyState';
import { useQuotes } from '../contexts/QuotesContext';
import { useBookings } from '../contexts/BookingsContext';
import { useNotify } from '../hooks/useNotify';
import { createLocalError } from '../API/errors';
import { getBooking } from '../API/bookingsApi';
import { normalizeBooking } from '../utils/normalizeBooking';
import { Spinner } from '../components/ui/Spinner';
import { useAppTranslation } from '../hooks/useAppTranslation';
import Avatar from '../components/ui/Avatar';
import { StatusBadge } from '../components/widgets';
import QuoteLineItemRow from '../components/quotes/QuoteLineItemRow';
import { filterQuotes, formatQuoteCurrency } from '../utils/quotes';

export default function QuotesPage() {
  const { t, i18n } = useAppTranslation('quotes');
  const {
    recentQuotes,
    lineItems,
    total,
    addLineItem,
    updateLineItem,
    removeLineItem,
    replaceLineItems,
    sendQuote,
    editWorkflowQuote,
    activeWorkflowQuoteId,
  } = useQuotes();

  const { bookings } = useBookings();
  const notify = useNotify();

  // The booking being quoted lives in the URL (?booking=13), so a booking can link here.
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedBookingId = searchParams.get('booking') ?? '';
  const selectBooking = (bookingId) =>
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        if (bookingId) next.set('booking', bookingId);
        else next.delete('booking');
        return next;
      },
      { replace: true }
    );

  // The backend only accepts quotes for bookings whose job is in progress.
  const quotableBookings = bookings.filter((booking) => booking.jobStatus === 'in_progress');
  const selectedBooking = bookings.find((booking) => String(booking.id) === selectedBookingId);

  // A Jobs board draft brings its own customer/vehicle (it isn't tied to an API booking yet).
  const [draftHeader, setDraftHeader] = useState(null);
  const customerName = draftHeader?.customer ?? selectedBooking?.customer.name ?? '';
  const vehicle = draftHeader?.vehicle ?? selectedBooking?.vehicle ?? '';

  const [search, setSearch] = useState('');
  const [futureRepairs, setFutureRepairs] = useState([]);
  const [sending, setSending] = useState(false);

  // Choosing a booking starts the quote from its services (name + price), which can
  // then be edited, removed or added to. The list may not include services, so the
  // booking's details are loaded (GET /Workshop/bookings/{id}).
  const [loadingServices, setLoadingServices] = useState(false);
  useEffect(() => {
    if (!selectedBookingId || activeWorkflowQuoteId) return undefined;

    let cancelled = false;
    setLoadingServices(true);
    getBooking(selectedBookingId)
      .then((result) => {
        if (cancelled) return;
        const raw = result?.data ?? result;
        const booking = raw && typeof raw === 'object' ? normalizeBooking(raw) : null;
        replaceLineItems(
          (booking?.serviceBreakdown ?? []).map((service, index) => ({
            id: `${selectedBookingId}-${index}`,
            label: service.label,
            amount: Number(service.price) || 0,
          }))
        );
      })
      .catch((err) => {
        if (!cancelled) notify.error(err, 'booking.load');
      })
      .finally(() => {
        if (!cancelled) setLoadingServices(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when another booking is chosen
  }, [selectedBookingId, activeWorkflowQuoteId]);

  const handleSend = async (event) => {
    event.preventDefault();
    if (sending) return;

    if (!activeWorkflowQuoteId && !selectedBooking) {
      notify.error(
        createLocalError('quote.bookingRequired', 'Choose the booking this quote is for.')
      );
      return;
    }
    const hasValidItem = lineItems.some((item) => item.label.trim() && Number(item.amount) > 0);
    if (!hasValidItem) {
      notify.error(
        createLocalError(
          'quote.itemsRequired',
          'Add at least one item with a description and a price.'
        )
      );
      return;
    }

    setSending(true);
    try {
      await sendQuote({
        bookingId: selectedBooking?.id,
        futureRepairs: futureRepairs
          .filter((repair) => repair.description.trim() || repair.remainingKm !== '')
          .map((repair) => ({
            description: repair.description.trim(),
            remainingKm: repair.remainingKm === '' ? null : Number(repair.remainingKm),
          })),
      });
      notify.success('quoteSent');
      setFutureRepairs([]);
      setDraftHeader(null);
      selectBooking('');
    } catch (err) {
      notify.error(err, 'quote.create');
    } finally {
      setSending(false);
    }
  };

  const addFutureRepair = () => {
    setFutureRepairs((previous) => [
      ...previous,
      { id: Date.now(), description: '', remainingKm: '' },
    ]);
  };

  const updateFutureRepair = (id, field, value) => {
    setFutureRepairs((previous) =>
      previous.map((repair) => (repair.id === id ? { ...repair, [field]: value } : repair))
    );
  };

  const removeFutureRepair = (id) => {
    setFutureRepairs((previous) => previous.filter((repair) => repair.id !== id));
  };

  const handleEditDraft = (quote) => {
    const selected = editWorkflowQuote(quote.id);
    if (!selected) return;
    setDraftHeader({ customer: selected.customer.name, vehicle: selected.vehicle });
    setFutureRepairs(
      (selected.futureRepairs ?? []).map((repair, index) => ({
        ...repair,
        id: repair.id ?? `${selected.id}-future-${index}`,
        remainingKm: repair.remainingKm ?? '',
      }))
    );
  };

  // Filter recent quotes by search
  const locale = i18n.language?.startsWith('ar') ? 'ar-EG' : 'en-US';
  const currency = i18n.language?.startsWith('ar') ? 'ج.م' : 'EGP';
  //utitlys
  const filteredQuotes = filterQuotes(recentQuotes, search);
  const activeWorkflowQuote = recentQuotes.find((quote) => quote.id === activeWorkflowQuoteId);

  return (
    <div className="flex h-full flex-col">
      {/* ============ HEADER ============ */}
      <div className="mb-5">
        <h1
          className="text-2xl font-bold text-[#15201F]"
          style={{ fontFamily: "'Sora', sans-serif" }}
        >
          {t('title', { defaultValue: 'Quotes' })}
        </h1>
        <p className="mt-1 text-sm text-[#5A6968]">
          {t('subtitle', {
            defaultValue: 'Send itemized quotes to customers for approval before doing extra work.',
          })}
        </p>
      </div>

      {/* ============ TWO-COLUMN GRID ============ */}
      <div className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-5">
        {/* ---- LEFT: Build a quote ---- */}
        <form
          onSubmit={handleSend}
          className="flex flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-3"
          style={{ borderRadius: '16px' }}
        >
          {/* Header row: customer + vehicle */}
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2
                className="text-lg font-semibold text-[#15201F]"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                {t('buildQuote', { defaultValue: 'Build a quote' })}
                {customerName && <span className="text-[#5A6968]"> — {customerName}</span>}
              </h2>
              {activeWorkflowQuoteId && (
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <p className="text-xs font-semibold text-amber-700">
                    {t('editingDiagnosticDraft')}
                  </p>
                  {activeWorkflowQuote?.bookingId && (
                    <span className="rounded-full bg-[#F2EDE4] px-2 py-0.5 text-xs font-semibold text-[#5A5045]">
                      {t('bookingId')}: #{activeWorkflowQuote.bookingId}
                    </span>
                  )}
                </div>
              )}
              <p className="mt-0.5 text-xs text-[#5A6968]">
                {t('buildQuoteSubtitle', { defaultValue: 'Add line items and send for approval' })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs tracking-wide text-[#5A6968] uppercase">
                {t('vehicle', { defaultValue: 'Vehicle' })}
              </p>
              <p className="mt-0.5 text-sm font-medium text-[#15201F]">{vehicle || '—'}</p>
            </div>
          </div>

          {/* Customer name input (full width) */}
          <div className="mb-4">
            <label
              htmlFor="quote-booking"
              className="mb-1.5 block text-xs font-semibold tracking-wide text-[#5A6968] uppercase"
            >
              {t('booking', { defaultValue: 'Booking' })}
            </label>
            {activeWorkflowQuoteId ? (
              <p className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700">
                {customerName}
              </p>
            ) : (
              <select
                id="quote-booking"
                value={selectedBookingId}
                onChange={(e) => selectBooking(e.target.value)}
                disabled={quotableBookings.length === 0}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-[#0E5C5B] focus:ring-2 focus:ring-[#0E5C5B]/10 focus:outline-none disabled:bg-gray-50 disabled:text-gray-400"
              >
                <option value="">
                  {quotableBookings.length === 0
                    ? t('noBookingsToQuote', { defaultValue: 'No open bookings to quote' })
                    : t('chooseBooking', { defaultValue: 'Choose a booking' })}
                </option>
                {quotableBookings.map((booking) => (
                  <option key={booking.id} value={booking.id}>
                    #{booking.id} — {booking.customer.name} — {booking.vehicle}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Line items list */}
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold tracking-wide text-[#5A6968] uppercase">
              {t('lineItems', { defaultValue: 'Line items' })}
            </p>
            <span className="flex items-center gap-2 text-xs text-[#5A6968]">
              {loadingServices && (
                <>
                  <Spinner size="sm" />
                  {t('loadingServices', { defaultValue: "Loading the booking's services…" })}
                </>
              )}
              {!loadingServices && (
                <>
                  {lineItems.length} {t('items', { defaultValue: 'items' })}
                </>
              )}
            </span>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto">
            {/*custom componat/quots  */}
            {lineItems.map((item) => (
              <QuoteLineItemRow
                key={item.id}
                item={item}
                onChange={updateLineItem}
                onRemove={removeLineItem}
                descriptionPlaceholder={t('itemPlaceholder', {
                  defaultValue: 'Service description',
                })}
              />
            ))}

            {lineItems.length === 0 && (
              <div className="rounded-lg border-2 border-dashed border-gray-200 py-8 text-center text-sm text-gray-400">
                {t('noItems', {
                  defaultValue: 'No line items yet. Click "Add line item" to start.',
                })}
              </div>
            )}
          </div>

          {/* Add line item button */}
          <button
            type="button"
            onClick={addLineItem}
            className="mt-3 inline-flex items-center gap-1.5 self-start rounded-lg border border-dashed border-gray-300 px-3 py-1.5 text-xs font-semibold text-[#5A6968] transition-colors hover:border-[#0E5C5B] hover:text-[#0E5C5B]"
          >
            <Plus className="h-3.5 w-3.5" />
            {t('addLineItem', { defaultValue: 'Add line item' })}
          </button>

          {/* Optional future repairs */}
          <div className="mt-5 rounded-xl border border-[#CFE2DF] bg-[#F7FBFA] p-4">
            <div className="mb-2 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold tracking-wide text-[#0E5C5B] uppercase">
                  {t('futureRepairs', { defaultValue: 'Future repairs or recommendations' })}
                </p>
                <p className="mt-1 text-sm text-[#5A6968]">
                  {t('futureRepairsSubtitle', {
                    defaultValue: 'Optional suggestions to share with the customer.',
                  })}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-[#0E5C5B]">
                {t('optional', { defaultValue: 'Optional' })}
              </span>
            </div>

            <div className="space-y-2">
              {futureRepairs.map((repair) => (
                <div
                  key={repair.id}
                  className="flex items-center gap-2 rounded-lg border border-[#D9E7E5] bg-white p-2.5"
                >
                  <input
                    type="text"
                    value={repair.description}
                    onChange={(event) =>
                      updateFutureRepair(repair.id, 'description', event.target.value)
                    }
                    placeholder={t('futureRepairPlaceholder', {
                      defaultValue: 'Recommended repair or suggestion',
                    })}
                    className="h-10 min-w-0 flex-1 rounded-md border border-gray-200 px-3 text-xs text-gray-900 placeholder:text-gray-400 focus:border-[#0E5C5B] focus:ring-2 focus:ring-[#0E5C5B]/10 focus:outline-none"
                  />
                  <div className="flex h-10 w-44 shrink-0 items-center rounded-md border border-gray-200 focus-within:border-[#0E5C5B] focus-within:ring-2 focus-within:ring-[#0E5C5B]/10">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={repair.remainingKm}
                      onChange={(event) =>
                        updateFutureRepair(repair.id, 'remainingKm', event.target.value)
                      }
                      placeholder={t('remainingKmPlaceholder', { defaultValue: 'Remaining km' })}
                      className="h-full w-full min-w-0 bg-transparent px-3 text-center text-xs text-gray-900 placeholder:text-center placeholder:text-gray-400 focus:outline-none"
                    />
                    <span className="pr-3 text-xs text-gray-400">km</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFutureRepair(repair.id)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                    aria-label={t('removeFutureRepair', { defaultValue: 'Remove suggestion' })}
                    title={t('removeFutureRepair', { defaultValue: 'Remove suggestion' })}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addFutureRepair}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-[#8FB9B4] bg-white px-3.5 py-2 text-sm font-semibold text-[#0E5C5B] transition-colors hover:border-[#0E5C5B] hover:bg-[#EDF7F5]"
            >
              <Plus className="h-3.5 w-3.5" />
              {t('addFutureRepair', { defaultValue: 'Add recommendation' })}
            </button>
          </div>

          {/* Total + Send button */}
          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
            <div>
              <p className="text-xs tracking-wide text-[#5A6968] uppercase">
                {t('total', { defaultValue: 'Total' })}
              </p>
              <p
                className="text-2xl font-bold text-[#15201F]"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                {formatQuoteCurrency(total, locale, currency)}
              </p>
            </div>
            <button
              type="submit"
              disabled={total === 0 || sending}
              className="inline-flex items-center gap-2 rounded-lg px-5 text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                backgroundColor: '#0E5C5B',
                height: '42px',
                fontWeight: 600,
                fontSize: '14px',
              }}
            >
              <Send className="h-4 w-4" />
              {t('sendToCustomer', { defaultValue: 'Send to customer' })}
            </button>
          </div>
        </form>

        {/* ---- RIGHT: Recent quotes ---- */}
        <div
          className="flex h-[30rem] max-h-[70vh] min-h-0 flex-col self-start overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:h-[34rem] lg:col-span-2"
          style={{ borderRadius: '16px' }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2
              className="text-lg font-semibold text-[#15201F]"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              {t('recentQuotes', { defaultValue: 'Recent quotes' })}
            </h2>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">
              {recentQuotes.length}
            </span>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('searchQuotes', { defaultValue: 'Search quotes...' })}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pr-3 pl-9 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#0E5C5B] focus:ring-2 focus:ring-[#0E5C5B]/10 focus:outline-none"
            />
          </div>

          {/* Quotes list */}
          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pe-1">
            {filteredQuotes.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-[#E8E2D8]">
                <EmptyState
                  compact
                  icon={<FileText />}
                  title={t('noQuotes', { defaultValue: 'No quotes found.' })}
                  description={t('emptyDescription', {
                    defaultValue: 'Quotes you send to customers will appear here.',
                  })}
                />
              </div>
            ) : (
              filteredQuotes.map((quote) => (
                <div
                  key={quote.id}
                  className="rounded-xl border border-gray-100 p-3 transition-colors hover:bg-gray-50/50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <Avatar
                        initials={quote.customer.initials}
                        name={quote.customer.name}
                        color={quote.customer.avatarColor}
                        size={36}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#15201F]">
                          {quote.customer.name}
                        </p>
                        <p className="truncate text-xs text-[#5A6968]">
                          {quote.vehicle} — {quote.service}
                        </p>
                        {quote.bookingId && (
                          <p className="mt-1 text-[11px] font-semibold text-[#8A8074]">
                            {t('bookingId')}: #{quote.bookingId}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className="text-sm font-bold text-[#0E5C5B]"
                        style={{ fontFamily: "'Sora', sans-serif" }}
                      >
                        {formatQuoteCurrency(quote.amount, locale, currency)}
                      </p>
                      <p className="mt-0.5 text-[10px] text-[#5A6968]">{quote.sentAt}</p>
                    </div>
                  </div>
                  <div className="mt-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <StatusBadge status={quote.status} />
                      {quote.status === 'draft' && quote.jobId && (
                        <button
                          type="button"
                          onClick={() => handleEditDraft(quote)}
                          className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100"
                        >
                          <FilePenLine className="h-3.5 w-3.5" />
                          {t('editDraft')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
