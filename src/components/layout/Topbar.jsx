/**
 * Topbar — the white header bar at the top of every dashboard page.
 *
 * Layout (left to right):
 *   [☰]                    [🔍 Search...]            [AR] [AA Ahmed Auto ▼]
 *                                                       (mobile only shows dropdown)
 *
 * Matches Figma:
 *   - NO page title on the left (the search bar takes that space on desktop)
 *   - Avatar in a rounded SQUARE (teal background, white initials)
 *   - User name + role ("Owner") next to avatar
 *
 * Props:
 *   onMenuClick → function called when hamburger is clicked (opens sidebar drawer)
 *   user        → the current user object from AuthContext { name, email, ... }
 */
import { useState, useRef, useEffect } from 'react';
import { Menu, Search, Globe, LogOut, Settings as SettingsIcon, ChevronDown } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAppTranslation } from '../../hooks/useAppTranslation';
import { useAuth } from '../../contexts/AuthContext';

export default function Topbar({ onMenuClick, user }) {
  const { lang, toggleLanguage } = useLanguage();
  const { t } = useAppTranslation('common');

  return (
    <header className="flex h-16 items-center gap-3 border-b border-gray-200 bg-white px-4 lg:px-6">
      {/* ===== LEFT: Hamburger (mobile only) ===== */}
      <button
        onClick={onMenuClick}
        className="rounded-md p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* ===== CENTER: Search bar (desktop only — too cramped on mobile) ===== */}
      <div className="hidden flex-1 items-center justify-start lg:flex">
        <div className="relative w-full max-w-md">
          <Search
            className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder={t('actions.search', {
              defaultValue: 'Search bookings, customers, plates...',
            })}
            className="focus:border-primary focus:ring-primary w-full rounded-lg border border-gray-200 bg-gray-50 py-2 ps-9 pe-3 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:ring-1 focus:outline-none"
          />
        </div>
      </div>

      {/* Spacer on mobile so the right-side icons push to the end */}
      <div className="flex-1 lg:hidden" />

      {/* ===== RIGHT: Language + user menu ===== */}
      <div className="ms-auto flex items-center gap-2">
        {/* Language toggle — desktop only */}
        <button
          onClick={toggleLanguage}
          className="hidden items-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 lg:flex"
          aria-label="Toggle language"
        >
          <Globe className="h-4 w-4" />
          {lang === 'en' ? 'AR' : 'EN'}
        </button>

        {/* User avatar + dropdown menu */}
        <UserMenu user={user} />
      </div>
    </header>
  );
}

/**
 * UserMenu — avatar button + dropdown with Settings / Language / Logout.
 *
 * Matches Figma:
 *   - Avatar inside a rounded SQUARE (teal background, white initials)
 *   - User name + role ("Owner") next to avatar
 *   - Chevron down on mobile (signals dropdown)
 *
 * The language toggle inside the dropdown is MOBILE ONLY (lg:hidden)
 * because desktop has its own language button in the topbar.
 */
function UserMenu({ user }) {
  const { lang, toggleLanguage } = useLanguage();
  const { logout } = useAuth();
  const { t } = useAppTranslation('common');
  const navigate = useNavigate();
  const { lang: urlLang = 'en' } = useParams();

  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown when clicking outside of it
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // Close dropdown on Escape key
  useEffect(() => {
    if (!open) return;
    const handleEsc = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open]);

  const initials = user?.name?.charAt(0).toUpperCase() ?? 'U';

  // Handlers — each closes the dropdown then performs its action
  const handleSettings = () => {
    setOpen(false);
    navigate(`/${urlLang}/settings`);
  };

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate(`/${urlLang}/login`);
  };

  const handleLanguage = () => {
    setOpen(false);
    toggleLanguage();
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar button — square shape with name + role beside it */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-md p-1 hover:bg-gray-100"
        aria-label="User menu"
        aria-expanded={open}
      >
        {/* Avatar — rounded SQUARE, teal background, white initials */}
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#E08B2F] to-[#C8730A] text-sm font-semibold text-white shadow-sm">
          {initials}
        </div>

        {/* Name + role — hidden on mobile (too cramped) */}
        {/* Two lines: name on top (medium weight), role below (smaller, gray) */}
        <div className="hidden text-start leading-tight sm:block">
          <p className="text-sm font-medium text-gray-900">{user?.name}</p>
          <p className="text-xs text-gray-500">{t('user.owner', { defaultValue: 'Owner' })}</p>
        </div>

        {/* Chevron — mobile only */}
        <ChevronDown className="h-4 w-4 text-gray-500 lg:hidden" />
      </button>

      {/* ===== Dropdown menu ===== */}
      {open && (
        <div className="absolute end-0 z-50 mt-2 w-56 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
          {/* User info header */}
          <div className="border-b border-gray-100 px-4 py-3">
            <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
            <p className="truncate text-xs text-gray-500">{user?.email}</p>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <button
              onClick={handleSettings}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <SettingsIcon className="h-4 w-4 text-gray-500" />
              {t('nav.settings', { defaultValue: 'Settings' })}
            </button>

            {/* Language toggle — MOBILE ONLY */}
            <button
              onClick={handleLanguage}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 lg:hidden"
            >
              <Globe className="h-4 w-4 text-gray-500" />
              {lang === 'en' ? 'العربية' : 'English'}
            </button>

            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              {t('actions.logout', { defaultValue: 'Log out' })}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
