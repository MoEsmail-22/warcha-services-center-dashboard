import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Card, Toggle } from '@/components/ui';
import FormHookInput from '@/components/ui/FormHookInput';
import { ErrorState, ResponsiveAccordion, SkeletonCard } from '@/components/widgets';
import { useSettings } from '@/contexts/SettingsContext';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import GoogleMapsPreview from '@/components/settings/GoogleMapsPreview';
import LocationPicker from '@/components/settings/LocationPicker';
import WorkingHoursEditor from '@/components/settings/WorkingHoursEditor';

const PROFILE_FIELDS = [
  { key: 'name', type: 'text', translationKey: 'workshopName' },
  { key: 'address', type: 'text', translationKey: 'address' },
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
      hostname === 'goo.gl' ||
      hostname.endsWith('.google.com') ||
      hostname === 'google.com'
    );
  } catch {
    return false;
  }
}

function hasCoordinates(location) {
  return (
    Number.isFinite(Number(location?.latitude)) && Number.isFinite(Number(location?.longitude))
  );
}

function getFirstOpeningHours(workingHours) {
  return Object.values(workingHours || {}).find(
    (hours) => hours?.enabled && hours.open && hours.close
  );
}

export default function SettingsPage() {
  const { t } = useAppTranslation('settings');
  const { data, loading, error, updateWorkshop, saveWorkshopProfile, togglePreference } =
    useSettings();
  const [workshopForm, setWorkshopForm] = useState(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [preferenceError, setPreferenceError] = useState('');
  const [locationError, setLocationError] = useState('');
  const initializedForm = useRef(false);
  const {
    register,
    handleSubmit: submitForm,
    reset,
  } = useForm({
    defaultValues: {
      name: '',
      address: '',
      phone: '',
      secondaryPhone: '',
      googleMapsUrl: '',
    },
  });

  useEffect(() => {
    if (data?.workshop && !initializedForm.current) {
      reset({
        name: data.workshop.name || '',
        address: data.workshop.address || '',
        phone: data.workshop.phone || '',
        secondaryPhone: data.workshop.secondaryPhone || '',
        googleMapsUrl: data.workshop.location?.googleMapsUrl || '',
      });
      initializedForm.current = true;
    }
  }, [data?.workshop, reset]);

  const handleSubmit = async (formValues) => {
    setSaveError('');

    const enteredMapsUrl = formValues.googleMapsUrl?.trim() || '';
    const currentLocation = data.workshop.location;
    const savedMapsUrl = currentLocation?.googleMapsUrl || '';

    // A workshop needs either a map pin or a Google Maps link. A previously
    // saved value still counts when the user edits another profile field.
    if (!hasCoordinates(currentLocation) && !enteredMapsUrl && !savedMapsUrl) {
      setLocationError(
        t('locationRequired', { defaultValue: 'Choose a map location or add a Google Maps link.' })
      );
      return;
    }

    if (enteredMapsUrl && !isGoogleMapsUrl(enteredMapsUrl)) {
      setLocationError(
        t('invalidGoogleMapsUrl', { defaultValue: 'Enter a valid Google Maps link.' })
      );
      return;
    }

    // Empty fields keep their existing placeholder value; only typed fields change.
    const nextWorkshop = Object.fromEntries(
      PROFILE_FIELDS.map(({ key }) => [key, formValues[key]?.trim() || data.workshop[key] || ''])
    );

    const updates = {
      ...nextWorkshop,
      location: enteredMapsUrl
        ? { ...currentLocation, googleMapsUrl: enteredMapsUrl }
        : currentLocation,
    };
    const storedUser = JSON.parse(localStorage.getItem('auth_user') || 'null');
    const openingHours = getFirstOpeningHours(data.workshop.workingHours);
    const profileData = {
      workshopId: storedUser?.userId || storedUser?.id || 0,
      name: nextWorkshop.name,
      phone: nextWorkshop.phone,
      googleMapsLink: enteredMapsUrl || savedMapsUrl,
      address: nextWorkshop.address,
      lat: Number(currentLocation?.latitude) || 0,
      lng: Number(currentLocation?.longitude) || 0,
      openingTime: openingHours?.open || '',
      closingTime: openingHours?.close || '',
    };

    setSaving(true);
    try {
      await saveWorkshopProfile(updates, profileData);
      reset({ name: '', address: '', phone: '', secondaryPhone: '', googleMapsUrl: '' });
      setLocationError('');
      setSaved(true);
    } catch (err) {
      setSaveError(err.message || t('saveError', { defaultValue: 'Unable to save changes.' }));
    } finally {
      setSaving(false);
    }
  };

  const handlePreferenceToggle = async (key) => {
    setPreferenceError('');
    try {
      await togglePreference(key);
    } catch (err) {
      setPreferenceError(err.message || 'Unable to save preference.');
    }
  };

  if (error) {
    return (
      <ErrorState
        title={t('loadError', { defaultValue: 'Unable to load settings' })}
        description={error}
      />
    );
  }

  if (loading || !data?.workshop) {
    return (
      <div className="grid gap-4 lg:grid-cols-5">
        <SkeletonCard className="h-96 lg:col-span-3" rounded="xl" />
        <SkeletonCard className="h-72 lg:col-span-2" rounded="xl" />
      </div>
    );
  }

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
            <form onSubmit={submitForm(handleSubmit)} className="space-y-4 p-5">
              {/* Fields come from one definition so adding a profile field stays simple. */}
              {PROFILE_FIELDS.map((field) => (
                <FormHookInput
                  key={field.key}
                  id={`workshop-${field.key}`}
                  type={field.type}
                  label={t(field.translationKey)}
                  placeholder={
                    data.workshop[field.key] ||
                    (field.placeholderKey ? t(field.placeholderKey) : '')
                  }
                  register={register}
                  name={field.key}
                  rules={{ onChange: () => setSaved(false) }}
                />
              ))}

              <FormHookInput
                id="workshop-google-maps-url"
                type="url"
                label={t('googleMapsUrl')}
                placeholder={data.workshop.location?.googleMapsUrl || t('googleMapsUrlPlaceholder')}
                error={locationError}
                register={register}
                name="googleMapsUrl"
                rules={{
                  onChange: () => {
                    setSaved(false);
                    setLocationError('');
                  },
                }}
              />
              <LocationPicker
                value={data.workshop.location}
                onChange={(location) => {
                  updateWorkshop({ location });
                  setLocationError('');
                  setSaved(false);
                }}
              />

              <WorkingHoursEditor
                value={data.workshop.workingHours}
                onChange={(workingHours) => {
                  updateWorkshop({ workingHours });
                  setSaved(false);
                }}
              />

              <div className="flex flex-wrap items-center gap-3 pt-0.5">
                <Button type="submit" className="min-h-10 px-5" disabled={saving}>
                  {t('saveChanges', { defaultValue: 'Save changes' })}
                </Button>
                {saveError && <p className="text-sm font-medium text-red-600">{saveError}</p>}
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
                {preferenceError && (
                  <p className="border-b border-red-100 bg-red-50 px-5 py-3 text-sm text-red-600">
                    {preferenceError}
                  </p>
                )}
                {PREFERENCE_FIELDS.map((preference) => (
                  <div
                    key={preference.key}
                    className="border-b border-gray-200 px-5 py-4 last:border-b-0"
                  >
                    <Toggle
                      id={`preference-${preference.key}`}
                      label={t(preference.translationKey)}
                      checked={Boolean(data.preferences[preference.key])}
                      onChange={() => handlePreferenceToggle(preference.key)}
                    />
                  </div>
                ))}
              </div>
            </ResponsiveAccordion>
          </Card>

          <GoogleMapsPreview location={data.workshop.location} />
        </div>
      </div>
    </div>
  );
}
