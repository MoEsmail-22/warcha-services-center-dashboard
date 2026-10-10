import { BOOKING_SERVICE_ALIASES, BOOKING_STATUS_VALUES } from '../constants/bookingFilters';

const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
});

const normalizeText = (value) =>
  String(value ?? '')
    .trim()
    .toLowerCase();

function toValidDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatBookingDate(isoDate) {
  if (!isoDate) return '';
  const date = toValidDate(isoDate);
  return date ? DATE_FORMATTER.format(date) : isoDate;
}

function getDateBounds(now = new Date()) {
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  return {
    startOfToday,
    endOfToday,
    startOfWeek,
    endOfWeek,
    month: now.getMonth(),
    year: now.getFullYear(),
  };
}

export function filterBookings(bookings, { tab, search, advanced }) {
  const { startOfToday, endOfToday, startOfWeek, endOfWeek, month, year } = getDateBounds();
  const advancedSearch = normalizeText(advanced?.search);
  const topSearch = normalizeText(search);
  const serviceTerms = (advanced?.services ?? []).map((service) =>
    normalizeText(BOOKING_SERVICE_ALIASES[service] ?? service)
  );
  const targetStatus = advanced?.status
    ? (BOOKING_STATUS_VALUES[advanced.status] ?? normalizeText(advanced.status))
    : '';

  return bookings.filter((booking) => {
    const date = toValidDate(booking.date);
    const matchesTab =
      tab === 'all' ||
      (date &&
        ((tab === 'today' && date >= startOfToday && date < endOfToday) ||
          (tab === 'week' && date >= startOfWeek && date < endOfWeek) ||
          (tab === 'month' && date.getMonth() === month && date.getFullYear() === year)));

    if (
      !matchesTab ||
      (advancedSearch && !normalizeText(booking.customer?.name).includes(advancedSearch))
    ) {
      return false;
    }
    if (
      serviceTerms.length &&
      !serviceTerms.some((term) => normalizeText(booking.service).includes(term))
    ) {
      return false;
    }
    if (targetStatus && booking.status !== targetStatus) return false;
    if (advanced?.dateFrom && booking.date < advanced.dateFrom) return false;
    if (advanced?.dateTo && booking.date > advanced.dateTo) return false;
    if (!topSearch) return true;

    return [
      booking.id,
      booking.number,
      booking.customer?.name,
      booking.vehicle,
      booking.service,
    ].some((value) => normalizeText(value).includes(topSearch));
  });
}
