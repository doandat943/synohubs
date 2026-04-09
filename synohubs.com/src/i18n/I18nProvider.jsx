import { createContext, useContext, useState, useCallback } from 'react';
import { locales } from './locales';

const I18nContext = createContext();

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem('synohub-lang');
    if (saved && locales[saved]) return saved;
    const browser = navigator.language?.slice(0, 2);
    return locales[browser] ? browser : 'en';
  });

  const changeLang = useCallback((code) => {
    if (locales[code]) {
      setLang(code);
      localStorage.setItem('synohub-lang', code);
    }
  }, []);

  const t = locales[lang] || locales.en;
  const languages = Object.values(locales).map(({ code, name, flag }) => ({ code, name, flag }));

  return (
    <I18nContext.Provider value={{ t, lang, changeLang, languages }}>
      {children}
    </I18nContext.Provider>
  );
}

export const useI18n = () => useContext(I18nContext);
