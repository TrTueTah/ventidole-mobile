import { AppText } from '@/components/ui';
import { ScrollView, View } from 'react-native';

const PrivacyScreen = () => {
  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-4 gap-4">
        <AppText variant="heading3">Privacy Policy</AppText>

        <View className="gap-3">
          <AppText variant="body" weight="medium">
            1. Information We Collect
          </AppText>
          <AppText variant="body" color="muted">
            We collect information you provide directly to us, such as when you
            create an account, make a purchase, or communicate with us.
          </AppText>

          <AppText variant="body" weight="medium" className="mt-2">
            2. How We Use Your Information
          </AppText>
          <AppText variant="body" color="muted">
            We use the information we collect to provide, maintain, and improve
            our services, process transactions, and communicate with you.
          </AppText>

          <AppText variant="body" weight="medium" className="mt-2">
            3. Information Sharing
          </AppText>
          <AppText variant="body" color="muted">
            We do not share your personal information with third parties except
            as described in this privacy policy.
          </AppText>

          <AppText variant="body" weight="medium" className="mt-2">
            4. Data Security
          </AppText>
          <AppText variant="body" color="muted">
            We take reasonable measures to help protect your personal
            information from loss, theft, misuse, and unauthorized access.
          </AppText>

          <AppText variant="body" weight="medium" className="mt-2">
            5. Your Rights
          </AppText>
          <AppText variant="body" color="muted">
            You have the right to access, update, or delete your personal
            information at any time.
          </AppText>
        </View>

        <View className="pb-safe-offset-8" />
      </View>
    </ScrollView>
  );
};

export default PrivacyScreen;
