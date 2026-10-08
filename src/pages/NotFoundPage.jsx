import { ArrowLeft, ArrowRight, Home, RotateCcw } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import Button from '@/components/ui/Button';
import brokenCar from '@/assets/broken-car.png';

/**
 * Shown for unknown URLs (variant "notFound") and, through the router's
 * errorElement, when a page crashes (variant "error").
 */
export default function NotFoundPage({ variant = 'notFound' }) {
  const { t } = useAppTranslation('common');
  const navigate = useNavigate();
  const { lang } = useParams();
  const currentLang = lang === 'ar' ? 'ar' : 'en';
  const isRTL = currentLang === 'ar';
  const isError = variant === 'error';
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="flex min-h-screen items-center justify-center bg-[#F6F3EE] px-4 py-10"
    >
      <div className="flex w-full max-w-md flex-col items-center text-center">
        <img
          src={brokenCar}
          alt=""
          aria-hidden="true"
          className="h-44 w-44 object-contain sm:h-56 sm:w-56"
        />

        {!isError && <p className="mt-4 text-5xl leading-none font-bold text-[#0E5C5B]">404</p>}

        <h1 className="mt-4 text-xl font-bold text-[#15201F] sm:text-2xl">
          {isError ? t('errorPage.errorTitle') : t('errorPage.notFoundTitle')}
        </h1>
        <p className="mt-2 text-sm text-[#5A6968]">
          {isError ? t('errorPage.errorText') : t('errorPage.notFoundText')}
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {isError ? (
            <Button onClick={() => window.location.reload()} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              {t('errorPage.retry')}
            </Button>
          ) : (
            <Button onClick={() => navigate(`/${currentLang}/`)} className="gap-2">
              <Home className="h-4 w-4" />
              {t('errorPage.home')}
            </Button>
          )}
          <Button
            variant="outline"
            // A direct visit has no in-app history to return to.
            onClick={() =>
              window.history.length > 1 ? navigate(-1) : navigate(`/${currentLang}/`)
            }
            className="gap-2"
          >
            <BackIcon className="h-4 w-4" />
            {t('errorPage.back')}
          </Button>
        </div>
      </div>
    </div>
  );
}
