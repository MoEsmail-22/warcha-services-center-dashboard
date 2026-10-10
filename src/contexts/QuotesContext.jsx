/**
 * QuotesContext — the quote builder's line items plus the workshop's quotes.
 *
 * Quotes come from GET /Workshop/quotes: loaded after login, reloaded after a
 * quote is sent, and checked in the background on the same schedule as bookings
 * (so a customer's approval shows up without reloading the page). Sending a quote posts it for a booking:
 * POST /Workshop/bookings/{bookingId}/quotes.
 *
 * Drafts created from the Jobs board (still mock data) keep their own flow
 * through JobsContext until the Jobs board is connected to the API.
 */
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { createQuote, getQuotes } from '@/API/quotesApi';
import { isDemoMode } from '@/API/client';
import { normalizeQuote } from '@/utils/normalizeQuote';
import { useAuth } from './AuthContext';
import { useJobs } from './JobsContext';
import { usePolling } from '@/hooks/usePolling';
import { POLLING } from '@/constants/polling';

const QuotesContext = createContext(null);

// A new quote starts with one empty line for the user to fill in.
const createDefaultLineItems = () => [{ id: Date.now(), label: '', amount: 0 }];

function readQuoteRows(result) {
  const data = result?.data ?? result;
  const rows = Array.isArray(data) ? data : (data?.items ?? data?.quotes ?? []);
  return Array.isArray(rows) ? rows : [];
}

/** The API has a single "note" field, so recommendations are written into it. */
function buildNote(futureRepairs) {
  const lines = futureRepairs
    .filter((repair) => repair.description)
    .map((repair) =>
      repair.remainingKm != null
        ? `- ${repair.description} (in ${repair.remainingKm} km)`
        : `- ${repair.description}`
    );
  return lines.length ? `Recommendations:\n${lines.join('\n')}` : '';
}

export function QuotesProvider({ children }) {
  const { user } = useAuth();
  const { workflowQuotes, sendWorkflowQuote } = useJobs();

  const [apiQuotes, setApiQuotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lineItems, setLineItems] = useState(createDefaultLineItems);
  const [activeWorkflowQuoteId, setActiveWorkflowQuoteId] = useState(null);

  const enabled = Boolean(user) && !isDemoMode();

  /** Loads the quotes; `silent` = background check (no loading state, keeps the list on error). */
  const refresh = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      setApiQuotes(readQuoteRows(await getQuotes()).map(normalizeQuote));
      setError(null);
      return true;
    } catch (err) {
      if (!silent) setError(err);
      return false;
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      setApiQuotes([]);
      setError(null);
      return;
    }
    refresh();
  }, [enabled, user?.id, refresh]);

  usePolling(
    async () => {
      if (!(await refresh({ silent: true }))) throw new Error('Quotes check failed');
    },
    { ...POLLING.bookings, enabled }
  );

  const addLineItem = () => {
    setLineItems((previous) => [...previous, { id: Date.now(), label: '', amount: 0 }]);
  };

  const updateLineItem = (id, field, value) => {
    setLineItems((previous) =>
      previous.map((item) =>
        item.id === id
          ? { ...item, [field]: field === 'amount' ? Number(value) || 0 : value }
          : item
      )
    );
  };

  /** Replaces every line (e.g. with a booking's services); an empty list leaves one blank line. */
  const replaceLineItems = useCallback((items) => {
    setLineItems(items.length ? items : createDefaultLineItems());
  }, []);

  const removeLineItem = (id) => {
    setLineItems((previous) => previous.filter((item) => item.id !== id));
  };

  /**
   * Sends the quote being built. For a booking: posts it to the API and reloads
   * the list. For a Jobs board draft: uses the Jobs board's own flow.
   * Throws if the request fails, so the page can show the error.
   */
  const sendQuote = async ({ bookingId, futureRepairs = [] }) => {
    if (activeWorkflowQuoteId) {
      const sentQuote = sendWorkflowQuote(activeWorkflowQuoteId, lineItems, futureRepairs);
      if (sentQuote) {
        setActiveWorkflowQuoteId(null);
        setLineItems(createDefaultLineItems());
      }
      return sentQuote;
    }

    const items = lineItems
      .filter((item) => item.label.trim() && Number(item.amount) > 0)
      .map((item) => ({ description: item.label, price: item.amount }));

    const result = await createQuote(bookingId, { items, note: buildNote(futureRepairs) });
    setLineItems(createDefaultLineItems());
    await refresh();
    return result;
  };

  const editWorkflowQuote = (quoteId) => {
    const quote = workflowQuotes.find((item) => item.id === quoteId && item.status === 'draft');
    if (!quote) return null;
    setActiveWorkflowQuoteId(quote.id);
    setLineItems(quote.lineItems.map((item) => ({ ...item })));
    return quote;
  };

  const total = lineItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  const value = {
    recentQuotes: [...workflowQuotes, ...apiQuotes],
    loading,
    error,
    refresh,
    lineItems,
    total,
    addLineItem,
    updateLineItem,
    removeLineItem,
    replaceLineItems,
    sendQuote,
    editWorkflowQuote,
    activeWorkflowQuoteId,
  };

  return <QuotesContext.Provider value={value}>{children}</QuotesContext.Provider>;
}

export function useQuotes() {
  const context = useContext(QuotesContext);
  if (!context) throw new Error('useQuotes must be used inside a <QuotesProvider>');
  return context;
}
