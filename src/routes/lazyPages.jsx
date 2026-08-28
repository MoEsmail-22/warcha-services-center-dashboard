import { lazy } from 'react';

export const DashboardPage = lazy(() => import('../pages/DashboardPage/index'));
export const JobsBoardPage = lazy(() => import('../pages/JobsBoardPage'));
export const BookingsPage = lazy(() => import('../pages/BookingsPage'));
export const QuotesPage = lazy(() => import('../pages/QuotesPage'));
export const ServicesPricingPage = lazy(() => import('../pages/ServicesPricingPage'));
export const ReviewsPage = lazy(() => import('../pages/ReviewsPage'));
export const SettingsPage = lazy(() => import('../pages/SettingsPage'));

export const LoginPage = lazy(() => import('../pages/AuthPage/LoginPage'));
export const RegisterPage = lazy(() => import('../pages/AuthPage/RegisterPage'));
export const ResetPasswordPage = lazy(() => import('../pages/AuthPage/ResetPasswordPage'));
