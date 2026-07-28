import { createContext, useContext } from 'react';
import mockBookings from '../mocks/bookings.json';
import mockCustomers from '../mocks/customers.json';
import mockVehicles from '../mocks/vehicles.json';
import mockServices from '../mocks/services.json';
import mockTechnicians from '../mocks/technicians.json';
import { createBookingViewModels } from '../utils/bookingHelpers';

const BookingsContext = createContext(null);

const bookings = createBookingViewModels({
  bookings: mockBookings,
  customers: mockCustomers,
  vehicles: mockVehicles,
  services: mockServices,
  technicians: mockTechnicians,
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
