import { AppText } from '@/components/ui';
import { ScrollView, View } from 'react-native';

const TermsScreen = () => {
  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-4 gap-4">
        <AppText variant="heading3">Terms of Service</AppText>

        <View className="gap-3">
          <AppText variant="body" weight="medium">
            1. Acceptance of Terms
          </AppText>
          <AppText variant="body" color="muted">
            By accessing and using this service, you accept and agree to be
            bound by the terms and provision of this agreement.
          </AppText>

          <AppText variant="body" weight="medium" className="mt-2">
            2. Use License
          </AppText>
          <AppText variant="body" color="muted">
            Permission is granted to temporarily download one copy of the
            materials for personal, non-commercial transitory viewing only.
          </AppText>

          <AppText variant="body" weight="medium" className="mt-2">
            3. Disclaimer
          </AppText>
          <AppText variant="body" color="muted">
            The materials on our service are provided on an 'as is' basis. We
            make no warranties, expressed or implied, and hereby disclaim all
            other warranties.
          </AppText>

          <AppText variant="body" weight="medium" className="mt-2">
            4. Limitations
          </AppText>
          <AppText variant="body" color="muted">
            In no event shall we be liable for any damages arising out of the
            use or inability to use the materials on our service.
          </AppText>

          <AppText variant="body" weight="medium" className="mt-2">
            5. Modifications
          </AppText>
          <AppText variant="body" color="muted">
            We may revise these terms of service at any time without notice. By
            using this service you agree to be bound by the current version of
            these terms.
          </AppText>
        </View>

        <View className="pb-safe-offset-8" />
      </View>
    </ScrollView>
  );
};

export default TermsScreen;
