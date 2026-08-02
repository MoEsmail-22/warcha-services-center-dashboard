import { Suspense } from 'react';
import { createBrowserRouter, redirect } from 'react-router-dom';
import RouteFallback from '../components/ui/RouteFallback';
import AppLayout from '../components/layout/AppLayout';
import AuthLayout from '../components/layout/AuthLayout';
import ProtectedRoute from './ProtectedRoute';
import { LanguageProvider } from '../contexts/LanguageContext';
import {
  DashboardPage,
  JobsBoardPage,
  BookingsPage,
  QuotesPage,
  ServicesPricingPage,
  ReviewsPage,
  SettingsPage,
  GoogleMapsLinkSettingsDemoPage,
  LoginPage,
  RegisterPage,
} from './lazyPages';
import DevPage from '../pages/DevPage'; // Direct import (not lazy) — it's a dev tool

const withSuspense = (node) => <Suspense fallback={<RouteFallback />}>{node}</Suspense>;
const googleMapsLinkDemoEnabled =
  import.meta.env.VITE_ENABLE_GOOGLE_MAPS_LINK_DEMO === 'true';

export const router = createBrowserRouter([
  // ---------- Root redirect ----------
  {
    path: '/',
    loader: () => redirect('/en/'),
  },

  // ---------- Language-prefixed routes ----------
  {
    path: '/:lang',
    children: [
      // ===== STANDALONE /dev ROUTE (no sidebar/topbar, but needs LanguageProvider) =====
      {
        path: 'dev',
        element: <LanguageProvider>{withSuspense(<DevPage />)}</LanguageProvider>,
      },

      // ===== PUBLIC AUTH ROUTES =====
      {
        path: 'login',
        element: <AuthLayout>{withSuspense(<LoginPage />)}</AuthLayout>,
      },
      {
        path: 'register',
        element: <AuthLayout>{withSuspense(<RegisterPage />)}</AuthLayout>,
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
          ...(googleMapsLinkDemoEnabled
            ? [
                {
                  path: 'settings-google-link-demo',
                  element: withSuspense(<GoogleMapsLinkSettingsDemoPage />),
                },
              ]
            : []),
        ],
      },
    ],
  },
]);

export default router;
