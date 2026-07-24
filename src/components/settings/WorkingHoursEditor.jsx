import { useEffect, useMemo, useState } from 'react';
import { Clock3 } from 'lucide-react';
import { Button, Modal, Toggle } from '@/components/ui';
import { useAppTranslation } from '@/hooks/useAppTranslation';

const WEEK_DAYS = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

const DEFAULT_OPEN_TIME = '09:00';
const DEFAULT_CLOSE_TIME = '17:00';

function cloneSchedule(schedule = {}) {
  return Object.fromEntries(
    WEEK_DAYS.map((day) => [
      day,
      {
        enabled: Boolean(schedule[day]?.enabled),
        open: schedule[day]?.open ?? '',
        close: schedule[day]?.close ?? '',
      },
    ])
  );
}

/**
 * Fills missing hours from the first enabled day.
 * If that first day is also empty, normal business-hour defaults are used.
 */
function normalizeSchedule(schedule) {
  const enabledDays = WEEK_DAYS.filter((day) => schedule[day]?.enabled);
  if (enabledDays.length === 0) return cloneSchedule(schedule);

  const firstDay = schedule[enabledDays[0]];
  const fallbackOpen = firstDay.open || DEFAULT_OPEN_TIME;
  const fallbackClose = firstDay.close || DEFAULT_CLOSE_TIME;

  return Object.fromEntries(
    WEEK_DAYS.map((day) => {
      const current = schedule[day];
      if (!current.enabled) return [day, { enabled: false, open: '', close: '' }];

      return [
        day,
        {
          enabled: true,
          open: current.open || fallbackOpen,
          close: current.close || fallbackClose,
        },
      ];
    })
  );
}

function formatTime(value, locale) {
  if (!value) return '';
  const [hours, minutes] = value.split(':').map(Number);
  const time = new Date(2000, 0, 1, hours, minutes);
  return new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(time);
}

/**
 * Groups neighboring working days that share the same hours.
 * Example: Saturday - Thursday, 9:00 AM - 10:00 PM.
 */
function buildSummaryGroups(schedule) {
  const groups = [];

  WEEK_DAYS.forEach((day) => {
    const hours = schedule?.[day];
    if (!hours?.enabled) return;

    const previous = groups.at(-1);
    if (previous && previous.open === hours.open && previous.close === hours.close) {
      previous.days.push(day);
      return;
    }

    groups.push({ days: [day], open: hours.open, close: hours.close });
  });

  return groups;
}

export default function WorkingHoursEditor({ value, onChange }) {
  const { t, i18n } = useAppTranslation('settings');
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(() => cloneSchedule(value));
  const locale = i18n.language?.startsWith('ar') ? 'ar-EG' : 'en-US';

  useEffect(() => {
    if (open) setDraft(cloneSchedule(value));
  }, [open, value]);

  const summaryGroups = useMemo(
    () => buildSummaryGroups(normalizeSchedule(cloneSchedule(value))),
    [value]
  );

  const updateDay = (day, updates) => {
    setDraft((current) => ({
      ...current,
      [day]: { ...current[day], ...updates },
    }));
  };

  const handleApply = () => {
    onChange(normalizeSchedule(draft));
    setOpen(false);
  };

  return (
    <section aria-labelledby="working-hours-heading">
      <div className="mb-2">
        <div>
          <h3 id="working-hours-heading" className="text-sm font-medium text-gray-700">
            {t('workingHours')}
          </h3>
          <p className="mt-0.5 text-xs text-gray-500">{t('workingHoursDescription')}</p>
        </div>
      </div>

      {/* Saved schedule summary shown directly in the Settings form. */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
        {summaryGroups.length === 0 ? (
          <p className="text-sm text-gray-500">{t('closedAllWeek')}</p>
        ) : (
          <div className="space-y-1.5">
            {summaryGroups.map((group) => {
              const firstDay = t(`days.${group.days[0]}`);
              const lastDay = t(`days.${group.days.at(-1)}`);
              const dayLabel =
                group.days.length === 1 ? firstDay : t('dayRange', { from: firstDay, to: lastDay });

              return (
                <div
                  key={`${group.days[0]}-${group.days.at(-1)}`}
                  className="flex flex-wrap items-center justify-between gap-2 text-sm"
                >
                  <span className="font-medium text-gray-700">{dayLabel}</span>
                  <span className="text-gray-600">
                    {formatTime(group.open, locale)} - {formatTime(group.close, locale)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Primary action is below the summary, so it is easier to find. */}
      <Button
        type="button"
        size="sm"
        className="mt-3 w-full shadow-sm sm:w-auto"
        onClick={() => setOpen(true)}
      >
        <Clock3 className="h-4 w-4" />
        {summaryGroups.length > 0 ? t('editWorkingHours') : t('setWorkingHours')}
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={t('workingHoursModalTitle')}
        size="lg"
        closeLabel={t('close')}
        contentClassName="px-4 py-3 sm:px-6"
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t('cancel')}
            </Button>
            <Button type="button" onClick={handleApply}>
              {t('applyWorkingHours')}
            </Button>
          </>
        }
      >
        <p className="mb-4 text-sm text-gray-500">{t('workingHoursModalDescription')}</p>

        <div className="space-y-2">
          {WEEK_DAYS.map((day) => {
            const daySchedule = draft[day];

            return (
              <div
                key={day}
                className="grid gap-3 rounded-xl border border-gray-200 p-3 sm:grid-cols-[minmax(150px,1fr)_130px_130px] sm:items-center"
              >
                <Toggle
                  id={`working-day-${day}`}
                  label={t(`days.${day}`)}
                  checked={daySchedule.enabled}
                  onChange={(enabled) => updateDay(day, { enabled })}
                />

                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-gray-500">
                    {t('opensAt')}
                  </span>
                  <input
                    type="time"
                    value={daySchedule.open}
                    disabled={!daySchedule.enabled}
                    onChange={(event) => updateDay(day, { open: event.target.value })}
                    className="input disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-gray-500">
                    {t('closesAt')}
                  </span>
                  <input
                    type="time"
                    value={daySchedule.close}
                    disabled={!daySchedule.enabled}
                    onChange={(event) => updateDay(day, { close: event.target.value })}
                    className="input disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                  />
                </label>
              </div>
            );
          })}
        </div>

        <p className="bg-primary-50 text-primary-700 mt-4 rounded-lg px-3 py-2 text-xs">
          {t('workingHoursFallbackHelp')}
        </p>
      </Modal>
    </section>
  );
}
