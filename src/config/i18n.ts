import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';
import en from './locales/en.json';
import vi from './locales/vi.json';

export const LANGUAGES = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    schema: en,
  },
  vi: {
    code: 'vi',
    name: 'Vietnamese',
    nativeName: 'Tiếng Việt',
    schema: vi,
  },
} as const;

export type LanguageCode = keyof typeof LANGUAGES;

const getDeviceLanguage = (): LanguageCode => {
  const locales = RNLocalize.getLocales();
  console.log('Device locales:', locales);

  // Search through all device locales to find a supported language
  for (const locale of locales) {
    const deviceLanguage = locale.languageCode as LanguageCode;
    if (Object.keys(LANGUAGES).includes(deviceLanguage)) {
      return deviceLanguage;
    }
  }

  return 'vi';
};

const resources = {
  en: { translation: en },
  vi: { translation: vi },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'vi', // Default language, will be overridden by appStore via LanguageHelper
  fallbackLng: 'vi',
  defaultNS: 'translation',
  ns: ['translation'],
  interpolation: {
    escapeValue: false,
    prefix: '{',
    suffix: '}',
  },
  react: {
    useSuspense: false,
  },
  keySeparator: '.',
  nsSeparator: ':',
  returnEmptyString: false,
});

export const changeLanguage = async (
  languageCode: LanguageCode,
): Promise<void> => {
  await i18n.changeLanguage(languageCode);
};

export const getAvailableLanguages = () => {
  return Object.entries(LANGUAGES).map(([code, info]) => ({
    ...info,
  }));
};

export default i18n;
