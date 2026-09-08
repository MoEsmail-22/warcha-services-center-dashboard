import { useEffect, useState } from 'react';
import { Button, Input, Modal, Select } from '@/components/ui';
import { useAppTranslation } from '@/hooks/useAppTranslation';

const EMPTY_FORM = {
  nameEn: '',
  nameAr: '',
  category: '',
  minPricing: '',
  maxPricing: '',
  durationMinutes: '',
  descriptionEn: '',
  descriptionAr: '',
};

function serviceToForm(service) {
  if (!service) return EMPTY_FORM;

  return {
    nameEn: service.name?.en ?? '',
    nameAr: service.name?.ar ?? '',
    category: service.category ?? '',
    minPricing: String(service.price?.from ?? ''),
    maxPricing: String(service.price?.to ?? ''),
    durationMinutes: String(service.durationMinutes ?? ''),
    descriptionEn: service.description?.en ?? '',
    descriptionAr: service.description?.ar ?? '',
  };
}

/** One form is shared by both Add and Edit so their fields stay consistent. */
export default function ServiceFormModal({
  open,
  service,
  onClose,
  onSave,
  saving = false,
  error = '',
}) {
  const { t } = useAppTranslation('services');
  const [form, setForm] = useState(EMPTY_FORM);
  const isEditing = Boolean(service);

  useEffect(() => {
    if (open) setForm(serviceToForm(service));
  }, [open, service]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave(form);
  };

  const formId = isEditing ? 'edit-service-form' : 'add-service-form';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? t('modal.editTitle') : t('modal.title')}
      size="lg"
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            {t('actions.cancel')}
          </Button>
          <Button type="submit" form={formId} disabled={saving}>
            {isEditing ? t('actions.saveChanges') : t('actions.save')}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {isEditing && (
          <div className="rounded-lg border border-[#E8E2D8] bg-[#F6F3EE] px-3 py-2 text-sm">
            <span className="font-medium text-[#5A5045]">{t('fields.serviceId')}: </span>
            <span className="font-semibold text-[#1C1712]">{service.id}</span>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            id={`${formId}-name-en`}
            label={t('fields.nameEn')}
            value={form.nameEn}
            onChange={(event) => updateField('nameEn', event.target.value)}
            required
          />

          <Input
            id={`${formId}-name-ar`}
            label={t('fields.nameAr')}
            value={form.nameAr}
            onChange={(event) => updateField('nameAr', event.target.value)}
            dir="rtl"
            required
          />

          <Input
            id={`${formId}-min-pricing`}
            type="number"
            min="0"
            step="0.01"
            label={t('fields.minPricing')}
            value={form.minPricing}
            onChange={(event) => updateField('minPricing', event.target.value)}
            required
          />

          <Input
            id={`${formId}-max-pricing`}
            type="number"
            min={form.minPricing || '0'}
            step="0.01"
            label={t('fields.maxPricing')}
            value={form.maxPricing}
            onChange={(event) => updateField('maxPricing', event.target.value)}
            required
          />

          <Select
            id={`${formId}-category`}
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
            id={`${formId}-duration`}
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
            <label htmlFor={`${formId}-description-en`} className="label">
              {t('fields.descriptionEn')}
            </label>
            <textarea
              id={`${formId}-description-en`}
              className="input min-h-24 resize-y"
              value={form.descriptionEn}
              onChange={(event) => updateField('descriptionEn', event.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor={`${formId}-description-ar`} className="label">
              {t('fields.descriptionAr')}
            </label>
            <textarea
              id={`${formId}-description-ar`}
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
  );
}
