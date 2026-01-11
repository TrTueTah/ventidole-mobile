import { LanguageCode, LANGUAGES } from '@/config/i18n.ts';
import * as RNLocalize from 'react-native-localize';

export const getDeviceLanguage = (): LanguageCode => {
  const locales = RNLocalize.getLocales();

  // Search through all device locales to find a supported language
  for (const locale of locales) {
    const deviceLanguage = locale.languageCode as LanguageCode;

    // Check if device language is supported
    if (Object.keys(LANGUAGES).includes(deviceLanguage)) {
      return deviceLanguage;
    }
  }

  // Fallback to Vietnamese
  return 'vi';
};
