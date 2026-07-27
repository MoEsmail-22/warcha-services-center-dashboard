import { X, Clock } from 'lucide-react';
import Drawer from '../ui/Drawer';
import StatusBadge from './StatusBadge';
import { useAppTranslation } from '../../hooks/useAppTranslation';

export default function BookingDetailsDrawer({ open, onClose, booking }) {
  const { t } = useAppTranslation('bookings');

  if (!booking) return null;

  // Use the booking's own service breakdown (real data from context)
  const serviceBreakdown = booking.serviceBreakdown ?? [];
  const totalPrice = serviceBreakdown.reduce((sum, s) => sum + (s.price ?? 0), 0);

  // Calculate total duration string from breakdown items
  const totalMinutes = serviceBreakdown.reduce((sum, s) => {
    const match = s?.duration?.match(/(\d+)\s*min/i) ?? s?.duration?.match(/(\d+(\.\d+)?)\s*hour/i);
    if (match) {
      const val = parseFloat(match[1]);
      if (s.duration.toLowerCase().includes('hour')) return sum + Math.round(val * 60);
      return sum + val;
    }
    return sum;
  }, 0);
  const totalDuration =
    totalMinutes >= 60 ? `${(totalMinutes / 60).toFixed(1)} HOURS` : `${totalMinutes} MINS`;

  // Use the booking's own timeline (real data from context)
  const timeline = booking.timeline ?? [];

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title=""
      subtitle=""
      width="max-w-md"
      footer={
        <div className="rounded-lg bg-gray-50 px-4 py-3 text-center text-xs text-gray-500">
          {booking.status === 'confirmed' && '✓ This booking has been accepted.'}
          {booking.status === 'cancelled' && '✗ This booking has been declined.'}
          {booking.status === 'in_progress' && '↻ Work is in progress on this booking.'}
          {booking.status === 'completed' && '✓ This booking is completed.'}
        </div>
      }
    >
      {/* ---- Custom header ---- */}
      <div className="-mx-2 -mt-2 mb-6 rounded-xl bg-[#0E5C5B] px-4 py-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <StatusBadge status={booking.status} />
            <span className="text-lg font-bold">#{booking.id}</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-white/70 hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-2 text-xs text-white/70">
          {t('created', { defaultValue: 'Created' })}: {booking.createdAt ?? 'N/A'}
        </p>
      </div>

      {/* ---- Customer / Vehicle / Technician quick info ---- */}
      <div className="mb-6 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs tracking-wide text-[#5A6968] uppercase">Customer</p>
          <p className="font-semibold text-[#15201F]">{booking.customer?.name ?? '—'}</p>
        </div>
        <div>
          <p className="text-xs tracking-wide text-[#5A6968] uppercase">Vehicle</p>
          <p className="font-semibold text-[#15201F]">{booking.vehicle ?? '—'}</p>
        </div>
        <div>
          <p className="text-xs tracking-wide text-[#5A6968] uppercase">Technician</p>
          <p className="font-semibold text-[#15201F]">{booking.technician?.name ?? '—'}</p>
        </div>
        <div>
          <p className="text-xs tracking-wide text-[#5A6968] uppercase">Date / Time</p>
          <p className="font-semibold text-[#15201F]">
            {booking.date
              ? new Date(booking.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : '—'}
            {booking.time ? ` · ${booking.time}` : ''}
          </p>
        </div>
      </div>

      {/* ---- Service Breakdown ---- */}
      <section className="mb-6">
        <h3 className="mb-3 text-xs font-bold tracking-wide text-[#5A6968] uppercase">
          {t('serviceBreakdown', { defaultValue: 'Service Breakdown' })}
        </h3>

        <div className="space-y-3">
          {serviceBreakdown.length === 0 ? (
            <p className="text-sm text-gray-400">No service details available.</p>
          ) : (
            serviceBreakdown.map((s, i) => (
              <div key={i} className="rounded-xl border border-gray-100 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#15201F]">{s.label}</p>
                    {s.description && (
                      <p className="mt-0.5 text-xs text-[#5A6968]">{s.description}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#0E5C5B]">EGP {s.price}</p>
                    {s.duration && (
                      <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-[#5A6968]">
                        <Clock className="h-3 w-3" />
                        {s.duration}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {serviceBreakdown.length > 0 && (
          <div className="mt-3 flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
            <div>
              <p className="text-sm font-bold text-[#15201F]">
                {t('totalEstimated', { defaultValue: 'Total Estimated' })}
              </p>
              <p className="mt-0.5 text-xs text-[#5A6968]">
                {t('estDuration', { defaultValue: 'EST. DURATION' })}: {totalDuration}
              </p>
            </div>
            <p className="text-lg font-bold text-[#0E5C5B]">EGP {totalPrice.toFixed(2)}</p>
          </div>
        )}
      </section>

      {/* ---- Activity Timeline ---- */}
      <section>
        <h3 className="mb-3 text-xs font-bold tracking-wide text-[#5A6968] uppercase">
          {t('activityTimeline', { defaultValue: 'Activity Timeline' })}
        </h3>

        {timeline.length === 0 ? (
          <p className="text-sm text-gray-400">No activity yet.</p>
        ) : (
          <ol className="relative space-y-4 ps-6">
            <span
              className="absolute start-[7px] top-1 bottom-1 w-px bg-gray-200"
              aria-hidden="true"
            />
            {timeline.map((item) => (
              <li key={item.id} className="relative">
                <span
                  className={`absolute start-[-22px] top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full ring-4 ring-white ${
                    item.done ? 'bg-[#0E5C5B]' : 'border-2 border-gray-300 bg-white'
                  }`}
                />
                <p className="text-sm font-semibold text-[#15201F]">{item.label}</p>
                {item.timestamp && (
                  <p className="mt-0.5 text-xs text-[#5A6968]">{item.timestamp}</p>
                )}
                {item.note && (
                  <p className="mt-1 text-xs text-[#5A6968] italic">
                    {t('note', { defaultValue: 'Note' })}: {item.note}
                  </p>
                )}
              </li>
            ))}
          </ol>
        )}
      </section>
    </Drawer>
  );
}
