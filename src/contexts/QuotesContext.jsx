import { createContext, useContext, useState } from 'react';
import { MOCK_AVATAR_COLORS, MOCK_QUOTE_DEFAULTS } from '@/mocks/constants';
import quoteMockData from '@/mocks/quotes.json';

const QuotesContext = createContext(null);

const createDefaultLineItems = () => quoteMockData.defaultLineItems.map((item) => ({ ...item }));

// JSON cannot import JavaScript constants, so apply the shared avatar default
// while reading the quote mock data.
const createRecentQuotes = () =>
  quoteMockData.recentQuotes.map((quote) => ({
    ...quote,
    customer: { ...quote.customer, avatarColor: MOCK_AVATAR_COLORS.customer },
  }));

export function QuotesProvider({ children }) {
  // quotes.json is the single source of truth for the initial quote data.
  const [recentQuotes, setRecentQuotes] = useState(createRecentQuotes);
  const [lineItems, setLineItems] = useState(createDefaultLineItems);

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

  const sendQuote = ({ customer, vehicle }) => {
    const total = lineItems.reduce((sum, item) => sum + (item.amount || 0), 0);
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

  const total = lineItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  const value = {
    recentQuotes,
    lineItems,
    total,
    addLineItem,
    updateLineItem,
    removeLineItem,
    sendQuote,
  };

  return <QuotesContext.Provider value={value}>{children}</QuotesContext.Provider>;
}

export function useQuotes() {
  const context = useContext(QuotesContext);
  if (!context) throw new Error('useQuotes must be used inside a <QuotesProvider>');
  return context;
}
