import { BOOKING_SERVICE_ALIASES, BOOKING_STATUS_VALUES } from '../constants/bookingFilters';

const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
});

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

const normalizeText = (value) =>
  String(value ?? '')
    .trim()
    .toLowerCase();

const getInitials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? '')
    .join('')
    .toUpperCase();

function toValidDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatMinutes(minutes = 0) {
  if (minutes < 60) return `${minutes} mins est.`;
  const hours = minutes / 60;
  return `${Number.isInteger(hours) ? hours : hours.toFixed(1)} hours est.`;
}

export function formatBookingDate(isoDate) {
  if (!isoDate) return '';
  const date = toValidDate(isoDate);
  return date ? DATE_FORMATTER.format(date) : isoDate;
}

export function createBookingViewModels({ bookings, customers, vehicles, services, technicians }) {
  const customersById = new Map(customers.map((item) => [item.id, item]));
  const vehiclesById = new Map(vehicles.map((item) => [item.id, item]));
  const servicesById = new Map(services.map((item) => [item.id, item]));
  const techniciansById = new Map(technicians.map((item) => [item.id, item]));

  return bookings.map((booking) => {
    const customer = customersById.get(booking.customerId);
    const vehicle = vehiclesById.get(booking.vehicleId);
    const service = servicesById.get(booking.serviceId);
    const technician = techniciansById.get(booking.technicianId);
    const customerName = customer?.fullName ?? 'Unknown customer';
    const technicianName = technician?.fullName ?? 'Unassigned';
    const serviceName = service?.name?.en ?? 'Unknown service';
    const createdAt = toValidDate(booking.createdAt);

    return {
      id: booking.id,
      customer: {
        name: customerName,
        initials: getInitials(customerName),
        avatarColor: '#C8730A',
      },
      vehicle: vehicle ? `${vehicle.brand} ${vehicle.model} ${vehicle.year}` : 'Unknown vehicle',
      service: serviceName,
      technician: {
        name: technicianName,
        initials: getInitials(technicianName),
        avatarColor: '#8A8074',
      },
      date: booking.bookingDate,
      time: booking.bookingTime,
      status: booking.status,
      createdAt: createdAt ? DATE_TIME_FORMATTER.format(createdAt) : booking.createdAt,
      serviceBreakdown: service
        ? [
            {
              label: serviceName,
              description: service.description?.en ?? '',
              price: service.price?.from ?? 0,
              duration: formatMinutes(booking.estimatedDurationMinutes ?? service.durationMinutes),
            },
          ]
        : [],
      timeline: [
        {
          id: `${booking.id}-received`,
          label: 'Booking Received',
          timestamp: createdAt ? DATE_TIME_FORMATTER.format(createdAt) : booking.createdAt,
          note: booking.notes ?? '',
          done: true,
        },
      ],
    };
  });
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
      booking.customer?.name,
      booking.vehicle,
      booking.service,
      booking.technician?.name,
    ].some((value) => normalizeText(value).includes(topSearch));
  });
}
