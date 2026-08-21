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

function isShortenedGoogleMapsUrl(value) {
  try {
    const { hostname, pathname } = new URL(value);
    const normalizedHost = hostname.toLowerCase();

    return (
      normalizedHost === 'maps.app.goo.gl' ||
      (normalizedHost === 'goo.gl' && pathname.startsWith('/maps'))
    );
  } catch {
    return false;
  }
}

/**
 * Legacy preview kept only for demonstrating the earlier Google Maps URL flow.
 * Full URLs containing coordinates work without an API key; shortened URLs do not.
 */
export default function GoogleMapsUrlPreview({ googleMapsUrl }) {
  const { t } = useAppTranslation('settings');
  const coordinates = coordinatesFromGoogleMapsUrl(googleMapsUrl);
  const isShortenedUrl = isShortenedGoogleMapsUrl(googleMapsUrl);

  if (!googleMapsUrl) return null;

  // Google does not allow a reliable iframe preview for shortened share URLs.
  // Return no card at all so the user never sees a misleading map preview.
  if (isShortenedUrl) return null;

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
        <h2 className="text-base font-semibold text-[#15201F]">
          {t('locationPreview', { defaultValue: 'Workshop location' })}
        </h2>
      </div>

      {previewUrl ? (
        <iframe
          title={t('locationPreview', { defaultValue: 'Workshop location' })}
          src={previewUrl}
          className="h-64 w-full border-0"
          loading="lazy"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <div className="px-5 py-4">
          <p className="text-sm text-gray-600">
            {t('mapPreviewNeedsCoordinates', {
              defaultValue:
                'Paste a full Google Maps link containing coordinates, or configure the Google Maps Embed API key.',
            })}
          </p>
        </div>
      )}
    </section>
  );
}
