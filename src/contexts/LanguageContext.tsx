import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18nData from '../i18n';
import type { Language } from '@/i18n/languages'
import { supportedLanguages } from '@/i18n/languages';
import { i18nService } from '@/utils/i18nService'
import { useAppStore } from '@/store';
import { APP_SIGN_ENUM } from '@/utils';
import { NativeModules } from 'react-native';
const { ConfigModule } = NativeModules;

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  tCustom: (key: string, code: Language) => string;
}

const LanguageContext = createContext<LanguageContextProps>({
  language: '',
  setLanguage: () => {},
  t: (key: string) => key,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  tCustom: (key: string, code: Language) => key,
});

export const useLanguage = () => useContext(LanguageContext);

const STORAGE_KEY = 'app_language';

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('en');

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    AsyncStorage.setItem(STORAGE_KEY, lang).catch(() => {});
  };

  // 根据app全局选的主语言匹配国际化
  const t = (key: string): string => {
    const dict = i18nData[language] as Record<string, any>;
    const keys = key.split('.');
    let value = dict;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key;
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  // 根据传入自定义的国家码 匹配对应国际化
  const tCustom = (key: string, code: Language): string => {
    const dict = i18nData[code] as Record<string, any>;
    const keys = key.split('.');
    let value = dict;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key;
      }
    }
    
    return typeof value === 'string' ? value : key;
  };


  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        const languageCodes = supportedLanguages.map(lang => lang.code)
        console.log('stored---', stored);
        console.log('languageCodes---', languageCodes);
        
        if (
          stored && (languageCodes as string[]).includes(stored)
        ) {
          setLanguageState(stored as Language);
        } else {
          let appSign = useAppStore.getState().appSign
          if (!appSign) {
            const config = await ConfigModule.getConfig();
            appSign = config.APP_SIGN
          }
          console.log('languageConx-appSign----', appSign);
          if (
            appSign === APP_SIGN_ENUM.TYPE_MELON ||
            appSign === APP_SIGN_ENUM.TYPE_MOMOR
          ) {
            setLanguageState('zh');
          } else {
            setLanguageState('en');
          }
          
        }
      } catch {
        if (
          useAppStore.getState().appSign === APP_SIGN_ENUM.TYPE_MELON ||
          useAppStore.getState().appSign === APP_SIGN_ENUM.TYPE_MOMOR
        ) {
          setLanguageState('zh');
        } else {
          setLanguageState('en');
        }
      }
    })();
    i18nService.register(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, tCustom }}>
      {children}
    </LanguageContext.Provider>
  );
};
