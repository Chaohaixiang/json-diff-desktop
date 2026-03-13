import { useEffect, useState } from 'react';

export type Language = 'zh' | 'en';

const STORAGE_KEY = 'json-diff-language';

export function useLanguage(): [Language, (lang: Language) => void] {
  const [language, setLanguage] = useState<Language>('zh');

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Language | null;
    if (stored === 'zh' || stored === 'en') {
      setLanguage(stored);
    }
  }, []);

  const updateLanguage = (next: Language) => {
    setLanguage(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  };

  return [language, updateLanguage];
}

