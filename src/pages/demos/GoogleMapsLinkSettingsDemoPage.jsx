import { useEffect, useState } from 'react';
import { Button, Card, Input, Toggle } from '@/components/ui';
import { ErrorState, ResponsiveAccordion, SkeletonCard } from '@/components/widgets';
import GoogleMapsUrlPreview from '@/components/settings/legacy/GoogleMapsUrlPreview';
import WorkingHoursEditor from '@/components/settings/WorkingHoursEditor';
import { useSettings } from '@/contexts/SettingsContext';
import { useAppTranslation } from '@/hooks/useAppTranslation';

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

/**
 * Disabled legacy demo of the original Google Maps URL settings experience.
 * Enable VITE_ENABLE_GOOGLE_MAPS_LINK_DEMO to register its protected route.
 */
export default function GoogleMapsLinkSettingsDemoPage() {
  const { t } = useAppTranslation('settings');
  const { data, loading, error, updateWorkshop, togglePreference } = useSettings();
  const [workshopForm, setWorkshopForm] = useState(null);
  const [formError, setFormError] = useState('');
  const [saved, setSaved] = useState(false);

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
      setFormError(
        t('invalidGoogleMapsUrl', { defaultValue: 'Enter a valid Google Maps link.' })
      );
      return;
    }

    const nextWorkshop = Object.fromEntries(
      PROFILE_FIELDS.map(({ key }) => [
        key,
        workshopForm[key]?.trim() || data.workshop[key] || '',
      ])
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
          {t('googleMapsLinkDemoSubtitle', {
            defaultValue: 'Legacy demo: add a Google Maps link and preview it in an iframe.',
          })}
        </p>
      </header>

      <div className="grid items-start gap-4 lg:grid-cols-5">
        <Card padded={false} className="lg:col-span-3">
          <ResponsiveAccordion
            title={t('workshopProfile', { defaultValue: 'Workshop profile' })}
            defaultOpen
          >
            <form onSubmit={handleSubmit} className="space-y-4 p-5">
              {PROFILE_FIELDS.map((field) => (
                <Input
                  key={field.key}
                  id={`legacy-workshop-${field.key}`}
                  type={field.type}
                  label={t(field.translationKey, {
                    defaultValue:
                      field.key === 'googleMapsUrl' ? 'Google Maps link' : undefined,
                  })}
                  value={workshopForm[field.key] ?? ''}
                  placeholder={
                    data.workshop[field.key] ||
                    (field.placeholderKey
                      ? t(field.placeholderKey, {
                          defaultValue:
                            field.key === 'googleMapsUrl'
                              ? 'Paste your Google Maps share link'
                              : '',
                        })
                      : '')
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
                {PREFERENCE_FIELDS.map((preference) => (
                  <div
                    key={preference.key}
                    className="border-b border-gray-200 px-5 py-4 last:border-b-0"
                  >
                    <Toggle
                      id={`legacy-preference-${preference.key}`}
                      label={t(preference.translationKey)}
                      checked={Boolean(data.preferences[preference.key])}
                      onChange={() => togglePreference(preference.key)}
                    />
                  </div>
                ))}
              </div>
            </ResponsiveAccordion>
          </Card>

          {isGoogleMapsUrl(locationUrl) && (
            <GoogleMapsUrlPreview googleMapsUrl={locationUrl} />
          )}
        </div>
      </div>
    </div>
  );
}
