import { AppText } from '@/components/ui';
import { ScrollView, View } from 'react-native';

const PrivacyScreen = () => {
  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-4 gap-4">
        <AppText variant="heading3">PRIVACY POLICY</AppText>
        <AppText variant="bodySmall" color="muted">
          Last Updated: December 27, 2025
        </AppText>

        <AppText variant="body" color="muted">
          We respect your privacy and are committed to protecting your personal
          data.
        </AppText>

        <View className="gap-3">
          <AppText variant="body" weight="medium" className="mt-2">
            1. Information We Collect
          </AppText>
          <AppText variant="body" weight="semibold">
            Information You Provide
          </AppText>
          <AppText variant="body" color="muted">
            • Name, email, username{'\n'}• Profile information{'\n'}• Payment
            details (processed securely by third parties){'\n'}• Messages and
            content you upload
          </AppText>

          <AppText variant="body" weight="semibold" className="mt-2">
            Automatically Collected
          </AppText>
          <AppText variant="body" color="muted">
            • Device information{'\n'}• IP address{'\n'}• Usage logs and
            interaction data{'\n'}• Cookies and similar technologies
          </AppText>

          <AppText variant="body" weight="medium" className="mt-2">
            2. How We Use Your Data
          </AppText>
          <AppText variant="body" color="muted">
            We use your data to:{'\n\n'}• Provide and improve services{'\n'}•
            Process payments and memberships{'\n'}• Personalize recommendations
            {'\n'}• Ensure platform safety and prevent fraud{'\n'}• Send
            notifications and updates
          </AppText>

          <AppText variant="body" weight="medium" className="mt-2">
            3. Sharing of Information
          </AppText>
          <AppText variant="body" color="muted">
            We may share data with:{'\n\n'}• Payment providers{'\n'}• Cloud and
            analytics services{'\n'}• Legal authorities when required{'\n\n'}
            <AppText weight="semibold">We do not sell personal data.</AppText>
          </AppText>

          <AppText variant="body" weight="medium" className="mt-2">
            4. Data Retention
          </AppText>
          <AppText variant="body" color="muted">
            We retain personal data only as long as necessary for:{'\n\n'}•
            Platform operation{'\n'}• Legal obligations{'\n'}• Dispute
            resolution
          </AppText>

          <AppText variant="body" weight="medium" className="mt-2">
            5. User Rights
          </AppText>
          <AppText variant="body" color="muted">
            Depending on your jurisdiction, you may have the right to:{'\n\n'}•
            Access your data{'\n'}• Correct or delete your data{'\n'}• Restrict
            or object to processing{'\n'}• Request data portability
          </AppText>

          <AppText variant="body" weight="medium" className="mt-2">
            6. Security
          </AppText>
          <AppText variant="body" color="muted">
            We implement technical and organizational measures to protect your
            data.{'\n'}
            However, no system is 100% secure.
          </AppText>

          <AppText variant="body" weight="medium" className="mt-2">
            7. Children's Privacy
          </AppText>
          <AppText variant="body" color="muted">
            The Platform is not intended for children under 13.{'\n'}
            We do not knowingly collect data from minors.
          </AppText>

          <AppText variant="body" weight="medium" className="mt-2">
            8. International Data Transfers
          </AppText>
          <AppText variant="body" color="muted">
            Your data may be stored or processed in countries outside your
            residence, subject to appropriate safeguards.
          </AppText>

          <AppText variant="body" weight="medium" className="mt-2">
            9. Changes to Privacy Policy
          </AppText>
          <AppText variant="body" color="muted">
            We may update this Privacy Policy from time to time.{'\n'}
            Significant changes will be notified.
          </AppText>

          <AppText variant="body" weight="medium" className="mt-2">
            10. Contact
          </AppText>
          <AppText variant="body" color="muted">
            For privacy-related requests:{'\n'}
            📧 privacy@ventidole.com
          </AppText>
        </View>

        <View className="pb-safe-offset-8" />
      </View>
    </ScrollView>
  );
};

export default PrivacyScreen;
