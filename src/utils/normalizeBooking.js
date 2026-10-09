/**
 * Turns one booking from GET /Workshop/bookings into the shape the Bookings page,
 * the details drawer and the Dashboard already use.
 *
 * ⚠ The API docs don't describe the response, so each field is read from its most
 *   likely names. Once a real booking is available, trim this to the actual fields.
 */
import { toStatusKey } from '@/constants/bookingStatuses';

const CUSTOMER_COLOR = '#C8730A';
const TECHNICIAN_COLOR = '#8A8074';

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function toDate(value) {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date : null;
}

/** Local "YYYY-MM-DD" and "HH:mm", matching what the page's filters compare against. */
function toLocalDateAndTime(date) {
  if (!date) return { date: '', time: '' };
  const pad = (n) => String(n).padStart(2, '0');
  return {
    date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    time: `${pad(date.getHours())}:${pad(date.getMinutes())}`,
  };
}

function formatMinutes(minutes) {
  const value = Number(minutes);
  if (!Number.isFinite(value) || value <= 0) return '';
  const hours = Math.floor(value / 60);
  const rest = value % 60;
  return [hours && `${hours}h`, rest && `${rest}m`].filter(Boolean).join(' ');
}

export function normalizeBooking(item) {
  const id = item.id ?? item.bookingId;

  const customerName =
    item.customerName ??
    item.clientName ??
    item.customer?.fullName ??
    item.customer?.name ??
    item.client?.fullName ??
    item.client?.name ??
    'Customer';

  const car = item.car ?? item.vehicle ?? {};
  const vehicle =
    item.carName ??
    (typeof item.vehicle === 'string' ? item.vehicle : null) ??
    [
      car.brand ?? car.brandName ?? item.carBrand ?? item.brandName,
      car.model ?? car.modelName ?? item.carModel ?? item.modelName,
      car.year ?? item.carYear,
    ]
      .filter(Boolean)
      .join(' ');

  const services = Array.isArray(item.services) ? item.services : [];
  const serviceNames = services.map((s) => s.nameEn ?? s.name ?? s.serviceName).filter(Boolean);
  const service =
    item.serviceName ??
    (Array.isArray(item.serviceNames) ? item.serviceNames.join(', ') : null) ??
    (serviceNames.length ? serviceNames.join(', ') : 'Service');

  const technicianName = item.technicianName ?? item.technician?.name ?? 'Unassigned';
  const scheduled = toDate(item.scheduledAt ?? item.bookingDate ?? item.date ?? item.startAt);
  const created = toDate(item.createdAt ?? item.createdOn);
  const notes = item.customerNotes ?? item.notes ?? '';

  return {
    id,
    customer: {
      name: customerName,
      initials: getInitials(customerName),
      avatarColor: CUSTOMER_COLOR,
    },
    vehicle: vehicle || '—',
    service,
    technician: {
      name: technicianName,
      initials: getInitials(technicianName),
      avatarColor: TECHNICIAN_COLOR,
    },
    ...toLocalDateAndTime(scheduled),
    status: toStatusKey(item.status ?? item.bookingStatus),
    createdAt: created ? DATE_TIME_FORMATTER.format(created) : '',
    notes,
    serviceBreakdown: services.map((s) => ({
      label: s.nameEn ?? s.name ?? s.serviceName ?? 'Service',
      description: s.descriptionEn ?? s.description ?? '',
      price: s.price ?? s.minPrice ?? 0,
      duration: formatMinutes(s.duration ?? s.durationMinutes),
    })),
    timeline: [
      {
        id: `${id}-received`,
        label: 'Booking Received',
        timestamp: created ? DATE_TIME_FORMATTER.format(created) : '',
        note: notes,
        done: true,
      },
    ],
  };
}
