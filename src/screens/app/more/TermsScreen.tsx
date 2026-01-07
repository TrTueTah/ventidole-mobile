import { AppText } from '@/components/ui';
import { ScrollView, View } from 'react-native';

const TermsScreen = () => {
  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-4 gap-4">
        <AppText variant="heading3">TERMS OF SERVICE</AppText>
        <AppText variant="bodySmall" color="muted">
          Last Updated: December 27, 2025
        </AppText>

        <AppText variant="body" color="muted">
          Welcome to Ventidole ("Platform", "we", "us", "our").{'\n'}
          By accessing or using our services, you agree to be bound by these
          Terms of Service ("Terms"). If you do not agree, please do not use the
          Platform.
        </AppText>

        <View className="gap-3">
          <AppText variant="body" weight="medium" className="mt-2">
            1. Definitions
          </AppText>
          <AppText variant="body" color="muted">
            <AppText weight="semibold">User:</AppText> Any individual or entity
            using the Platform.{'\n\n'}
            <AppText weight="semibold">Fan:</AppText> A User who follows,
            interacts with, or supports Idols.{'\n\n'}
            <AppText weight="semibold">Idol:</AppText> A User who creates
            content, sells merchandise, or offers memberships.{'\n\n'}
            <AppText weight="semibold">Content:</AppText> Posts, images, videos,
            messages, livestreams, NFTs, or other materials.{'\n\n'}
            <AppText weight="semibold">Membership:</AppText> Paid or free
            subscription providing exclusive benefits.{'\n\n'}
            <AppText weight="semibold">Marketplace:</AppText> Feature enabling
            sale of merchandise, tickets, or digital assets.
          </AppText>

          <AppText variant="body" weight="medium" className="mt-2">
            2. Eligibility
          </AppText>
          <AppText variant="body" color="muted">
            You must:{'\n\n'}• Be at least 13 years old (or the legal age in
            your jurisdiction).{'\n'}• Have the legal capacity to enter into
            this agreement.{'\n'}• Accounts registered by bots or automated
            methods are prohibited.
          </AppText>

          <AppText variant="body" weight="medium" className="mt-2">
            3. Account Registration & Security
          </AppText>
          <AppText variant="body" color="muted">
            • You are responsible for maintaining the confidentiality of your
            account credentials.{'\n'}• You agree to provide accurate and
            up-to-date information.{'\n'}• We reserve the right to suspend or
            terminate accounts involved in fraud, abuse, or violations.
          </AppText>

          <AppText variant="body" weight="medium" className="mt-2">
            4. Roles & Responsibilities
          </AppText>
          <AppText variant="body" weight="semibold">
            Fans
          </AppText>
          <AppText variant="body" color="muted">
            Fans may:{'\n'}• Follow idols{'\n'}• Purchase memberships, merch,
            tickets, or digital assets{'\n'}• Interact via likes, comments, and
            chat{'\n\n'}
            Fans must not:{'\n'}• Harass, impersonate, or abuse idols or other
            users{'\n'}• Redistribute paid or exclusive content without
            permission
          </AppText>

          <AppText variant="body" weight="semibold" className="mt-2">
            Idols
          </AppText>
          <AppText variant="body" color="muted">
            Idols may:{'\n'}• Publish content{'\n'}• Offer memberships and
            exclusive perks{'\n'}• Sell products or digital assets{'\n\n'}
            Idols are responsible for:{'\n'}• Ensuring ownership or legal rights
            to their content{'\n'}• Fulfilling purchased items or promised
            benefits{'\n'}• Complying with applicable laws (tax, copyright,
            consumer protection)
          </AppText>

          <AppText variant="body" weight="medium" className="mt-2">
            5. Content Ownership & License
          </AppText>
          <AppText variant="body" color="muted">
            • Users retain ownership of content they create.{'\n'}• By uploading
            content, you grant us a non-exclusive, worldwide, royalty-free
            license to host, distribute, and display the content for Platform
            operation and promotion.{'\n'}• We do not claim ownership of your
            intellectual property.
          </AppText>

          <AppText variant="body" weight="medium" className="mt-2">
            6. Prohibited Content & Behavior
          </AppText>
          <AppText variant="body" color="muted">
            You may not post or engage in content that:{'\n\n'}• Is illegal,
            hateful, violent, or sexually explicit{'\n'}• Infringes intellectual
            property rights{'\n'}• Promotes scams, fraud, or misleading
            information{'\n'}• Exploits minors or encourages self-harm{'\n\n'}
            We reserve the right to remove content or accounts at our
            discretion.
          </AppText>

          <AppText variant="body" weight="medium" className="mt-2">
            7. Payments, Memberships & Refunds
          </AppText>
          <AppText variant="body" color="muted">
            • Payments are processed via third-party providers.{'\n'}•
            Membership fees are billed according to the selected plan.{'\n'}•
            Refunds are subject to our Refund Policy and applicable law.{'\n'}•
            We are not responsible for disputes between Fans and Idols but may
            assist in resolution.
          </AppText>

          <AppText variant="body" weight="medium" className="mt-2">
            8. Marketplace & Digital Assets
          </AppText>
          <AppText variant="body" color="muted">
            • The Platform may support NFTs or blockchain-based assets.{'\n'}•
            Blockchain transactions are irreversible.{'\n'}• We do not guarantee
            asset value, resale value, or investment outcomes.
          </AppText>

          <AppText variant="body" weight="medium" className="mt-2">
            9. Termination
          </AppText>
          <AppText variant="body" color="muted">
            We may suspend or terminate your account if:{'\n\n'}• You violate
            these Terms{'\n'}• Your activity poses legal or security risks
            {'\n'}• Required by law enforcement or court order{'\n\n'}
            You may terminate your account at any time.
          </AppText>

          <AppText variant="body" weight="medium" className="mt-2">
            10. Disclaimer of Warranties
          </AppText>
          <AppText variant="body" color="muted">
            The Platform is provided "as is" and "as available".{'\n'}
            We do not guarantee uninterrupted service, error-free operation, or
            specific outcomes.
          </AppText>

          <AppText variant="body" weight="medium" className="mt-2">
            11. Limitation of Liability
          </AppText>
          <AppText variant="body" color="muted">
            To the maximum extent permitted by law:{'\n\n'}• We are not liable
            for indirect, incidental, or consequential damages{'\n'}• Our total
            liability shall not exceed the amount you paid us in the last 12
            months
          </AppText>

          <AppText variant="body" weight="medium" className="mt-2">
            12. Governing Law
          </AppText>
          <AppText variant="body" color="muted">
            These Terms are governed by the laws of your jurisdiction, without
            regard to conflict of law principles.
          </AppText>

          <AppText variant="body" weight="medium" className="mt-2">
            13. Changes to Terms
          </AppText>
          <AppText variant="body" color="muted">
            We may update these Terms at any time. Continued use after changes
            means acceptance.
          </AppText>

          <AppText variant="body" weight="medium" className="mt-2">
            14. Contact
          </AppText>
          <AppText variant="body" color="muted">
            For questions or legal requests, contact:{'\n'}
            📧 support@ventidole.com
          </AppText>
        </View>

        <View className="pb-safe-offset-8" />
      </View>
    </ScrollView>
  );
};

export default TermsScreen;
