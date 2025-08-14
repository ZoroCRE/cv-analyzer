import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language.startsWith('ar');

  const toggleLang = () => {
    const newLang = isArabic ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
  };

  return (
    <label htmlFor="lang" className="relative inline-block w-[50px] h-[28px] cursor-pointer">
      <input 
        type="checkbox" 
        id="lang" 
        className="w-0 h-0 opacity-0" 
        onChange={toggleLang}
        checked={!isArabic}
      />
      <span className="absolute inset-0 rounded-full transition-colors bg-neutral-300 dark:bg-primary-dark"></span>
      <span 
        className={`absolute left-[3px] bottom-[3px] flex items-center justify-center h-[22px] w-[22px] rounded-full bg-white transition-transform duration-300 transform ${!isArabic ? 'translate-x-[22px]' : ''}`}
      >
        <span className="text-sm font-bold text-primary-dark">
          {isArabic ? 'ع' : 'E'}
        </span>
      </span>
    </label>
  );
}