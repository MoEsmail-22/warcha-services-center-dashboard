import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useServices } from '@/contexts';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import {
  Button,
  Input,
  Modal,
  Select,
  Table,
  TBody,
  TD,
  TH,
  THead,
  Toggle,
  TR,
} from '@/components/ui';

const INITIAL_FORM = {
  nameEn: '',
  nameAr: '',
  category: '',
  price: '',
  durationMinutes: '',
  descriptionEn: '',
  descriptionAr: '',
};

function formatDuration(minutes, language) {
  const value = Number(minutes);

  if (value < 60) {
    return language === 'ar' ? `${value} دقيقة` : `${value} min`;
  }

  const hours = value / 60;

  return language === 'ar'
    ? `${hours} ${hours === 1 ? 'ساعة' : 'ساعات'}`
    : `${hours} ${hours === 1 ? 'hr' : 'hrs'}`;
}

function formatPrice(price, language) {
  const amount =
    price.from === price.to
      ? price.from
      : `${price.from.toLocaleString()} - ${price.to.toLocaleString()}`;

  return language === 'ar' ? `${amount} ج.م` : `${amount.toLocaleString?.() ?? amount} EGP`;
}

export default function ServicesPricingPage() {
  const { t } = useAppTranslation('services');
  const { lang } = useLanguage();
  const { data: services, loading, addService, toggleStatus } = useServices();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setForm(INITIAL_FORM);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    addService(form);
    closeModal();
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="text-2xl font-bold text-[#15201F]"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            {t('title')}
          </h1>
          <p className="mt-1 text-sm text-[#5A6968]">{t('subtitle')}</p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} className="gap-2 self-start sm:self-auto">
          <Plus size={18} />
          {t('addService')}
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <THead>
              <TR className="hover:bg-gray-50">
                <TH>{t('table.serviceName')}</TH>
                <TH>{t('table.category')}</TH>
                <TH>{t('table.duration')}</TH>
                <TH>{t('table.price')}</TH>
                <TH>{t('table.status')}</TH>
              </TR>
            </THead>

            <TBody>
              {loading ? (
                <TR>
                  <TD colSpan={5} className="py-10 text-center text-gray-500">
                    {t('loading')}
                  </TD>
                </TR>
              ) : (
                services.map((service) => {
                  const isActive = service.status === 'active';

                  return (
                    <TR key={service.id}>
                      <TD className="font-medium">{service.name[lang] || service.name.en}</TD>
                      <TD className="text-gray-600 capitalize">
                        {t(`categories.${service.category}`, {
                          defaultValue: service.category,
                        })}
                      </TD>
                      <TD className="text-gray-600">
                        {formatDuration(service.durationMinutes, lang)}
                      </TD>
                      <TD className="text-gray-600">{formatPrice(service.price, lang)}</TD>
                      <TD>
                        <div className="flex items-center gap-3">
                          <Toggle
                            id={`service-status-${service.id}`}
                            checked={isActive}
                            onChange={() => toggleStatus(service.id)}
                          />
                          <span
                            className={
                              isActive
                                ? 'text-sm font-medium text-emerald-700'
                                : 'text-sm font-medium text-gray-500'
                            }
                          >
                            {isActive ? t('status.active') : t('status.inactive')}
                          </span>
                        </div>
                      </TD>
                    </TR>
                  );
                })
              )}
            </TBody>
          </Table>
        </div>
      </div>

      <Modal
        open={isModalOpen}
        onClose={closeModal}
        title={t('modal.title')}
        size="lg"
        footer={
          <>
            <Button type="button" variant="outline" onClick={closeModal}>
              {t('actions.cancel')}
            </Button>
            <Button type="submit" form="add-service-form">
              {t('actions.save')}
            </Button>
          </>
        }
      >
        <form id="add-service-form" onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              id="service-name-en"
              label={t('fields.nameEn')}
              value={form.nameEn}
              onChange={(event) => updateField('nameEn', event.target.value)}
              required
            />

            <Input
              id="service-name-ar"
              label={t('fields.nameAr')}
              value={form.nameAr}
              onChange={(event) => updateField('nameAr', event.target.value)}
              dir="rtl"
              required
            />

            <Select
              id="service-category"
              label={t('fields.category')}
              value={form.category}
              onChange={(event) => updateField('category', event.target.value)}
              required
            >
              <option value="" disabled>
                {t('fields.selectCategory')}
              </option>
              <option value="maintenance">{t('categories.maintenance')}</option>
              <option value="repair">{t('categories.repair')}</option>
              <option value="diagnostics">{t('categories.diagnostics')}</option>
              <option value="bodywork">{t('categories.bodywork')}</option>
            </Select>

            <Input
              id="service-price"
              type="number"
              min="0"
              step="0.01"
              label={t('fields.price')}
              value={form.price}
              onChange={(event) => updateField('price', event.target.value)}
              required
            />

            <Input
              id="service-duration"
              type="number"
              min="1"
              label={t('fields.duration')}
              value={form.durationMinutes}
              onChange={(event) => updateField('durationMinutes', event.target.value)}
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="service-description-en" className="label">
                {t('fields.descriptionEn')}
              </label>
              <textarea
                id="service-description-en"
                className="input min-h-24 resize-y"
                value={form.descriptionEn}
                onChange={(event) => updateField('descriptionEn', event.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="service-description-ar" className="label">
                {t('fields.descriptionAr')}
              </label>
              <textarea
                id="service-description-ar"
                dir="rtl"
                className="input min-h-24 resize-y"
                value={form.descriptionAr}
                onChange={(event) => updateField('descriptionAr', event.target.value)}
                required
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
