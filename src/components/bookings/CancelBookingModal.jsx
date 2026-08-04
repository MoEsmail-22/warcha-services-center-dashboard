import { AlertTriangle } from 'lucide-react';
import { Button, Modal } from '@/components/ui';
import { useAppTranslation } from '@/hooks/useAppTranslation';

/** Shared cancellation confirmation used by Bookings and the Jobs Board. */
export default function CancelBookingModal({ open, itemName, onClose, onConfirm }) {
  const { t } = useAppTranslation('bookings');

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('cancellation.title')}
      size="sm"
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            {t('cancellation.keep')}
          </Button>
          <Button type="button" variant="danger" onClick={onConfirm}>
            {t('cancellation.confirm')}
          </Button>
        </>
      }
    >
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <div className="flex gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <p className="text-sm font-semibold text-amber-900">
              {t('cancellation.message', { name: itemName })}
            </p>
            <p className="mt-2 text-sm text-amber-800">{t('cancellation.feeWarning')}</p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
