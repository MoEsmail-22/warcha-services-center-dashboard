import { createContext, useContext, useState } from 'react';
import { MOCK_AVATAR_COLORS, MOCK_QUOTE_DEFAULTS } from '@/mocks/constants';
import { useJobs } from './JobsContext';

const QuotesContext = createContext(null);

// A new quote starts with one empty line for the user to fill in.
const createDefaultLineItems = () => [{ id: Date.now(), label: '', amount: 0 }];

export function QuotesProvider({ children }) {
  const { workflowQuotes, sendWorkflowQuote } = useJobs();
  // Empty until quotes are loaded from the API (no mock data).
  const [recentQuotes, setRecentQuotes] = useState([]);
  const [lineItems, setLineItems] = useState(createDefaultLineItems);
  const [activeWorkflowQuoteId, setActiveWorkflowQuoteId] = useState(null);

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

  const removeLineItem = (id) => {
    setLineItems((previous) => previous.filter((item) => item.id !== id));
  };

  const sendQuote = ({ customer, vehicle, futureRepairs = [] }) => {
    const total = lineItems.reduce((sum, item) => sum + (item.amount || 0), 0);

    // Sending an auto-created diagnostic draft advances its linked workflow.
    if (activeWorkflowQuoteId) {
      const sentQuote = sendWorkflowQuote(activeWorkflowQuoteId, lineItems, futureRepairs);
      if (sentQuote) {
        setActiveWorkflowQuoteId(null);
        setLineItems(createDefaultLineItems());
      }
      return sentQuote;
    }

    const newQuote = {
      id: `Q-${2400 + recentQuotes.length + 1}`,
      customer: {
        name: customer || MOCK_QUOTE_DEFAULTS.customerName,
        initials:
          customer
            ?.split(' ')
            .map((name) => name[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) ?? 'WC',
        avatarColor: MOCK_AVATAR_COLORS.customer,
      },
      vehicle: vehicle || '—',
      service:
        lineItems
          .map((item) => item.label)
          .filter(Boolean)
          .join(', ') || MOCK_QUOTE_DEFAULTS.serviceName,
      futureRepairs,
      amount: total,
      status: MOCK_QUOTE_DEFAULTS.status,
      sentAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    };
    setRecentQuotes((previous) => [newQuote, ...previous]);
    setLineItems(createDefaultLineItems());
    return newQuote;
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
    recentQuotes: [...workflowQuotes, ...recentQuotes],
    lineItems,
    total,
    addLineItem,
    updateLineItem,
    removeLineItem,
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
