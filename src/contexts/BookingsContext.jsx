import { createContext, useContext } from 'react';
import mockBookings from '../mocks/bookings.json';
import mockServices from '../mocks/services.json';
import { createBookingViewModels } from '../utils/bookingHelpers';

const BookingsContext = createContext(null);

// Customer, vehicle, and technician pages were retired along with their
// standalone mock datasets. Keep booking records self-contained instead of
// importing data that no longer exists.
const getReferenceRecords = (idKey, createRecord) =>
  [...new Set(mockBookings.map((booking) => booking[idKey]))].map(createRecord);

const bookingCustomers = getReferenceRecords('customerId', (id) => ({
  id,
  fullName: `Customer ${id.replace('C-', '#')}`,
}));

const bookingVehicles = getReferenceRecords('vehicleId', (id) => ({
  id,
  brand: 'Vehicle',
  model: id.replace('V-', '#'),
  year: '',
}));

const bookingTechnicians = getReferenceRecords('technicianId', (id) => ({
  id,
  fullName: `Technician ${id.replace('T-', '#')}`,
}));

const bookings = createBookingViewModels({
  bookings: mockBookings,
  customers: bookingCustomers,
  vehicles: bookingVehicles,
  services: mockServices,
  technicians: bookingTechnicians,
});

const today = new Date().toISOString().slice(0, 10);
const yesterdayDate = new Date();
yesterdayDate.setDate(yesterdayDate.getDate() - 1);
const yesterday = yesterdayDate.toISOString().slice(0, 10);
const todaysBookings = bookings.filter((booking) => booking.date === today);
const yesterdaysCount = bookings.filter((booking) => booking.date === yesterday).length;

const contextValue = {
  bookings,
  todaysBookings,
  todaysCount: todaysBookings.length,
  yesterdaysCount,
  difference: todaysBookings.length - yesterdaysCount,
};

export function BookingsProvider({ children }) {
  return <BookingsContext.Provider value={contextValue}>{children}</BookingsContext.Provider>;
}

export function useBookings() {
  const context = useContext(BookingsContext);
  if (!context) throw new Error('useBookings must be used inside a <BookingsProvider>');
  return context;
}
