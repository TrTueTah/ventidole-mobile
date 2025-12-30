import AppText from '@/components/ui/AppText';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, View } from 'react-native';

const ChatScreen = () => {
  const { t } = useTranslation();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center">
        <AppText className="text-foreground font-sans-bold text-2xl">
          {t('CHAT_SCREEN')}
        </AppText>
        <AppText className="text-neutrals400 font-sans-regular text-base mt-2">
          {t('COMING_SOON')}
        </AppText>
      </View>
    </SafeAreaView>
  );
};

export default ChatScreen;
