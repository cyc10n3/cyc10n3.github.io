import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'ar' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [translations, setTranslations] = useState<Record<string, any>>({});

  // Load initial translations and saved language
  useEffect(() => {
    const initializeLanguage = async () => {
      // Load saved language from localStorage
      const savedLanguage = localStorage.getItem('language') as Language;
      const initialLanguage = (savedLanguage && ['en', 'ar', 'fr'].includes(savedLanguage)) ? savedLanguage : 'en';
      
      // Load translations for the initial language
      try {
        const translationModule = await import(`../translations/${initialLanguage}.json`);
        setTranslations(translationModule.default);
        setLanguage(initialLanguage);
        
        // Set document attributes
        document.documentElement.dir = initialLanguage === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = initialLanguage;
      } catch (error) {
        console.error(`Failed to load translations for ${initialLanguage}:`, error);
        // Fallback to English
        try {
          const fallbackModule = await import('../translations/en.json');
          setTranslations(fallbackModule.default);
          setLanguage('en');
          document.documentElement.dir = 'ltr';
          document.documentElement.lang = 'en';
        } catch (fallbackError) {
          console.error('Failed to load fallback translations:', fallbackError);
        }
      }
    };

    initializeLanguage();
  }, []);

  useEffect(() => {
    // Load translations when language changes (after initial load)
    if (language) {
      const loadTranslations = async () => {
        try {
          const translationModule = await import(`../translations/${language}.json`);
          setTranslations(translationModule.default);
        } catch (error) {
          console.error(`Failed to load translations for ${language}:`, error);
          // Fallback to English if translation fails
          if (language !== 'en') {
            try {
              const fallbackModule = await import('../translations/en.json');
              setTranslations(fallbackModule.default);
            } catch (fallbackError) {
              console.error('Failed to load fallback translations:', fallbackError);
            }
          }
        }
      };

      loadTranslations();
    }
  }, [language]);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
    
    // Update document direction for Arabic
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations;
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break;
    }
    
    return typeof value === 'string' ? value : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};