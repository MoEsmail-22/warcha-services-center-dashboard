import { useEffect, useState } from 'react';
import { Button, Card, Input, Toggle } from '@/components/ui';
import { ErrorState, ResponsiveAccordion, SkeletonCard } from '@/components/widgets';
import { useSettings } from '@/contexts/SettingsContext';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import GoogleMapsPreview from '@/components/settings/GoogleMapsPreview';
import WorkingHoursEditor from '@/components/settings/WorkingHoursEditor';

const PROFILE_FIELDS = [
  { key: 'name', type: 'text', translationKey: 'workshopName' },
  { key: 'address', type: 'text', translationKey: 'address' },
  {
    key: 'googleMapsUrl',
    type: 'url',
    translationKey: 'googleMapsUrl',
    placeholderKey: 'googleMapsUrlPlaceholder',
  },
  { key: 'phone', type: 'tel', translationKey: 'phone' },
  {
    key: 'secondaryPhone',
    type: 'tel',
    translationKey: 'secondaryPhone',
    placeholderKey: 'secondaryPhonePlaceholder',
  },
];

const PREFERENCE_FIELDS = [
  { key: 'acceptOnlineBookings', translationKey: 'acceptOnlineBookings' },
  { key: 'showPrices', translationKey: 'showPrices' },
  { key: 'autoSendServiceUpdates', translationKey: 'autoSendUpdates' },
  { key: 'emailDailySummary', translationKey: 'emailDailySummary' },
];

function isGoogleMapsUrl(value) {
  try {
    const hostname = new URL(value).hostname.toLowerCase();
    return (
      hostname === 'maps.app.goo.gl' ||
      hostname === 'google.com' ||
      hostname.endsWith('.google.com')
    );
  } catch {
    return false;
  }
}

export default function SettingsPage() {
  const { t } = useAppTranslation('settings');
  const { data, loading, error, updateWorkshop, togglePreference } = useSettings();
  const [workshopForm, setWorkshopForm] = useState(null);
  const [formError, setFormError] = useState('');
  const [saved, setSaved] = useState(false);

  // Inputs start empty and use saved settings as placeholders. This keeps the
  // design clean while still showing the current value for every field.
  useEffect(() => {
    if (data?.workshop) setWorkshopForm({});
  }, [data?.workshop]);

  const handleFieldChange = (key, value) => {
    setSaved(false);
    setFormError('');
    setWorkshopForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const enteredMapUrl = workshopForm.googleMapsUrl?.trim();
    if (enteredMapUrl && !isGoogleMapsUrl(enteredMapUrl)) {
      setFormError(t('invalidGoogleMapsUrl'));
      return;
    }

    // Empty fields keep their existing placeholder value; only typed fields change.
    const nextWorkshop = Object.fromEntries(
      PROFILE_FIELDS.map(({ key }) => [key, workshopForm[key]?.trim() || data.workshop[key] || ''])
    );

    updateWorkshop(nextWorkshop);
    setWorkshopForm({});
    setSaved(true);
  };

  if (error) {
    return (
      <ErrorState
        title={t('loadError', { defaultValue: 'Unable to load settings' })}
        description={error}
      />
    );
  }

  if (loading || !workshopForm) {
    return (
      <div className="grid gap-4 lg:grid-cols-5">
        <SkeletonCard className="h-96 lg:col-span-3" rounded="xl" />
        <SkeletonCard className="h-72 lg:col-span-2" rounded="xl" />
      </div>
    );
  }

  // Preview a newly entered link immediately, or the saved link after the form is submitted.
  const locationUrl =
    workshopForm.googleMapsUrl === undefined
      ? data.workshop.googleMapsUrl
      : workshopForm.googleMapsUrl.trim();

  return (
    <div className="flex h-full flex-col">
      <header className="mb-5">
        <h1
          className="text-2xl font-bold text-[#15201F]"
          style={{ fontFamily: "'Sora', sans-serif" }}
        >
          {t('title', { defaultValue: 'Settings' })}
        </h1>
        <p className="mt-1 text-sm text-[#5A6968]">
          {t('subtitle', { defaultValue: 'Manage your workshop profile and account.' })}
        </p>
      </header>

      <div className="grid items-start gap-4 lg:grid-cols-5">
        <Card padded={false} className="lg:col-span-3">
          <ResponsiveAccordion
            title={t('workshopProfile', { defaultValue: 'Workshop profile' })}
            defaultOpen
          >
            <form onSubmit={handleSubmit} className="space-y-4 p-5">
              {/* Fields come from one definition so adding a profile field stays simple. */}
              {PROFILE_FIELDS.map((field) => (
                <Input
                  key={field.key}
                  id={`workshop-${field.key}`}
                  type={field.type}
                  label={t(field.translationKey)}
                  value={workshopForm[field.key] ?? ''}
                  placeholder={
                    data.workshop[field.key] ||
                    (field.placeholderKey ? t(field.placeholderKey) : '')
                  }
                  onChange={(event) => handleFieldChange(field.key, event.target.value)}
                />
              ))}

              <WorkingHoursEditor
                value={data.workshop.workingHours}
                onChange={(workingHours) => {
                  updateWorkshop({ workingHours });
                  setSaved(false);
                }}
              />

              <div className="flex flex-wrap items-center gap-3 pt-0.5">
                <Button type="submit" className="min-h-10 px-5">
                  {t('saveChanges', { defaultValue: 'Save changes' })}
                </Button>
                {formError && <p className="text-sm font-medium text-red-600">{formError}</p>}
                {saved && (
                  <p role="status" className="text-sm font-medium text-emerald-700">
                    {t('changesSaved', { defaultValue: 'Changes saved' })}
                  </p>
                )}
              </div>
            </form>
          </ResponsiveAccordion>
        </Card>

        <div className="space-y-4 lg:col-span-2">
          <Card padded={false}>
            <ResponsiveAccordion
              title={t('preferences', { defaultValue: 'Preferences' })}
              defaultOpen={false}
            >
              <div>
                {/* Preferences update immediately, matching the switch behavior in the design. */}
                {PREFERENCE_FIELDS.map((preference) => (
                  <div
                    key={preference.key}
                    className="border-b border-gray-200 px-5 py-4 last:border-b-0"
                  >
                    <Toggle
                      id={`preference-${preference.key}`}
                      label={t(preference.translationKey)}
                      checked={Boolean(data.preferences[preference.key])}
                      onChange={() => togglePreference(preference.key)}
                    />
                  </div>
                ))}
              </div>
            </ResponsiveAccordion>
          </Card>

          {isGoogleMapsUrl(locationUrl) && <GoogleMapsPreview googleMapsUrl={locationUrl} />}
        </div>
      </div>
    </div>
  );
}
