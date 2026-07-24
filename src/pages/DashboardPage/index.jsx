import { Link } from 'react-router-dom';
import { CalendarCheck, Car, Wallet, Star, Plus, ChevronRight } from 'lucide-react';
import { useBookings } from '../../contexts/BookingsContext';
import { useVehicles } from '../../contexts/VehiclesContext';
import { useReviews } from '../../contexts/ReviewsContext';
import { useRevenue } from '../../contexts/RevenueContext';
import { useAppTranslation } from '../../hooks/useAppTranslation';
import { useAuth } from '../../contexts/AuthContext';
import StatCard from '../../components/widgets/StatCard';
import RevenueBarChart from '../../components/charts/RevenueBarChart';
import { statusStyles } from '../../constants/statusStyles';
import {
  getCustomerInitials,
  getGreeting,
  getCustomerName,
  getCustomerColor,
} from '@/utils/dashboardHelpers';
import { KPI_CARD_DEFINITIONS } from '@/mocks/dashboardKpis';

export default function DashboardPage() {
  const { t } = useAppTranslation('dashboard');
  const { user } = useAuth();

  // Bookings + Vehicles + Reviews — same as before, with safe fallbacks
  const { todaysBookings = [], todaysCount = 0, difference = 0 } = useBookings() ?? {};
  const { carsInServiceCount = 0, awaitingApprovalCount = 0 } = useVehicles() ?? {};
  const { avgRating = 0, totalReviews = 0 } = useReviews() ?? {};

  // Revenue — REAL shape: { data, loading, error }
  // data = { summary, comparison, weeklyChart, quickSummary }
  const { data: revenueData, loading: revenueLoading } = useRevenue() ?? {};

  // Pull fields out of the real nested shape, with safe fallbacks
  const todayRevenue = revenueData?.summary?.today ?? 0;
  const revenueChange = revenueData?.comparison?.todayChange ?? 0;
  const currency = 'EGP'; // not exposed by context, hardcode

  // Pass weeklyChart AS-IS — RevenueBarChart expects { day, current, previous }
  const weeklyRevenue = Array.isArray(revenueData?.weeklyChart) ? revenueData.weeklyChart : [];

  const weeklyTotal = weeklyRevenue.reduce((sum, d) => sum + (d.current || 0), 0);

  const currentHour = new Date().getHours();
  const greeting = getGreeting(currentHour, t);
  const userName = user?.name || 'Ahmed';
  const kpiIcons = {
    calendar: <CalendarCheck className="h-5 w-5 text-[#0E5C5B]" />,
    car: <Car className="h-5 w-5 text-[#0E5C5B]" />,
    wallet: <Wallet className="h-5 w-5 text-[#0E5C5B]" />,
    star: <Star className="h-5 w-5 fill-amber-400 text-amber-400" />,
  };
  const kpiCardValues = {
    'todays-bookings': {
      value: String(todaysCount),
      change: `+${difference} ${t('vsYesterday', { defaultValue: 'vs yesterday' })}`,
      trend: 'up',
    },
    'cars-in-service': {
      value: String(carsInServiceCount),
      subtext: `${awaitingApprovalCount} ${t('awaitingApproval', { defaultValue: 'awaiting approval' })}`,
    },
    'revenue-today': {
      value: `${todayRevenue.toLocaleString()} ${currency}`,
      change: `${revenueChange > 0 ? '+' : ''}${revenueChange}%`,
      trend: revenueChange >= 0 ? 'up' : 'down',
    },
    'average-rating': {
      value: String(avgRating),
      subtext: `${totalReviews} ${t('reviews', { defaultValue: 'reviews' })}`,
    },
  };
  const kpiCards = KPI_CARD_DEFINITIONS.map(({ key, labelKey, defaultLabel, icon, iconBg }) => ({
    key,
    label: t(labelKey, { defaultValue: defaultLabel }),
    icon: kpiIcons[icon],
    iconBg,
    ...kpiCardValues[key],
  }));

  return (
    <div className="space-y-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* ============ HEADER ============ */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="text-2xl leading-none font-bold tracking-tight text-[#15201F]"
            style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: '24px',
              fontWeight: 700,
              letterSpacing: '-0.48px',
              lineHeight: '100%',
            }}
          >
            {greeting}, {userName} 👋
          </h1>
          <p
            className="mt-1.5 text-[#5A6968]"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '13px',
              fontWeight: 400,
              lineHeight: '100%',
              letterSpacing: '0%',
            }}
          >
            {t('subtitle', {
              defaultValue: "Here's what's happening at your workshop today.",
            })}
          </p>
        </div>

        <button
          className="inline-flex items-center justify-center gap-2 px-4 text-white shadow-sm transition-colors hover:opacity-90"
          style={{
            backgroundColor: '#0E5C5B',
            borderRadius: '10px',
            height: '42px',
            minWidth: '126px',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          <Plus className="h-4 w-4" />
          {t('newBooking', { defaultValue: 'New booking' })}
        </button>
      </div>

      {/* ============ KPI CARDS ============ */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map(({ key, ...cardProps }) => (
          <StatCard key={key} {...cardProps} />
        ))}
      </div>

      {/* ============ TWO-COLUMN ============ */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* ---- Schedule ---- */}
        <div
          className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-3"
          style={{ borderRadius: '16px' }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2
              className="text-lg font-semibold text-[#15201F]"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              {t('schedule.title', { defaultValue: "Today's Schedule" })}
            </h2>
            <Link
              to="/en/bookings"
              className="inline-flex items-center gap-1 rounded-lg border border-gray-300 p-2 text-sm font-medium text-[#0E5C5B] transition-colors hover:bg-gray-100 hover:shadow-sm"
            >
              {t('schedule.viewAll', { defaultValue: 'View all' })}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th
                    style={{ fontFamily: "'Sora', sans-serif" }}
                    className="pb-3 text-left text-xs font-semibold tracking-wide text-[#9AA7A6] uppercase"
                  >
                    {t('schedule.customer', { defaultValue: 'Customer' })}
                  </th>
                  <th className="pb-3 text-left text-xs font-semibold tracking-wide text-[#9AA7A6] uppercase">
                    {t('schedule.service', { defaultValue: 'Service' })}
                  </th>
                  <th className="pb-3 text-left text-xs font-semibold tracking-wide text-[#9AA7A6] uppercase">
                    {t('schedule.time', { defaultValue: 'Time' })}
                  </th>
                  <th className="pb-3 text-left text-xs font-semibold tracking-wide text-[#9AA7A6] uppercase">
                    {t('schedule.status', { defaultValue: 'Status' })}
                  </th>
                </tr>
              </thead>
              <tbody>
                {todaysBookings.slice(0, 6).map((booking) => (
                  <tr
                    key={booking.id}
                    className="border-b border-gray-50 transition-colors last:border-0 hover:bg-gray-50/50"
                  >
                    <td className="py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                          style={{ backgroundColor: getCustomerColor(booking.customer) }}
                        >
                          {getCustomerInitials(booking.customer)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-[#15201F]">
                            {getCustomerName(booking.customer)}
                          </p>
                          <p className="truncate text-xs text-[#5A6968]">{booking.vehicle}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 text-sm text-[#15201F]">{booking.service}</td>
                    <td className="py-3.5 text-sm font-medium text-[#5A6968]">{booking.time}</td>
                    <td className="py-3.5">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                          statusStyles[booking.status] || 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {t(`status.${booking.status}`, {
                          defaultValue: booking.status.replace('_', ' '),
                        })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ---- Revenue Chart ---- */}
        <div
          className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-2"
          style={{ borderRadius: '16px' }}
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2
                className="text-lg font-semibold text-[#15201F]"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                {t('revenue.title', { defaultValue: 'Revenue this week' })}
              </h2>
            </div>
          </div>

          <div className="mb-4">
            {revenueLoading ? (
              <p
                className="text-2xl font-bold text-gray-300"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                ...
              </p>
            ) : (
              <>
                <p
                  className="text-2xl font-bold text-[#15201F]"
                  style={{ fontFamily: "'Sora', sans-serif" }}
                >
                  {weeklyTotal.toLocaleString()}{' '}
                  <span className="text-sm font-medium text-[#5A6968]">{currency}</span>
                </p>
                <p className="mt-0.5 text-xs text-green-600">
                  {t('revenue.totalLabel', { defaultValue: 'Total this week' })}
                </p>
              </>
            )}
          </div>

          {revenueLoading ? (
            <div className="flex h-[260px] items-center justify-center text-sm text-gray-400">
              Loading chart...
            </div>
          ) : (
            <RevenueBarChart data={weeklyRevenue} />
          )}
        </div>
      </div>
    </div>
  );
}
