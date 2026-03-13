import { useEffect, useState } from 'react';

export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'json-diff-theme';

export function useTheme(): [Theme, (theme: Theme) => void] {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored === 'light' || stored === 'dark') {
      setTheme(stored);
      applyTheme(stored);
    } else {
      applyTheme('dark');
    }
  }, []);

  const updateTheme = (next: Theme) => {
    setTheme(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  };

  return [theme, updateTheme];
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
}

