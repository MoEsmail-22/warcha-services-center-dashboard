import { NavLink, useParams } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import navItems from '../../utils/navItems';
import { useAppTranslation } from '../../hooks/useAppTranslation';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSettings } from '../../contexts/SettingsContext';
import ProPlanCard from '../widgets/ProPlanCard';
import logo from '@/assets/warsha_logo.png';

/**
 * Sidebar
 * - Desktop: fixed left rail (right in RTL), collapsible to icon-only
 * - Mobile: hidden by default, slides in as drawer with backdrop
 * - Custom dark scrollbar via .sidebar-scroll class
 *
 * Props:
 *   collapsed   boolean   — desktop icon-only mode
 *   onCollapse  function  — toggle desktop collapse
 *   mobileOpen  boolean   — mobile drawer visibility
 *   onMobileClose function — close mobile drawer
 */
export default function Sidebar({
  collapsed = false,
  onCollapse,
  mobileOpen = false,
  onMobileClose,
}) {
  const { t } = useAppTranslation('nav');
  const { isRTL } = useLanguage();
  const { data: settings } = useSettings();
  const { lang = 'en' } = useParams();

  return (
    <>
      {/* ---------- Mobile backdrop ---------- */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* ---------- Sidebar ---------- */}
      <aside
        className={[
          // base styles
          'flex h-full flex-col bg-[#0A4746] text-white transition-all duration-300 ease-in-out',
          // width: collapsed vs expanded
          collapsed ? 'w-20' : 'w-[220px]',
          // mobile: fixed drawer
          'fixed inset-y-0 z-50 lg:static',
          // slide-in direction depends on RTL
          isRTL
            ? `right-0 transition-transform ${mobileOpen ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0`
            : `left-0 transition-transform ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`,
        ].join(' ')}
        aria-label="Main navigation"
      >
        {/* ===== Header ===== */}
        <div
          className={[
            'flex h-20 items-center border-b border-white/10 bg-[#0A4746]',
            collapsed ? 'justify-center px-2' : 'px-5',
          ].join(' ')}
        >
          <div className="flex items-center gap-1 overflow-hidden">
            <div className="flex w-14 shrink-0 items-center justify-center rounded-full shadow-md">
              <img src={logo} alt="Logo" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-lg leading-tight font-semibold text-white">
                  {t('brand.name', { defaultValue: 'Warsha' })}
                </p>
                <p className="truncate text-xs text-gray-300">
                  {settings?.workshop?.name ||
                    t('brand.subtitle', { defaultValue: 'Ahmed Auto Service' })}
                </p>
              </div>
            )}
          </div>

          {/* Mobile close button */}
          <button
            onClick={onMobileClose}
            className="ms-auto rounded-md p-1.5 text-white/70 hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ===== Nav items — uses .sidebar-scroll for custom scrollbar ===== */}
        <nav className="sidebar-scroll flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.key}>
                  <NavLink
                    to={`/${lang}/${item.path}`}
                    end={item.path === ''}
                    onClick={onMobileClose}
                    title={collapsed ? t(item.labelKey) : undefined}
                    className={({ isActive }) =>
                      [
                        'group relative flex items-center rounded-lg text-sm font-medium transition-colors',
                        collapsed ? 'justify-center px-2 py-3' : 'px-3 py-2.5',
                        isActive
                          ? 'border border-[#FF7905] text-[#FF7905] shadow-sm'
                          : 'text-[#FF7905] hover:bg-white/10',
                      ].join(' ')
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {/* Active accent border — left in LTR, right in RTL */}
                        {isActive && (
                          <span
                            className={[
                              'absolute top-1/2 h-7 w-1 -translate-y-1/2 rounded-full bg-amber-500',
                              isRTL ? 'right-0' : 'left-0',
                            ].join(' ')}
                            aria-hidden="true"
                          />
                        )}
                        <Icon className={['h-5 w-5 shrink-0', collapsed ? '' : 'me-3'].join(' ')} />
                        {!collapsed && (
                          <span className="truncate">
                            {t(item.labelKey, { defaultValue: item.key })}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* ===== Footer (ProPlanCard + collapse toggle) ===== */}
        <div className="border-t border-white/10 p-3">
          {!collapsed && <ProPlanCard />}

          {/* Desktop collapse button */}
          {onCollapse && (
            <button
              onClick={onCollapse}
              className="mt-2 hidden w-full items-center justify-center rounded-lg p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white lg:flex"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isRTL ? (
                collapsed ? (
                  <ChevronRight className="h-5 w-5" />
                ) : (
                  <ChevronLeft className="h-5 w-5" />
                )
              ) : collapsed ? (
                <ChevronLeft className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
