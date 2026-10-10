import { lazy } from 'react';

// Page code, keyed by the URL segment after the language (/en/<segment>).
const pageLoaders = {
  '': () => import('../pages/DashboardPage/index'),
  jobs: () => import('../pages/JobsBoardPage'),
  bookings: () => import('../pages/BookingsPage'),
  quotes: () => import('../pages/QuotesPage'),
  services: () => import('../pages/ServicesPricingPage'),
  reviews: () => import('../pages/ReviewsPage'),
  settings: () => import('../pages/SettingsPage'),
  login: () => import('../pages/AuthPage/LoginPage'),
  register: () => import('../pages/AuthPage/RegisterPage'),
  'reset-password': () => import('../pages/AuthPage/ResetPasswordPage'),
};

const PUBLIC_PAGES = ['login', 'register', 'reset-password'];

export const DashboardPage = lazy(pageLoaders['']);
export const JobsBoardPage = lazy(pageLoaders.jobs);
export const BookingsPage = lazy(pageLoaders.bookings);
export const QuotesPage = lazy(pageLoaders.quotes);
export const ServicesPricingPage = lazy(pageLoaders.services);
export const ReviewsPage = lazy(pageLoaders.reviews);
export const SettingsPage = lazy(pageLoaders.settings);

export const LoginPage = lazy(pageLoaders.login);
export const RegisterPage = lazy(pageLoaders.register);
export const ResetPasswordPage = lazy(pageLoaders['reset-password']);

/**
 * Starts downloading the code of the page in the address bar right away, instead of
 * waiting until the app has rendered and reached that route.
 * Logged-out visitors of a protected page get the login page instead.
 */
export function preloadCurrentPage() {
  const segment = window.location.pathname.split('/')[2] ?? '';
  let loggedIn = false;
  try {
    loggedIn = Boolean(localStorage.getItem('auth_user'));
  } catch {
    // Storage blocked; treat as logged out.
  }
  const page = loggedIn || PUBLIC_PAGES.includes(segment) ? segment : 'login';
  // A failed download is ignored here; the page's own lazy load shows the error.
  pageLoaders[page]?.().catch(() => {});
}
