import { useEffect, useState } from 'react';

const key = 'qr-forge-theme';

export default function useTheme(preferredTheme) {
  const [darkMode, setDarkMode] = useState(() => {
    if (preferredTheme) {
      return preferredTheme === 'dark';
    }
    const saved = localStorage.getItem(key);
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem(key, darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    if (!preferredTheme) return;
    setDarkMode(preferredTheme === 'dark');
  }, [preferredTheme]);

  return { darkMode, setDarkMode };
}
