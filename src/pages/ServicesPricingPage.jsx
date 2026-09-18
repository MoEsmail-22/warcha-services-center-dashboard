import { useEffect, useState } from 'react';
import { MoreVertical, Pencil, Plus, Trash2 } from 'lucide-react';
import { useServices } from '@/contexts';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { Button, Modal, Table, TBody, TD, TH, THead, Toggle, TR } from '@/components/ui';
import ServiceFormModal from '@/components/services/ServiceFormModal';
import VehicleCatalogDemo from '@/components/services/VehicleCatalogDemo';

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
  const {
    data: services,
    loading,
    addService,
    updateService,
    toggleStatus,
    deleteService,
  } = useServices();

  const [formModal, setFormModal] = useState({ open: false, service: null });
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteStep, setDeleteStep] = useState(0);
  const [savingService, setSavingService] = useState(false);
  const [serviceSaveError, setServiceSaveError] = useState('');

  useEffect(() => {
    if (!activeMenuId) return undefined;

    const closeMenu = (event) => {
      if (!event.target.closest('[data-service-actions]')) setActiveMenuId(null);
    };

    document.addEventListener('mousedown', closeMenu);
    return () => document.removeEventListener('mousedown', closeMenu);
  }, [activeMenuId]);

  const closeFormModal = () => {
    if (savingService) return;
    setServiceSaveError('');
    setFormModal({ open: false, service: null });
  };

  const saveService = async (form) => {
    setServiceSaveError('');
    setSavingService(true);

    try {
      if (!formModal.service) {
        await addService(form);
      } else {
        await updateService(formModal.service.id, {
          name: { en: form.nameEn.trim(), ar: form.nameAr.trim() },
          description: {
            en: form.descriptionEn.trim(),
            ar: form.descriptionAr.trim(),
          },
          category: form.category,
          durationMinutes: Number(form.durationMinutes),
          price: {
            from: Number(form.minPricing),
            to: Number(form.maxPricing),
          },
          updatedAt: new Date().toISOString(),
        });
      }
      setFormModal({ open: false, service: null });
    } catch (error) {
      setServiceSaveError(
        error.message || t('saveError', { defaultValue: 'Unable to save service.' })
      );
    } finally {
      setSavingService(false);
    }
  };

  const requestDelete = (service) => {
    setActiveMenuId(null);
    setDeleteTarget(service);
    setDeleteStep(2);
  };

  const closeDeleteModal = () => {
    setDeleteTarget(null);
    setDeleteStep(0);
  };

  const confirmDelete = async () => {
    await deleteService(deleteTarget.id);
    closeDeleteModal();
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

        <Button
          onClick={() => setFormModal({ open: true, service: null })}
          className="gap-2 self-start sm:self-auto"
        >
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
                <TH className="text-end">{t('table.actions')}</TH>
              </TR>
            </THead>

            <TBody>
              {loading ? (
                <TR>
                  <TD colSpan={6} className="py-10 text-center text-gray-500">
                    {t('loading')}
                  </TD>
                </TR>
              ) : services.length === 0 ? (
                <TR>
                  <TD colSpan={6} className="py-10 text-center text-gray-500">
                    {t('noServices')}
                  </TD>
                </TR>
              ) : (
                services.map((service, index) => {
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
                      <TD className="text-end">
                        <div className="relative inline-block" data-service-actions>
                          <button
                            type="button"
                            onClick={() =>
                              setActiveMenuId((current) =>
                                current === service.id ? null : service.id
                              )
                            }
                            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-[#F2EDE4] hover:text-[#1C1712]"
                            aria-label={t('actions.openMenu', { name: service.name[lang] })}
                            aria-expanded={activeMenuId === service.id}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>

                          {activeMenuId === service.id && (
                            <div
                              className={`absolute end-0 z-20 w-44 overflow-hidden rounded-xl border border-[#E8E2D8] bg-white py-1 text-start shadow-lg ${
                                index >= services.length - 2 ? 'bottom-full mb-1' : 'top-full mt-1'
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuId(null);
                                  setFormModal({ open: true, service });
                                }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-[#1C1712] hover:bg-[#F6F3EE]"
                              >
                                <Pencil className="h-4 w-4 text-[#8A8074]" />
                                {t('actions.edit')}
                              </button>
                              <button
                                type="button"
                                onClick={() => requestDelete(service)}
                                className="flex w-full items-center gap-2 border-t border-[#F2EDE4] px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                                {t('actions.delete')}
                              </button>
                            </div>
                          )}
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

      <VehicleCatalogDemo />

      <ServiceFormModal
        open={formModal.open}
        service={formModal.service}
        onClose={closeFormModal}
        onSave={saveService}
        saving={savingService}
        error={serviceSaveError}
      />

      <Modal
        open={deleteStep === 2}
        onClose={closeDeleteModal}
        title={t('delete.finalTitle')}
        size="sm"
        dismissOnBackdrop={false}
        footer={
          <>
            <Button type="button" variant="outline" onClick={closeDeleteModal}>
              {t('actions.cancel')}
            </Button>
            <Button type="button" variant="danger" onClick={confirmDelete}>
              {t('delete.confirm')}
            </Button>
          </>
        }
      >
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-800">{t('delete.finalWarning')}</p>
          <p className="mt-2 text-sm text-red-700">
            {t('delete.serviceDetails', {
              id: deleteTarget?.id,
              name: deleteTarget?.name?.[lang] || deleteTarget?.name?.en,
            })}
          </p>
        </div>
      </Modal>
    </div>
  );
}
