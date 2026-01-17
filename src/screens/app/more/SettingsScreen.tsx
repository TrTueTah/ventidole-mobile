import { Select } from '@/components/ui';
import { LANGUAGES } from '@/config/i18n';
import { useAppStore } from '@/store/appStore';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  const theme = useAppStore(state => state.theme);
  const language = useAppStore(state => state.language);
  const toggleTheme = useAppStore(state => state.toggleTheme);
  const setLanguage = useAppStore(state => state.setLanguage);
  const { t } = useTranslation();

  const handleToggleTheme = () => {
    toggleTheme();
  };

  return (
    <View className="flex-1">
      <View className="p-4">
        <TouchableOpacity
          className="flex-row justify-between items-center py-4 px-4 bg-neutrals800 rounded-lg mb-2"
          onPress={handleToggleTheme}
        >
          <Text className="text-foreground text-base font-sans-semibold">
            {t('APP.SETTINGS.THEME')}
          </Text>
          <Text className="text-neutrals300 text-sm font-sans-regular">
            {theme === 'dark'
              ? t('APP.SETTINGS.DARK_MODE')
              : t('APP.SETTINGS.LIGHT_MODE')}
          </Text>
        </TouchableOpacity>
        <Select
          label={'Select language'}
          labelClassName={'hidden'}
          options={Object.values(LANGUAGES).map(lang => ({
            label: lang.nativeName,
            value: lang.code,
          }))}
          value={language}
          onValueChange={(value: any) => {
            setLanguage(value);
          }}
          renderSelector={
            <TouchableOpacity className="flex-row justify-between items-center py-4 px-4 bg-neutrals800 rounded-lg mb-2">
              <Text className="text-foreground text-base font-sans-semibold">
                {t('APP.SETTINGS.LANGUAGE')}
              </Text>
              <Text className="text-neutrals300 text-sm font-sans-regular">
                {LANGUAGES[language].nativeName}
              </Text>
            </TouchableOpacity>
          }
        />
      </View>
    </View>
  );
}
