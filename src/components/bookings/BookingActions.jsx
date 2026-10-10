/**
 * BookingActions — the actions section of the booking details drawer:
 * change the status, start a quote for this booking, and redeem a customer's voucher.
 */
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FilePlus2, TicketPercent } from 'lucide-react';
import { useBookings } from '@/contexts/BookingsContext';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { useNotify } from '@/hooks/useNotify';
import { redeemVoucher } from '@/API/vouchersApi';
import { createLocalError } from '@/API/errors';
import { Spinner } from '@/components/ui/Spinner';

// Statuses the workshop can move a booking to (cancelling has its own button).
const SETTABLE_STATUSES = ['pending', 'confirmed', 'in_progress', 'completed'];

export default function BookingActions({ booking }) {
  const { t } = useAppTranslation('bookings');
  const { lang = 'en' } = useParams();
  const { changeBookingStatus } = useBookings();
  const notify = useNotify();

  const [status, setStatus] = useState(booking.status);
  const [savingStatus, setSavingStatus] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  const [redeeming, setRedeeming] = useState(false);

  // Show the booking's current status again when another booking is opened.
  useEffect(() => {
    setStatus(booking.status);
    setVoucherCode('');
  }, [booking.id, booking.status]);

  const isClosed = ['cancelled', 'completed'].includes(booking.status);

  const saveStatus = async () => {
    if (status === booking.status || savingStatus) return;
    setSavingStatus(true);
    try {
      await changeBookingStatus(booking.id, status);
      notify.success('bookingStatusChanged');
    } catch (err) {
      setStatus(booking.status);
      notify.error(err, 'booking.status');
    } finally {
      setSavingStatus(false);
    }
  };

  const applyVoucher = async (event) => {
    event.preventDefault();
    if (redeeming) return;
    if (!voucherCode.trim()) {
      notify.error(createLocalError('voucher.codeRequired', 'Enter the voucher code.'));
      return;
    }
    setRedeeming(true);
    try {
      await redeemVoucher(voucherCode);
      notify.success('voucherRedeemed');
      setVoucherCode('');
    } catch (err) {
      notify.error(err, 'voucher.redeem');
    } finally {
      setRedeeming(false);
    }
  };

  return (
    <section className="mb-6 space-y-4 rounded-xl border border-[#E8E2D8] bg-[#FBF8F3] p-4">
      {/* Status */}
      <div>
        <label
          htmlFor={`booking-status-${booking.id}`}
          className="mb-1.5 block text-xs font-bold tracking-wide text-[#5A6968] uppercase"
        >
          {t('actions.status', { defaultValue: 'Status' })}
        </label>
        <div className="flex gap-2">
          <select
            id={`booking-status-${booking.id}`}
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            disabled={isClosed || savingStatus}
            className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#0E5C5B] focus:outline-none disabled:bg-gray-50 disabled:text-gray-400"
          >
            {SETTABLE_STATUSES.map((key) => (
              <option key={key} value={key}>
                {t(`status.${key}`)}
              </option>
            ))}
            {!SETTABLE_STATUSES.includes(booking.status) && (
              <option value={booking.status}>{t(`status.${booking.status}`)}</option>
            )}
          </select>
          <button
            type="button"
            onClick={saveStatus}
            disabled={isClosed || status === booking.status || savingStatus}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0E5C5B] px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {savingStatus && <Spinner size="sm" className="border-white/30 border-t-white" />}
            {t('actions.updateStatus', { defaultValue: 'Update' })}
          </button>
        </div>
      </div>

      {/* Quote */}
      {/* The backend only accepts quotes while the job is in progress. */}
      {!isClosed && booking.jobStatus === 'in_progress' && (
        <Link
          to={`/${lang}/quotes?booking=${encodeURIComponent(booking.id)}`}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#0E5C5B] bg-white px-4 py-2 text-sm font-semibold text-[#0E5C5B] transition-colors hover:bg-[#EDF7F5]"
        >
          <FilePlus2 className="h-4 w-4" />
          {t('actions.createQuote', { defaultValue: 'Create quote for this booking' })}
        </Link>
      )}

      {/* Voucher */}
      <form onSubmit={applyVoucher}>
        <label
          htmlFor={`booking-voucher-${booking.id}`}
          className="mb-1.5 block text-xs font-bold tracking-wide text-[#5A6968] uppercase"
        >
          {t('actions.voucher', { defaultValue: 'Customer voucher' })}
        </label>
        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1">
            <TicketPercent className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              id={`booking-voucher-${booking.id}`}
              type="text"
              value={voucherCode}
              onChange={(event) => setVoucherCode(event.target.value.toUpperCase())}
              placeholder={t('actions.voucherPlaceholder', { defaultValue: 'Enter voucher code' })}
              className="w-full rounded-lg border border-gray-200 bg-white py-2 ps-9 pe-3 text-sm text-gray-900 uppercase placeholder:text-gray-400 placeholder:normal-case focus:border-[#0E5C5B] focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={redeeming}
            className="inline-flex items-center gap-2 rounded-lg border border-[#E8E2D8] bg-white px-4 text-sm font-semibold text-[#1C1712] hover:bg-[#F2EDE4] disabled:opacity-50"
          >
            {redeeming && <Spinner size="sm" />}
            {t('actions.redeem', { defaultValue: 'Redeem' })}
          </button>
        </div>
      </form>
    </section>
  );
}
