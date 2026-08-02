/**
 * Values shared by mock records.
 * Keep mock-only defaults here so a colour change does not require editing
 * every booking, quote, or newly created record.
 */
export const MOCK_AVATAR_COLORS = {
  customer: '#C8730A',
  technician: '#8A8074',
};

/** Shared fallback values used when creating mock bookings. */
export const MOCK_BOOKING_DEFAULTS = {
  status: 'pending',
  pendingApprovalNote: 'Pending approval',
  estimatedDuration: '60 mins est.',
};

/** Shared fallback values used when creating mock quotes. */
export const MOCK_QUOTE_DEFAULTS = {
  status: 'sent',
  customerName: 'Walk-in customer',
  serviceName: 'Custom quote',
};
