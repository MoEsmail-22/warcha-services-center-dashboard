import { Suspense } from 'react';
import { createBrowserRouter, redirect } from 'react-router-dom';
import RouteFallback from '../components/ui/RouteFallback';
import AppLayout from '../components/layout/AppLayout';
import AuthLayout from '../components/layout/AuthLayout';
import ProtectedRoute from './ProtectedRoute';
import NotFoundPage from '../pages/NotFoundPage';
import {
  DashboardPage,
  JobsBoardPage,
  BookingsPage,
  QuotesPage,
  ServicesPricingPage,
  ReviewsPage,
  SettingsPage,
  LoginPage,
  RegisterPage,
  ResetPasswordPage,
} from './lazyPages';

const withSuspense = (node) => <Suspense fallback={<RouteFallback />}>{node}</Suspense>;
const SUPPORTED_LANGS = ['en', 'ar'];

// Error screen for crashes inside any route; AuthLayout supplies the language.
const routeErrorElement = <AuthLayout>{withSuspense(<NotFoundPage variant="error" />)}</AuthLayout>;

export const router = createBrowserRouter([
  // ---------- Root redirect ----------
  {
    path: '/',
    loader: () => redirect('/en/'),
    errorElement: routeErrorElement,
  },

  // ---------- Language-prefixed routes ----------
  {
    path: '/:lang',
    // Paths without a language prefix (e.g. /bookings) get /en added in front.
    loader: ({ params, request }) => {
      if (SUPPORTED_LANGS.includes(params.lang)) return null;
      const { pathname, search, hash } = new URL(request.url);
      return redirect(`/en${pathname}${search}${hash}`);
    },
    errorElement: routeErrorElement,
    children: [
      // ===== PUBLIC AUTH ROUTES =====
      {
        path: 'login',
        element: <AuthLayout>{withSuspense(<LoginPage />)}</AuthLayout>,
      },
      {
        path: 'register',
        element: <AuthLayout>{withSuspense(<RegisterPage />)}</AuthLayout>,
      },
      {
        path: 'reset-password',
        element: <AuthLayout>{withSuspense(<ResetPasswordPage />)}</AuthLayout>,
      },

      // ===== PROTECTED APP ROUTES (with sidebar + topbar) =====
      {
        element: (
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: withSuspense(<DashboardPage />) },
          { path: 'jobs', element: withSuspense(<JobsBoardPage />) },
          { path: 'bookings', element: withSuspense(<BookingsPage />) },
          { path: 'quotes', element: withSuspense(<QuotesPage />) },
          { path: 'services', element: withSuspense(<ServicesPricingPage />) },
          { path: 'reviews', element: withSuspense(<ReviewsPage />) },
          { path: 'settings', element: withSuspense(<SettingsPage />) },
        ],
      },

      // ===== 404 =====
      {
        path: '*',
        element: <AuthLayout>{withSuspense(<NotFoundPage />)}</AuthLayout>,
      },
    ],
  },
]);

export default router;
