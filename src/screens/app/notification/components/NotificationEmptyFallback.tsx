import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import AppText from '@/components/ui/AppText';
import { Icon } from '@/components/ui';

const NotificationEmptyFallback: React.FC = () => {
  const { t } = useTranslation();

  return (
    <View className="flex-1 justify-center items-center p-8">
      <View className="w-16 h-16 rounded-full bg-neutrals800 items-center justify-center mb-4">
        <Icon name="Bell" className="w-8 h-8 text-neutrals400" />
      </View>
      <AppText
        variant="heading3"
        weight="semibold"
        align="center"
        className="mb-2"
        raw
      >
        {t('APP.NOTIFICATION.NO_NOTIFICATIONS')}
      </AppText>
      <AppText variant="body" color="muted" align="center" raw>
        {t('APP.NOTIFICATION.NO_NOTIFICATIONS_DESCRIPTION')}
      </AppText>
    </View>
  );
};

export default NotificationEmptyFallback;
