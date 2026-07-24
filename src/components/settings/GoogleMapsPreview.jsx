import { MapPinned } from 'lucide-react';
import { useAppTranslation } from '@/hooks/useAppTranslation';

const GOOGLE_MAPS_EMBED_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_EMBED_API_KEY;

function coordinatesFromGoogleMapsUrl(value) {
  if (!value) return null;

  const patterns = [
    /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
    /(?:[?&](?:q|query|destination)=)(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
    /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/,
  ];
  const match = patterns.map((pattern) => value.match(pattern)).find(Boolean);
  return match ? { latitude: match[1], longitude: match[2] } : null;
}

/**
 * Lazy Google map preview. Restrict the browser API key by HTTP referrer in Google Cloud.
 */
export default function GoogleMapsPreview({ googleMapsUrl }) {
  const { t } = useAppTranslation('settings');
  const coordinates = coordinatesFromGoogleMapsUrl(googleMapsUrl);

  if (!googleMapsUrl) return null;

  // A full Maps URL often contains @latitude,longitude. In that case we can
  // render Google's standard iframe immediately, without loading any map library.
  const coordinatePreviewUrl = coordinates
    ? `https://www.google.com/maps?q=${coordinates.latitude},${coordinates.longitude}&z=16&output=embed`
    : null;
  const embedApiUrl = GOOGLE_MAPS_EMBED_API_KEY
    ? `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_EMBED_API_KEY}&q=${encodeURIComponent(googleMapsUrl)}`
    : null;
  const previewUrl = coordinatePreviewUrl || embedApiUrl;

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="flex items-center gap-2 border-b border-gray-200 px-5 py-4">
        <MapPinned className="h-5 w-5 text-primary" aria-hidden="true" />
        <h2 className="text-base font-semibold text-[#15201F]">{t('locationPreview')}</h2>
      </div>

      {previewUrl ? (
        <iframe
          title={t('locationPreview')}
          src={previewUrl}
          className="h-64 w-full border-0"
          loading="lazy"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <div className="px-5 py-4">
          <p className="text-sm text-gray-600">{t('mapPreviewNeedsCoordinates')}</p>
        </div>
      )}
    </section>
  );
}
