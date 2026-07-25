import { useAppTranslation } from '@/hooks/useAppTranslation';

export default function Footer() {
  const { t } = useAppTranslation('common');
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-white px-4 py-4 sm:px-6">
      <div className="flex flex-col items-center justify-between gap-1.5 text-center text-xs text-gray-500 sm:flex-row sm:text-start">
        <p>
          {t('footer.copyright', {
            year: currentYear,
            defaultValue: `© ${currentYear} Warsha. All rights reserved.`,
          })}
        </p>
        <p>
          {t('footer.tagline', {
            defaultValue: 'Workshop management made simpler.',
          })}
        </p>
      </div>
    </footer>
  );
}
