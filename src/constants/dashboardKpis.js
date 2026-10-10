// The Dashboard's KPI cards: label keys and icon names only. Values come from
// the feature contexts (bookings, reviews) in DashboardPage.
export const KPI_CARD_DEFINITIONS = [
  {
    key: 'todays-bookings',
    labelKey: 'kpi.todaysBookings',
    defaultLabel: "Today's bookings",
    icon: 'calendar',
    iconBg: 'bg-teal-50',
  },
  {
    key: 'cars-in-service',
    labelKey: 'kpi.carsInService',
    defaultLabel: 'Cars in service',
    icon: 'car',
    iconBg: 'bg-teal-50',
  },
  {
    key: 'revenue-today',
    labelKey: 'kpi.revenueToday',
    defaultLabel: 'Revenue today',
    icon: 'wallet',
    iconBg: 'bg-teal-50',
  },
  {
    key: 'average-rating',
    labelKey: 'kpi.avgRating',
    defaultLabel: 'Average rating',
    icon: 'star',
    iconBg: 'bg-amber-50',
  },
];
