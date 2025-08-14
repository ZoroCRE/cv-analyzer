import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Logo from '@/assets/logo.svg';
import GlobalToggles from '@/components/GlobalToggles';

export default function Landing() {
  const { t } = useTranslation();

  return (
    <div className="bg-white dark:bg-dark-bg">
      {}
      <GlobalToggles />
      <main>
        <div className="relative isolate px-6 pt-14 lg:px-8">
          <div className="absolute inset-x-0 overflow-hidden -top-40 -z-10 transform-gpu blur-3xl sm:-top-80" aria-hidden="true">
            <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-secondary to-primary opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
          </div>
          <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
            <div className="text-center">
              {}
              <img className="h-16 w-auto mx-auto mb-8" src={Logo} alt={t('appName')} />
              <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-dark-subtle sm:text-6xl font-heading">
                {t('landing.heroTitle')}
              </h1>
              <p className="mt-6 text-lg leading-8 text-neutral-800 dark:text-dark-text">
                {t('landing.heroSubtitle')}
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link to="/signup" className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark">
                  {t('landing.ctaButton')}
                </Link>
                <Link to="/login" className="text-sm font-semibold leading-6 text-neutral-900 dark:text-dark-text">
                   {t('landing.login')} <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};