export const BOOKING_FILTER_TABS = Object.freeze([
  { key: 'all', label: 'All' },
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
]);

export const BOOKING_SERVICE_ALIASES = {
  'Brake Check': 'Brake Repair',
  'Oil Change': 'Oil Change',
  Engine: 'Engine Diagnostic',
  'AC Repair': 'AC Service',
};

export const BOOKING_STATUS_VALUES = {
  Pending: 'pending',
  Confirmed: 'confirmed',
  'In Progress': 'in_progress',
  Completed: 'completed',
};

export const BOOKINGS_PAGE_SIZE = 8;
