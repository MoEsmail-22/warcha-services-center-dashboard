import { MapPinned } from 'lucide-react';
import { useAppTranslation } from '@/hooks/useAppTranslation';

function coordinatesFromGoogleMapsUrl(value) {
  if (!value) return null;

  const patterns = [
    /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
    /(?:[?&](?:q|query|destination)=)(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
    /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/,
  ];
  const match = patterns.map((pattern) => value.match(pattern)).find(Boolean);

  return match ? { latitude: Number(match[1]), longitude: Number(match[2]) } : null;
}

/**
 * Read-only Google iframe generated from the coordinates confirmed in Leaflet.
 */
export default function GoogleMapsPreview({ location }) {
  const { t } = useAppTranslation('settings');
  const urlCoordinates = coordinatesFromGoogleMapsUrl(location?.googleMapsUrl);
  const latitude = Number(location?.latitude ?? urlCoordinates?.latitude);
  const longitude = Number(location?.longitude ?? urlCoordinates?.longitude);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  const previewUrl = `https://www.google.com/maps?q=${latitude},${longitude}&z=16&output=embed`;

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="flex items-center gap-2 border-b border-gray-200 px-5 py-4">
        <MapPinned className="h-5 w-5 text-primary" aria-hidden="true" />
        <h2 className="text-base font-semibold text-[#15201F]">{t('locationPreview')}</h2>
      </div>

      <iframe
        title={t('locationPreview')}
        src={previewUrl}
        className="h-64 w-full border-0"
        loading="lazy"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </section>
  );
}
