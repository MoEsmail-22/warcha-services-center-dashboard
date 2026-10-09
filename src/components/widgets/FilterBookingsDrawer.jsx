import { useEffect, useState } from 'react';
import { Search, Calendar, ChevronDown } from 'lucide-react';
import Drawer from '../ui/Drawer';
import { useAppTranslation } from '../../hooks/useAppTranslation';

const SERVICE_TYPES = ['Brake Check', 'Oil Change', 'Engine', 'AC Repair'];
const STATUSES = ['Pending', 'Confirmed', 'In Progress', 'Completed'];

/** `value` holds the filters currently applied (read from the URL), shown when the drawer opens. */
export default function FilterBookingsDrawer({ open, onClose, onApply, value }) {
  const { t } = useAppTranslation('bookings');
  const [search, setSearch] = useState('');
  const [services, setServices] = useState([]);
  const [status, setStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    if (!open) return;
    setSearch(value?.search ?? '');
    setServices(value?.services ?? []);
    setStatus(value?.status ?? '');
    setDateFrom(value?.dateFrom ?? '');
    setDateTo(value?.dateTo ?? '');
  }, [open, value]);

  const toggleService = (s) =>
    setServices((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const handleApply = (e) => {
    e.preventDefault();
    onApply?.({ search, services, status, dateFrom, dateTo });
    onClose();
  };

  const handleReset = () => {
    setSearch('');
    setServices([]);
    setStatus('');
    setDateFrom('');
    setDateTo('');
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={t('filterTitle', { defaultValue: 'Filter Bookings' })}
      subtitle={t('filterSubtitle', { defaultValue: 'Narrow down your results' })}
      width="max-w-md"
      footer={
        <div className="flex justify-between gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            {t('reset', { defaultValue: 'Reset' })}
          </button>
          <button
            type="submit"
            form="filter-bookings-form"
            className="flex-1 rounded-lg px-6 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#0E5C5B' }}
          >
            {t('applyFilters', { defaultValue: 'Apply Filters' })}
          </button>
        </div>
      }
    >
      <form id="filter-bookings-form" onSubmit={handleApply} className="space-y-6">
        {/* ---- SEARCH ---- */}
        <Section label={t('searchLabel', { defaultValue: 'SEARCH' })}>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('searchCustomer', { defaultValue: 'Search customer name...' })}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pr-3 pl-9 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#0E5C5B] focus:ring-2 focus:ring-[#0E5C5B]/10 focus:outline-none"
            />
          </div>
        </Section>

        {/* ---- SERVICE TYPE ---- */}
        <Section label={t('serviceTypeLabel', { defaultValue: 'SERVICE TYPE' })}>
          <div className="grid grid-cols-2 gap-2.5">
            {SERVICE_TYPES.map((s) => (
              <label
                key={s}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Checkbox checked={services.includes(s)} onChange={() => toggleService(s)} />
                {s}
              </label>
            ))}
          </div>
        </Section>

        {/* ---- STATUS ---- */}
        <Section label={t('statusLabel', { defaultValue: 'STATUS' })}>
          <div className="relative">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={`w-full appearance-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 pr-9 text-sm focus:border-[#0E5C5B] focus:ring-2 focus:ring-[#0E5C5B]/10 focus:outline-none ${
                status ? 'text-gray-900' : 'text-gray-400'
              }`}
            >
              <option value="">{t('selectStatus', { defaultValue: 'Select status' })}</option>
              {STATUSES.map((s) => (
                <option key={s} value={s} className="text-gray-900">
                  {s}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
          <p className="mt-1.5 text-xs text-gray-400">
            {t('multiSelectHint', { defaultValue: 'Hold Ctrl/Cmd to select multiple' })}
          </p>
        </Section>

        {/* ---- DATE RANGE ---- */}
        <Section label={t('dateRangeLabel', { defaultValue: 'DATE RANGE' })}>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pr-9 pl-3 text-sm text-gray-900 focus:border-[#0E5C5B] focus:ring-2 focus:ring-[#0E5C5B]/10 focus:outline-none"
              />
              <Calendar className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
            <div className="relative">
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pr-9 pl-3 text-sm text-gray-900 focus:border-[#0E5C5B] focus:ring-2 focus:ring-[#0E5C5B]/10 focus:outline-none"
              />
              <Calendar className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </Section>
      </form>
    </Drawer>
  );
}

// ---- Helper sub-components ----
function Section({ label, children }) {
  return (
    <div>
      <p className="mb-2.5 text-xs font-semibold tracking-wide text-[#5A6968] uppercase">{label}</p>
      {children}
    </div>
  );
}

function Checkbox({ checked, onChange }) {
  return (
    <span
      onClick={(e) => {
        e.preventDefault();
        onChange();
      }}
      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
        checked ? 'border-[#0E5C5B] bg-[#0E5C5B]' : 'border-gray-300 bg-white'
      }`}
    >
      {checked && (
        <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
          <path
            d="M2 6l3 3 5-5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
  );
}
