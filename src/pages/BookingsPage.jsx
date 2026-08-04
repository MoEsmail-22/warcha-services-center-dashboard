import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { useBookings } from '../contexts/BookingsContext';
import { useAppTranslation } from '../hooks/useAppTranslation';
import StatusBadge from '../components/widgets/StatusBadge';
import Avatar from '../components/ui/Avatar';
import FilterBookingsDrawer from '../components/widgets/FilterBookingsDrawer';
import BookingDetailsDrawer from '../components/widgets/BookingDetailsDrawer';
import Pagination from '../components/widgets/Pagination';
import { BOOKING_FILTER_TABS, BOOKINGS_PAGE_SIZE } from '../constants/bookingFilters';
import { filterBookings, formatBookingDate } from '../utils/bookingHelpers';
import CancelBookingModal from '../components/bookings/CancelBookingModal';

export default function BookingsPage() {
  const { t } = useAppTranslation('bookings');
  const { bookings, cancelBooking } = useBookings();
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [advancedFilters, setAdvancedFilters] = useState(null);

  // ---- Drawer state ----
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);

  const filtered = useMemo(
    () => filterBookings(bookings, { tab: activeTab, search, advanced: advancedFilters }),
    [bookings, activeTab, search, advancedFilters]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / BOOKINGS_PAGE_SIZE));
  const currentPageSafe = Math.min(currentPage, totalPages);
  const paginated = filtered.slice(
    (currentPageSafe - 1) * BOOKINGS_PAGE_SIZE,
    currentPageSafe * BOOKINGS_PAGE_SIZE
  );

  const handleApplyFilters = (filters) => {
    setAdvancedFilters(filters);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setAdvancedFilters(null);
    setCurrentPage(1);
  };

  // Check if advanced filters are active
  const hasActiveFilters =
    !!advancedFilters &&
    (advancedFilters.search?.trim() ||
      advancedFilters.services?.length > 0 ||
      advancedFilters.status ||
      advancedFilters.dateFrom ||
      advancedFilters.dateTo);

  return (
    <div className="flex h-full flex-col">
      {/* ============ HEADER ============ */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="text-2xl font-bold text-[#15201F]"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            {t('title', { defaultValue: 'Bookings' })}
          </h1>
          <p className="mt-1 text-sm text-[#5A6968]">
            {t('subtitle', { defaultValue: 'Manage and schedule incoming service requests.' })}
          </p>
        </div>
      </div>

      {/* ============ FILTERS + SEARCH ============ */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {BOOKING_FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setCurrentPage(1);
              }}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                activeTab === tab.key
                  ? 'border-[#1C1712] bg-[#1C1712] text-white'
                  : 'border-[#E8E2D8] bg-white text-[#5A5045] hover:bg-[#F2EDE4]'
              }`}
            >
              {t(`tabs.${tab.key}`, { defaultValue: tab.label })}
            </button>
          ))}

          <button
            onClick={() => setFilterOpen(true)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
              hasActiveFilters
                ? 'border-[#E08B2F] bg-[#FDF1DE] text-[#C8730A]'
                : 'border-[#E8E2D8] bg-white text-[#5A5045] hover:bg-[#F2EDE4]'
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {t('filters', { defaultValue: 'Filters' })}
            {hasActiveFilters && (
              <span className="ml-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#E08B2F] px-1 text-[10px] font-bold text-white">
                ●
              </span>
            )}
          </button>

          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50"
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={t('search', { defaultValue: 'Search bookings...' })}
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pr-3 pl-9 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#0E5C5B] focus:ring-2 focus:ring-[#0E5C5B]/10 focus:outline-none"
          />
        </div>
      </div>

      {/* ============ TABLE ============ */}
      <div
        className="flex-1 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
        style={{ borderRadius: '16px' }}
      >
        <div className="h-full overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="border-b border-gray-100 bg-gray-50/50">
              <tr>
                {[
                  'Booking ID',
                  'Customer',
                  'Vehicle',
                  'Service',
                  'Technician',
                  'Date/Time',
                  'Status',
                  'Actions',
                ].map((header) => (
                  <th
                    key={header}
                    className={`px-4 py-3 text-xs font-semibold tracking-wide text-[#5A6968] uppercase ${
                      header === 'Actions' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-sm text-gray-400">
                    {t('noResults', { defaultValue: 'No bookings found.' })}
                  </td>
                </tr>
              ) : (
                paginated.map((booking) => (
                  <tr
                    key={booking.id}
                    className="border-b border-gray-50 transition-colors last:border-0 hover:bg-gray-50/50"
                  >
                    <td className="px-4 py-3.5 text-sm font-medium text-[#5A6968]">
                      #{booking.id}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar
                          initials={booking.customer.initials}
                          name={booking.customer.name}
                          color={booking.customer.avatarColor}
                          size={32}
                        />
                        <span className="text-sm font-medium text-[#15201F]">
                          {booking.customer.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-[#15201F]">{booking.vehicle}</td>
                    <td className="px-4 py-3.5 text-sm text-[#15201F]">{booking.service}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar
                          initials={booking.technician.initials}
                          name={booking.technician.name}
                          color={booking.technician.avatarColor}
                          size={32}
                        />
                        <span className="text-sm font-medium text-[#15201F]">
                          {booking.technician.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-[#15201F]">
                      <div>
                        <p>{formatBookingDate(booking.date)}</p>
                        <p className="text-xs text-[#5A6968]">{booking.time}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {booking.status === 'pending' && (
                          <button
                            type="button"
                            onClick={() => setCancelTarget(booking)}
                            className="rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
                          >
                            {t('cancellation.button')}
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                          aria-label="View details"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPageSafe}
          totalItems={filtered.length}
          pageSize={BOOKINGS_PAGE_SIZE}
          onPageChange={setCurrentPage}
          labels={{
            showing: t('showing', { defaultValue: 'Showing' }),
            of: t('of', { defaultValue: 'of' }),
            previous: t('previousPage', { defaultValue: 'Previous page' }),
            next: t('nextPage', { defaultValue: 'Next page' }),
          }}
        />

        {false && (
          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
            <p className="text-xs text-[#5A6968]">
              {t('showing', { defaultValue: 'Showing' })}{' '}
              <span className="font-semibold text-[#15201F]">
                {filtered.length === 0 ? 0 : (currentPageSafe - 1) * BOOKINGS_PAGE_SIZE + 1}–
                {Math.min(currentPageSafe * BOOKINGS_PAGE_SIZE, filtered.length)}
              </span>{' '}
              {t('of', { defaultValue: 'of' })}{' '}
              <span className="font-semibold text-[#15201F]">{filtered.length}</span>
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPageSafe === 1}
                className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`flex h-7 w-7 items-center justify-center rounded-md text-xs font-semibold transition-colors ${
                    currentPageSafe === page
                      ? 'bg-[#0E5C5B] text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPageSafe === totalPages}
                className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ============ DRAWERS ============ */}
      <FilterBookingsDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        onApply={handleApplyFilters}
      />
      <BookingDetailsDrawer
        open={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        booking={selectedBooking}
      />
      <CancelBookingModal
        open={Boolean(cancelTarget)}
        itemName={cancelTarget ? `#${cancelTarget.id}` : ''}
        onClose={() => setCancelTarget(null)}
        onConfirm={() => {
          cancelBooking(cancelTarget.id);
          setCancelTarget(null);
        }}
      />
    </div>
  );
}
