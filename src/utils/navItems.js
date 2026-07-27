/**
 * Sidebar navigation items.
 *
 * Each item has:
 *   key       — unique identifier
 *   labelKey  — translation key (looked up in nav.json)
 *   icon      — lucide-react icon component
 *   path      — URL path RELATIVE to /:lang (no leading slash)
 *               '' = index route (dashboard), 'jobs' = /:lang/jobs, etc.
 *
 * Order here = order in the sidebar.
 */
import {
  LayoutDashboard,
  Briefcase,
  CalendarDays,
  FileText,
  Wrench,
  Star,
  Settings as SettingsIcon,
} from 'lucide-react';

export const navItems = [
  { key: 'dashboard', labelKey: 'dashboard', icon: LayoutDashboard, path: '' },
  { key: 'jobs', labelKey: 'jobs', icon: Briefcase, path: 'jobs' },
  { key: 'bookings', labelKey: 'bookings', icon: CalendarDays, path: 'bookings' },
  { key: 'quotes', labelKey: 'quotes', icon: FileText, path: 'quotes' },
  { key: 'services', labelKey: 'services', icon: Wrench, path: 'services' },
  { key: 'reviews', labelKey: 'reviews', icon: Star, path: 'reviews' },
  { key: 'settings', labelKey: 'settings', icon: SettingsIcon, path: 'settings' },
];

export default navItems;
