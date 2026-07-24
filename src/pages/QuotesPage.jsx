import { useState } from 'react';
import { Plus, Send, Search } from 'lucide-react';
import { useQuotes } from '../contexts/QuotesContext';
import { useAppTranslation } from '../hooks/useAppTranslation';
import Avatar from '../components/ui/Avatar';
import { StatusBadge } from '../components/widgets';
import QuoteLineItemRow from '../components/quotes/QuoteLineItemRow';
import { filterQuotes, formatQuoteCurrency } from '../utils/quotes';

export default function QuotesPage() {
  const { t, i18n } = useAppTranslation('quotes');
  const { recentQuotes, lineItems, total, addLineItem, updateLineItem, removeLineItem, sendQuote } =
    useQuotes();

  // Quote header info (customer + vehicle being quoted)
  const [customerName, setCustomerName] = useState('Hazem M.');
  const [vehicle, setVehicle] = useState('Toyota Corolla');
  const [search, setSearch] = useState('');

  const handleSend = () => {
    if (lineItems.length === 0 || total === 0) return;
    sendQuote({ customer: customerName, vehicle });
  };

  // Filter recent quotes by search
  const locale = i18n.language?.startsWith('ar') ? 'ar-EG' : 'en-US';
  const currency = i18n.language?.startsWith('ar') ? 'ج.م' : 'EGP';
  //utitlys
  const filteredQuotes = filterQuotes(recentQuotes, search);

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
        <div
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
              <p className="mt-0.5 text-xs text-[#5A6968]">
                {t('buildQuoteSubtitle', { defaultValue: 'Add line items and send for approval' })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs tracking-wide text-[#5A6968] uppercase">
                {t('vehicle', { defaultValue: 'Vehicle' })}
              </p>
              <input
                type="text"
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value)}
                className="mt-0.5 w-full rounded-md border border-gray-200 px-2 py-1 text-right text-sm font-medium text-[#15201F] focus:border-[#0E5C5B] focus:ring-2 focus:ring-[#0E5C5B]/10 focus:outline-none sm:w-48"
              />
            </div>
          </div>

          {/* Customer name input (full width) */}
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-semibold tracking-wide text-[#5A6968] uppercase">
              {t('customerName', { defaultValue: 'Customer name' })}
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder={t('customerPlaceholder', { defaultValue: 'Search or enter name' })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#0E5C5B] focus:ring-2 focus:ring-[#0E5C5B]/10 focus:outline-none"
            />
          </div>

          {/* Line items list */}
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold tracking-wide text-[#5A6968] uppercase">
              {t('lineItems', { defaultValue: 'Line items' })}
            </p>
            <span className="text-xs text-[#5A6968]">
              {lineItems.length} {t('items', { defaultValue: 'items' })}
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
            onClick={addLineItem}
            className="mt-3 inline-flex items-center gap-1.5 self-start rounded-lg border border-dashed border-gray-300 px-3 py-1.5 text-xs font-semibold text-[#5A6968] transition-colors hover:border-[#0E5C5B] hover:text-[#0E5C5B]"
          >
            <Plus className="h-3.5 w-3.5" />
            {t('addLineItem', { defaultValue: 'Add line item' })}
          </button>

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
              onClick={handleSend}
              disabled={total === 0}
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
        </div>

        {/* ---- RIGHT: Recent quotes ---- */}
        <div
          className="flex flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-2"
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
          <div className="flex-1 space-y-2 overflow-y-auto">
            {filteredQuotes.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed border-gray-200 py-8 text-center text-sm text-gray-400">
                {t('noQuotes', { defaultValue: 'No quotes found.' })}
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
                    <StatusBadge status={quote.status} />
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
