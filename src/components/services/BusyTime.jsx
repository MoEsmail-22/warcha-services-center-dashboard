import { useEffect, useState } from 'react';
import { Clock3, Plus, Trash2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNotify } from '@/hooks/useNotify';
import { Button, Card, Input, Modal, Table, TBody, TD, TH, THead, TR } from '@/components/ui';
import { clearWorkshopBusy, setWorkshopBusy, toBusyPayload } from '@/API/busyApi';

const EMPTY_FORM = {
  startAt: '',
  endAt: '',
};
const BUSY_TIMES_STORAGE_KEY = 'workshop_busy_times';

function loadBusyTimes(storageKey) {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (!Array.isArray(saved)) return [];

    return saved
      .map((item) => {
        // Older entries stored a start time plus a duration in hours.
        if (item?.startAt && item?.durationHours) {
          const start = new Date(item.startAt);
          return {
            id: item.id,
            busyFrom: start.toISOString(),
            busyUntil: new Date(start.getTime() + item.durationHours * 3600000).toISOString(),
          };
        }
        return item;
      })
      .filter(
        (item) =>
          item &&
          typeof item.id === 'string' &&
          Date.parse(item.busyUntil) > Date.parse(item.busyFrom)
      );
  } catch {
    return [];
  }
}

function formatDate(value, language) {
  const date = new Date(value);
  const locale = language === 'ar' ? 'ar-EG' : 'en-GB';

  return {
    date: new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date),
    time: new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' }).format(date),
  };
}

export default function BusyTime() {
  const { t } = useAppTranslation('services');
  const { isRTL, lang } = useLanguage();
  const { user } = useAuth();
  const location = useLocation();
  const workshopKey = user?.workshopId ?? user?.id ?? user?.userId ?? user?.email ?? 'unknown';
  const storageKey = `${BUSY_TIMES_STORAGE_KEY}:${workshopKey}`;
  const busyText = (key, defaultValue) => t(`busyTime.${key}`, { defaultValue });
  const notify = useNotify();
  const [busyTimes, setBusyTimes] = useState(() => loadBusyTimes(storageKey));
  const [form, setForm] = useState(EMPTY_FORM);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  const isFormValid =
    form.startAt !== '' && form.endAt !== '' && new Date(form.endAt) > new Date(form.startAt);

  useEffect(() => {
    if (location.hash === '#busy-time') {
      document.getElementById('busy-time')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location.hash]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(busyTimes));
    } catch {
      // Keep the table usable when browser storage is unavailable.
    }
  }, [busyTimes, storageKey]);

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setForm(EMPTY_FORM);
  };

  const addBusyTime = async (event) => {
    event.preventDefault();
    if (!isFormValid || saving) return;

    setSaving(true);

    try {
      await setWorkshopBusy(form);

      // The API keeps one busy period per workshop and has no GET, so the table
      // holds a local copy of the latest one.
      setBusyTimes([{ id: `${Date.now()}-${Math.random()}`, ...toBusyPayload(form) }]);
      setModalOpen(false);
      setForm(EMPTY_FORM);
      notify.success('busySet');
    } catch (error) {
      // The dialog stays open so the user can fix the times and retry.
      notify.error(error, 'busy.set');
    } finally {
      setSaving(false);
    }
  };

  const removeBusyTime = async (id) => {
    if (removingId) return;

    setRemovingId(id);

    try {
      await clearWorkshopBusy();
      setBusyTimes((current) => current.filter((item) => item.id !== id));
      notify.success('busyRemoved');
    } catch (error) {
      notify.error(error, 'busy.remove');
    } finally {
      setRemovingId(null);
    }
  };

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  return (
    <section
      id="busy-time"
      className="w-full min-w-0 flex-1 scroll-mt-20 border-t border-[#E8E2D8] pt-7"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E8F1EF] text-[#0E5C5B]">
            <Clock3 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#15201F]">{busyText('title', 'Busy time')}</h2>
            <p className="mt-1 text-xs text-[#5A6968]">
              {busyText('subtitle', 'Manage workshop unavailable times.')}
            </p>
          </div>
        </div>
        <Button onClick={() => setModalOpen(true)} className="gap-2 self-start sm:self-auto">
          <Plus className="h-4 w-4" />
          {busyText('add', 'Add busy time')}
        </Button>
      </div>

      <Card padded={false}>
        <div className="overflow-x-auto px-4 pb-4">
          <Table className="w-full min-w-[680px]">
            <THead>
              <TR className="hover:bg-gray-50">
                <TH className="px-4 py-3 text-start text-xs font-semibold whitespace-nowrap text-[#5A6968]">
                  {busyText('table.startAt', 'Starts at')}
                </TH>
                <TH className="px-4 py-3 text-start text-xs font-semibold whitespace-nowrap text-[#5A6968]">
                  {busyText('table.duration', 'Duration')}
                </TH>
                <TH className="px-4 py-3 text-start text-xs font-semibold whitespace-nowrap text-[#5A6968]">
                  {busyText('table.endAt', 'Ends at')}
                </TH>
                <TH className="px-4 py-3 text-end text-xs font-semibold whitespace-nowrap text-[#5A6968]">
                  {busyText('table.actions', 'Actions')}
                </TH>
              </TR>
            </THead>
            <TBody>
              {busyTimes.length === 0 ? (
                <TR>
                  <TD colSpan={4} className="px-3 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#F6F3EE] text-[#8A8074]">
                        <Clock3 className="h-5 w-5" />
                      </div>
                      <p className="text-sm font-semibold text-[#1C1712]">
                        {busyText('empty', 'No busy times added.')}
                      </p>
                    </div>
                  </TD>
                </TR>
              ) : (
                busyTimes.map((busyTime) => {
                  const durationHours =
                    (Date.parse(busyTime.busyUntil) - Date.parse(busyTime.busyFrom)) / 3600000;
                  const duration = new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-GB', {
                    maximumFractionDigits: 2,
                  }).format(durationHours);
                  const durationUnit =
                    durationHours === 1
                      ? busyText('units.hour', 'hour')
                      : busyText('units.hours', 'hours');
                  const start = formatDate(busyTime.busyFrom, lang);
                  const end = formatDate(busyTime.busyUntil, lang);

                  return (
                    <TR key={busyTime.id} className="transition-colors hover:bg-[#FAF9F6]">
                      <TD className="px-4 py-3 whitespace-nowrap">
                        <time dateTime={busyTime.busyFrom} className="flex flex-col gap-0.5">
                          <span className="font-semibold text-[#1C1712]">{start.date}</span>
                          <span className="text-xs text-[#7D7166]">{start.time}</span>
                        </time>
                      </TD>
                      <TD className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex rounded-full bg-[#E8F1EF] px-3 py-1 text-sm font-semibold text-[#0E5C5B]">
                          {duration} {durationUnit}
                        </span>
                      </TD>
                      <TD className="px-4 py-3 whitespace-nowrap">
                        <time dateTime={busyTime.busyUntil} className="flex flex-col gap-0.5">
                          <span className="font-medium text-[#1C1712]">{end.date}</span>
                          <span className="text-xs text-[#7D7166]">{end.time}</span>
                        </time>
                      </TD>
                      <TD className="px-4 py-3 text-end whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => removeBusyTime(busyTime.id)}
                          disabled={removingId !== null}
                          className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                          aria-label={busyText('actions.delete', 'Delete busy time')}
                          title={busyText('actions.delete', 'Delete busy time')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </TD>
                    </TR>
                  );
                })
              )}
            </TBody>
          </Table>
        </div>
      </Card>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={busyText('modal.title', 'Add busy time')}
        footer={
          <>
            <Button type="button" variant="outline" onClick={closeModal} disabled={saving}>
              {busyText('actions.cancel', 'Cancel')}
            </Button>
            <Button type="submit" form="busy-time-form" disabled={!isFormValid || saving}>
              {saving ? busyText('saving', 'Saving…') : busyText('add', 'Set as busy')}
            </Button>
          </>
        }
      >
        <form id="busy-time-form" onSubmit={addBusyTime} className="grid gap-4 sm:grid-cols-2">
          <Input
            id="busy-time-start-at"
            type="datetime-local"
            label={busyText('fields.startAt', 'Starts at')}
            value={form.startAt}
            onChange={(event) => updateField('startAt', event.target.value)}
            required
          />
          <Input
            id="busy-time-end-at"
            type="datetime-local"
            min={form.startAt || undefined}
            label={busyText('fields.endAt', 'Ends at')}
            value={form.endAt}
            onChange={(event) => updateField('endAt', event.target.value)}
            required
          />
        </form>
      </Modal>
    </section>
  );
}
