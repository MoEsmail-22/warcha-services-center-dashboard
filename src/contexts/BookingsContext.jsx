/**
 * BookingsContext — provides bookings data + CRUD actions.
 *
 * Used by: Dashboard page (today's bookings count), Bookings page (table).
 *
 * Exposes:
 *   { data, loading, error, addBooking, updateBooking, cancelBooking, deleteBooking }
 *
 * Usage in a page:
 *   const { data: bookings, loading, error } = useBookings();
 */
import { createContext, useContext, useState } from 'react';
import { MOCK_AVATAR_COLORS, MOCK_BOOKING_DEFAULTS } from '@/mocks/constants';
// import mockBookings from '@/mocks/bookings.json';

const BookingsContext = createContext(null);

const mockBookings = [
  {
    id: 'BK-9402',
    customer: { name: 'Sara K.', initials: 'SK', avatarColor: MOCK_AVATAR_COLORS.customer },
    vehicle: 'Hyundai Elantra 2020',
    service: 'Brake Check',
    technician: { name: 'Hazem M.', initials: 'HM', avatarColor: MOCK_AVATAR_COLORS.technician },
    date: '2026-07-13',
    time: '10:30 AM',
    status: MOCK_BOOKING_DEFAULTS.status,
    createdAt: 'July 11, 2024 at 11:20 AM',
    serviceBreakdown: [
      {
        label: 'Full Brake Inspection',
        description: 'Front and rear pad thickness, rotors, and fluid check.',
        price: 450,
        duration: '90 mins est.',
      },
    ],
    timeline: [
      {
        id: 1,
        label: 'Booking Received',
        timestamp: 'July 11, 2024 • 11:20 AM',
        note: 'Client mentioned squeaking noise when braking at low speeds.',
        done: true,
      },
      {
        id: 2,
        label: 'Technician Confirmation',
        timestamp: null,
        note: MOCK_BOOKING_DEFAULTS.pendingApprovalNote,
        done: false,
      },
    ],
  },
  {
    id: 'BK-9403',
    customer: { name: 'John D.', initials: 'JD', avatarColor: MOCK_AVATAR_COLORS.customer },
    vehicle: 'Toyota Camry 2021',
    service: 'Oil Change',
    technician: { name: 'Omar T.', initials: 'OT', avatarColor: MOCK_AVATAR_COLORS.technician },
    date: '2026-07-13',
    time: '11:45 AM',
    status: 'confirmed',
    createdAt: 'July 10, 2024 at 9:00 AM',
    serviceBreakdown: [
      {
        label: 'Oil Change',
        description: 'Full oil and filter replacement with synthetic oil.',
        price: 350,
        duration: '45 mins est.',
      },
    ],
    timeline: [
      {
        id: 1,
        label: 'Booking Received',
        timestamp: 'July 10, 2024 • 9:00 AM',
        note: '',
        done: true,
      },
      {
        id: 2,
        label: 'Technician Confirmation',
        timestamp: 'July 10, 2024 • 10:30 AM',
        note: 'Confirmed by Hazem M.',
        done: true,
      },
    ],
  },
  {
    id: 'BK-9404',
    customer: { name: 'Mike R.', initials: 'MR', avatarColor: MOCK_AVATAR_COLORS.customer },
    vehicle: 'Ford F-150 2022',
    service: 'Brake Pad',
    technician: { name: 'Youssef H.', initials: 'YH', avatarColor: MOCK_AVATAR_COLORS.technician },
    date: '2026-07-13',
    time: '2:00 PM',
    status: 'in_progress',
    createdAt: 'July 09, 2024 at 1:15 PM',
    serviceBreakdown: [
      {
        label: 'Brake Pad Replacement',
        description: 'Replace front and rear brake pads with OEM parts.',
        price: 800,
        duration: '2 hours est.',
      },
    ],
    timeline: [
      {
        id: 1,
        label: 'Booking Received',
        timestamp: 'July 09, 2024 • 1:15 PM',
        note: '',
        done: true,
      },
      {
        id: 2,
        label: 'Work Started',
        timestamp: 'July 13, 2024 • 2:00 PM',
        note: 'Vehicle received and work began.',
        done: true,
      },
    ],
  },
  {
    id: 'BK-9405',
    customer: { name: 'Alice L.', initials: 'AL', avatarColor: MOCK_AVATAR_COLORS.customer },
    vehicle: 'Honda Civic 2019',
    service: 'Tire Rotation',
    technician: { name: 'Zara M.', initials: 'ZM', avatarColor: MOCK_AVATAR_COLORS.technician },
    date: '2026-07-14',
    time: '9:00 AM',
    status: 'completed',
    createdAt: 'July 08, 2024 at 3:00 PM',
    serviceBreakdown: [
      {
        label: 'Tire Rotation',
        description: 'Rotate all four tires and check pressure.',
        price: 150,
        duration: '30 mins est.',
      },
    ],
    timeline: [
      {
        id: 1,
        label: 'Booking Received',
        timestamp: 'July 08, 2024 • 3:00 PM',
        note: '',
        done: true,
      },
      {
        id: 2,
        label: 'Work Completed',
        timestamp: 'July 09, 2024 • 9:30 AM',
        note: 'Completed ahead of schedule.',
        done: true,
      },
    ],
  },
  {
    id: 'BK-9406',
    customer: { name: 'Nadia F.', initials: 'NF', avatarColor: MOCK_AVATAR_COLORS.customer },
    vehicle: 'Nissan Sunny 2021',
    service: 'General Check',
    technician: { name: 'Hazem M.', initials: 'HM', avatarColor: MOCK_AVATAR_COLORS.technician },
    date: '2026-07-14',
    time: '1:00 PM',
    status: 'cancelled',
    createdAt: 'July 07, 2024 at 11:00 AM',
    serviceBreakdown: [
      {
        label: 'General Inspection',
        description: 'Full vehicle inspection with detailed report.',
        price: 200,
        duration: '1 hour est.',
      },
    ],
    timeline: [
      {
        id: 1,
        label: 'Booking Received',
        timestamp: 'July 07, 2024 • 11:00 AM',
        note: '',
        done: true,
      },
      {
        id: 2,
        label: 'Booking Cancelled',
        timestamp: 'July 08, 2024 • 8:00 AM',
        note: 'Customer cancelled due to schedule conflict.',
        done: true,
      },
    ],
  },
  {
    id: 'BK-9407',
    customer: { name: 'Khaled A.', initials: 'KA', avatarColor: MOCK_AVATAR_COLORS.customer },
    vehicle: 'Kia Sportage 2022',
    service: 'AC Repair',
    technician: { name: 'Omar T.', initials: 'OT', avatarColor: MOCK_AVATAR_COLORS.technician },
    date: '2026-07-15',
    time: '3:30 PM',
    status: MOCK_BOOKING_DEFAULTS.status,
    createdAt: 'July 12, 2024 at 4:00 PM',
    serviceBreakdown: [
      {
        label: 'A/C System Diagnostic',
        description: 'Full A/C system check and refrigerant recharge.',
        price: 600,
        duration: '1.5 hours est.',
      },
    ],
    timeline: [
      {
        id: 1,
        label: 'Booking Received',
        timestamp: 'July 12, 2024 • 4:00 PM',
        note: '',
        done: true,
      },
      {
        id: 2,
        label: 'Technician Confirmation',
        timestamp: null,
        note: MOCK_BOOKING_DEFAULTS.pendingApprovalNote,
        done: false,
      },
    ],
  },
];

// Map form service types → existing service names + service breakdown
const SERVICE_MAP = {
  'Brake Check': {
    breakdownLabel: 'Full Brake Inspection',
    description: 'Front and rear pad thickness, rotors, and fluid check.',
    price: 450,
    duration: '90 mins est.',
  },
  'Oil Change': {
    breakdownLabel: 'Oil Change',
    description: 'Full oil and filter replacement with synthetic oil.',
    price: 350,
    duration: '45 mins est.',
  },
  'Tire Rotation': {
    breakdownLabel: 'Tire Rotation',
    description: 'Rotate all four tires and check pressure.',
    price: 150,
    duration: '30 mins est.',
  },
  'Engine Diagnostic': {
    breakdownLabel: 'Engine Diagnostic',
    description: 'Full engine computer diagnostic and code scan.',
    price: 300,
    duration: '1 hour est.',
  },
  'AC Repair': {
    breakdownLabel: 'A/C System Diagnostic',
    description: 'Full A/C system check and refrigerant recharge.',
    price: 600,
    duration: '1.5 hours est.',
  },
  'Battery Replacement': {
    breakdownLabel: 'Battery Replacement',
    description: 'Replace battery and check charging system.',
    price: 500,
    duration: '30 mins est.',
  },
  'Wheel Alignment': {
    breakdownLabel: 'Wheel Alignment',
    description: 'Four-wheel alignment with computerized equipment.',
    price: 250,
    duration: '45 mins est.',
  },
};

// Map technician name → initials
const TECHNICIAN_INITIALS = {
  'Hazem M.': 'HM',
  'Omar T.': 'OT',
  'Youssef H.': 'YH',
  'Zara M.': 'ZM',
};

export function BookingsProvider({ children }) {
  const [bookings, setBookings] = useState(mockBookings);

  // ---- Add a new booking from form data ----
  const addBooking = (formData) => {
    const serviceMeta = SERVICE_MAP[formData.serviceType] ?? {
      breakdownLabel: formData.serviceType,
      description: '',
      price: 0,
      duration: MOCK_BOOKING_DEFAULTS.estimatedDuration,
    };

    // Generate next booking ID (e.g., BK-9408)
    const maxId = bookings.reduce((max, b) => {
      const n = parseInt(b.id.replace('BK-', ''), 10);
      return n > max ? n : max;
    }, 9400);
    const newId = `BK-${maxId + 1}`;

    // Generate customer initials
    const nameParts = formData.customerName.trim().split(' ');
    const customerInitials = ((nameParts[0]?.[0] ?? '') + (nameParts[1]?.[0] ?? '')).toUpperCase();

    // Format time string (e.g., "14:30" → "2:30 PM")
    const formatTime = (t) => {
      if (!t) return '';
      const [h, m] = t.split(':');
      const hour = parseInt(h, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${m} ${ampm}`;
    };

    // Format createdAt timestamp
    const now = new Date();
    const createdAt =
      now.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }) +
      ' at ' +
      now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      });

    const newBooking = {
      id: newId,
      customer: {
        name: formData.customerName,
        initials: customerInitials,
        avatarColor: MOCK_AVATAR_COLORS.customer,
      },
      vehicle: formData.vehicle,
      service: formData.serviceType,
      technician: {
        name: formData.technician,
        initials: TECHNICIAN_INITIALS[formData.technician] ?? 'TE',
        avatarColor: MOCK_AVATAR_COLORS.technician,
      },
      date: formData.date,
      time: formatTime(formData.time),
      status: MOCK_BOOKING_DEFAULTS.status,
      createdAt,
      serviceBreakdown: [
        {
          label: serviceMeta.breakdownLabel,
          description: serviceMeta.description,
          price: serviceMeta.price,
          duration: serviceMeta.duration,
        },
      ],
      timeline: [
        {
          id: 1,
          label: 'Booking Received',
          timestamp:
            now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) +
            ' • ' +
            now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
          note: '',
          done: true,
        },
        {
          id: 2,
          label: 'Technician Confirmation',
          timestamp: null,
          note: MOCK_BOOKING_DEFAULTS.pendingApprovalNote,
          done: false,
        },
      ],
    };

    setBookings((prev) => [newBooking, ...prev]);
    return newBooking;
  };

  // ---- Update a booking's status (accept / decline / etc.) ----
  const updateBookingStatus = (bookingId, newStatus) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id !== bookingId) return b;

        // Add a new timeline entry based on the action
        const now = new Date();
        const timestamp =
          now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) +
          ' • ' +
          now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

        let newTimeline = [...b.timeline];

        if (newStatus === 'confirmed') {
          // Mark "Technician Confirmation" step as done
          newTimeline = newTimeline.map((step) =>
            step.label === 'Technician Confirmation'
              ? { ...step, done: true, timestamp, note: 'Booking accepted by workshop.' }
              : step
          );
        } else if (newStatus === 'cancelled') {
          newTimeline = [
            ...newTimeline.map((s) => ({ ...s, done: true })),
            {
              id: Date.now(),
              label: 'Booking Declined',
              timestamp,
              note: 'Booking was declined by the workshop.',
              done: true,
            },
          ];
        }

        return {
          ...b,
          status: newStatus,
          timeline: newTimeline,
        };
      })
    );
  };

  const value = {
    bookings,
    todaysBookings: bookings,
    todaysCount: bookings.length,
    yesterdaysCount: 6,
    difference: bookings.length - 6,
    addBooking,
    updateBookingStatus,
  };

  return <BookingsContext.Provider value={value}>{children}</BookingsContext.Provider>;
}

export function useBookings() {
  const ctx = useContext(BookingsContext);
  if (!ctx) throw new Error('useBookings must be used inside a <BookingsProvider>');
  return ctx;
}
