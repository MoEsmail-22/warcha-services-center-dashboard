import { useEffect, useState } from 'react';
import { BadgePercent, Plus } from 'lucide-react';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNotify } from '@/hooks/useNotify';
import { loadAllServiceOptions } from '@/contexts/ServicesContext';
import { PAGE_SIZE_OPTIONS, usePaginationParams } from '@/hooks/usePaginationParams';
import Pagination from '@/components/widgets/Pagination';
import { EmptyState } from '@/components/widgets/EmptyState';
import {
  Button,
  Card,
  Input,
  Modal,
  Select,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from '@/components/ui';
import { createOffer, toOfferPayload } from '@/API/offersApi';

const EMPTY_FORM = {
  serviceId: '',
  discountPercentage: '',
  startAt: '',
  endAt: '',
};
const OFFERS_STORAGE_KEY = 'workshop_offers';

function loadOffers(storageKey) {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
    return Array.isArray(saved) ? saved.filter((offer) => offer?.id && offer?.startAt) : [];
  } catch {
    return [];
  }
}

function formatDate(value, language) {
  return new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG' : 'en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export default function Offers() {
  const { t } = useAppTranslation('services');
  const { isRTL, lang } = useLanguage();
  const { user } = useAuth();
  // All services for the dropdown; the Services table above only holds one page.
  const [services, setServices] = useState([]);
  const offerText = (key, defaultValue) => t(`offers.${key}`, { defaultValue });
  const storageKey = `${OFFERS_STORAGE_KEY}:${user?.id ?? user?.userId ?? 'unknown'}`;
  const [offers, setOffers] = useState(() => loadOffers(storageKey));
  const [form, setForm] = useState(EMPTY_FORM);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const notify = useNotify();

  // ?offersPage=2&offersSize=20 — prefixed so it doesn't clash with the Services table.
  const { page, pageSize, setPage, setPageSize } = usePaginationParams('offers');
  const totalPages = Math.max(1, Math.ceil(offers.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visibleOffers = offers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const hasServices = services.length > 0;
  const isFormValid =
    form.serviceId !== '' &&
    Number(form.discountPercentage) > 0 &&
    Number(form.discountPercentage) <= 100 &&
    form.startAt !== '' &&
    form.endAt !== '' &&
    new Date(form.endAt) > new Date(form.startAt);

  useEffect(() => {
    // Refresh the options each time the dialog opens, so new services show up.
    if (!modalOpen && services.length > 0) return;

    let cancelled = false;
    loadAllServiceOptions()
      .then((options) => {
        if (!cancelled) setServices(options);
      })
      .catch(() => {
        // The dialog shows "Add a service first" when the list stays empty.
      });

    return () => {
      cancelled = true;
    };
  }, [modalOpen, services.length]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(offers));
    } catch {
      // Keep the table usable when browser storage is unavailable.
    }
  }, [offers, storageKey]);

  const serviceName = (serviceId) => {
    const service = services.find((item) => String(item.id) === String(serviceId));
    return service ? service.name[lang] || service.name.en : `#${serviceId}`;
  };

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setForm(EMPTY_FORM);
  };

  const addOffer = async (event) => {
    event.preventDefault();
    if (!isFormValid || saving) return;

    setSaving(true);

    try {
      await createOffer(form);

      // The API has no GET for offers yet, so the table keeps a local copy.
      setOffers((current) => [
        ...current,
        { id: `${Date.now()}-${Math.random()}`, ...toOfferPayload(form) },
      ]);
      setModalOpen(false);
      setForm(EMPTY_FORM);
      notify.success('offerCreated');
    } catch (error) {
      notify.error(error, 'offer.create');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="flex w-full min-w-0 flex-1 flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#15201F]">{offerText('title', 'Offers')}</h2>
          <p className="mt-1 text-xs text-[#5A6968]">
            {offerText('subtitle', 'Manage service discounts and offer dates.')}
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="gap-2 self-start sm:self-auto">
          <Plus className="h-4 w-4" />
          {offerText('addOffer', 'Add offer')}
        </Button>
      </div>

      <Card padded={false} className="flex flex-1 flex-col">
        <div className="flex-1 overflow-x-auto px-4 pb-4">
          <Table className={offers.length ? 'w-full min-w-[560px]' : 'w-full'}>
            <THead>
              <TR className="hover:bg-gray-50">
                <TH className="px-3 py-2.5 whitespace-nowrap">
                  {offerText('table.service', 'Service')}
                </TH>
                <TH className="px-3 py-2.5 whitespace-nowrap">
                  {offerText('table.discountPercentage', 'Discount percentage')}
                </TH>
                <TH className="px-3 py-2.5 whitespace-nowrap">
                  {offerText('table.startAt', 'Starts at')}
                </TH>
                <TH className="px-3 py-2.5 whitespace-nowrap">
                  {offerText('table.endAt', 'Ends at')}
                </TH>
              </TR>
            </THead>
            <TBody>
              {offers.length === 0 ? (
                <TR>
                  <TD colSpan={4}>
                    <EmptyState
                      icon={<BadgePercent />}
                      title={offerText('empty', 'No offers yet.')}
                      description={offerText(
                        'emptyDescription',
                        'Create a discount on a service for a set time.'
                      )}
                    />
                  </TD>
                </TR>
              ) : (
                visibleOffers.map((offer) => (
                  <TR key={offer.id}>
                    <TD className="px-3 py-2.5 font-medium whitespace-nowrap">
                      {serviceName(offer.serviceId)}
                    </TD>
                    <TD className="px-3 py-2.5 whitespace-nowrap">{offer.discountPercentage}%</TD>
                    <TD className="px-3 py-2.5 whitespace-nowrap">
                      <time dateTime={offer.startAt}>{formatDate(offer.startAt, lang)}</time>
                    </TD>
                    <TD className="px-3 py-2.5 whitespace-nowrap">
                      <time dateTime={offer.endAt}>{formatDate(offer.endAt, lang)}</time>
                    </TD>
                  </TR>
                ))
              )}
            </TBody>
          </Table>
        </div>

        {offers.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={offers.length}
            pageSize={pageSize}
            onPageChange={setPage}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            onPageSizeChange={setPageSize}
          />
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={offerText('modal.title', 'Add an offer')}
        footer={
          <>
            <Button type="button" variant="outline" onClick={closeModal} disabled={saving}>
              {offerText('actions.cancel', 'Cancel')}
            </Button>
            <Button
              type="submit"
              form="add-offer-form"
              disabled={!hasServices || !isFormValid || saving}
            >
              {saving ? offerText('saving', 'Saving…') : offerText('addOffer', 'Add offer')}
            </Button>
          </>
        }
      >
        <form id="add-offer-form" onSubmit={addOffer} className="grid gap-4 sm:grid-cols-2">
          <Select
            id="offer-service"
            label={offerText('fields.service', 'Service')}
            value={form.serviceId}
            onChange={(event) => updateField('serviceId', event.target.value)}
            disabled={!hasServices}
            required
          >
            <option value="">{offerText('fields.selectService', 'Choose a service')}</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name[lang] || service.name.en}
              </option>
            ))}
          </Select>
          <Input
            id="offer-discount-percentage"
            type="number"
            min="1"
            max="100"
            step="0.01"
            label={offerText('fields.discountPercentage', 'Discount percentage')}
            value={form.discountPercentage}
            onChange={(event) => updateField('discountPercentage', event.target.value)}
            required
          />
          <Input
            id="offer-start-at"
            type="datetime-local"
            label={offerText('fields.startAt', 'Starts at')}
            value={form.startAt}
            onChange={(event) => updateField('startAt', event.target.value)}
            required
          />
          <Input
            id="offer-end-at"
            type="datetime-local"
            min={form.startAt || undefined}
            label={offerText('fields.endAt', 'Ends at')}
            value={form.endAt}
            onChange={(event) => updateField('endAt', event.target.value)}
            required
          />
          {!hasServices && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 sm:col-span-2">
              {offerText('noServices', 'Add a service first to create an offer.')}
            </p>
          )}
        </form>
      </Modal>
    </section>
  );
}
