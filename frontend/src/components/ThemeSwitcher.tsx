import { useTheme } from '../context/ThemeContext';

export default function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme();

  return (
    <label htmlFor="mode" className="relative inline-block w-[50px] h-[28px] cursor-pointer">
      <input 
        type="checkbox" 
        id="mode" 
        className="w-0 h-0 opacity-0" 
        onChange={toggleTheme} 
        checked={theme === 'dark'}
      />
      <span className="absolute inset-0 rounded-full transition-colors bg-neutral-300 dark:bg-primary-dark"></span>
      <span 
        className="absolute left-[3px] bottom-[3px] flex items-center justify-center h-[22px] w-[22px] rounded-full bg-white transition-transform duration-300 transform dark:translate-x-[22px]"
      >
        {theme === 'light' ? '☀️' : '🌙'}
      </span>
    </label>
  );
}