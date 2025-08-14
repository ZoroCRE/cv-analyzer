import { useTranslation } from 'react-i18next';
import { useTheme } from '@/providers/ThemeProvider'; // Corrected Path
import { Sun, Moon, Languages } from 'lucide-react';

export default function GlobalToggles() {
  const { theme, toggleTheme } = useTheme();
  const { i18n } = useTranslation();
  const isArabic = i18n.language.startsWith('ar');

  const toggleLang = () => {
    const newLang = isArabic ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
  };
  
  return (
    <>
      <div className="fixed top-4 left-4 z-20">
        <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </div>
      <div className="fixed top-4 right-4 z-20">
        <button onClick={toggleLang} className="p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700">
            <Languages size={20} />
        </button>
      </div>
    </>
  );
}