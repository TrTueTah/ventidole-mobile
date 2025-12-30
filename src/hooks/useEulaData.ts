import { useCallback, useState } from 'react';

export const useEulaData = () => {
  const [dataEula, setDataEula] = useState([
    {
      id: 0,
      title: '',
      description:
        'This End User License Agreement (“Agreement”) is a legal contract between you (“User”) and Ventidole Inc. (“Licensor”), governing your use of the Ventidole fan–idol platform (“the App”). By creating an account or using the App, you agree to these terms. If you do not agree, please discontinue use immediately.',
    },
    {
      id: 1,
      title: '1. LICENSE GRANT',
      description:
        'Subject to this Agreement, Licensor grants you a limited, non-exclusive, non-transferable, and revocable license to use the App for personal, non-commercial purposes. You may not copy, modify, or redistribute any part of the App without permission.',
    },
    {
      id: 2,
      title: '2. ACCOUNT REGISTRATION & TERMINATION',
      description:
        'You must provide accurate information when creating an account. Licensor reserves the right to suspend or terminate accounts for any violation of these terms or harmful behavior toward the community. You may terminate your account at any time through in-app settings.',
    },
    {
      id: 3,
      title: '3. USER-GENERATED CONTENT',
      description:
        'The App allows users to create and share posts, comments, images, and other content.\n\n' +
        '3.1. Content Ownership\n\n' +
        'You retain ownership of your content but grant Ventidole a non-exclusive, worldwide, royalty-free license to use, display, and distribute it within the platform.\n\n' +
        '3.2. Prohibited Content\n\n' +
        'We have zero tolerance for:\n\n' +
        '    • Harassment, hate speech, or discrimination\n' +
        '    • Pornographic, violent, or explicit content\n' +
        '    • Scams, impersonation, or misleading information\n' +
        'Violations may lead to immediate account suspension or removal of content.',
    },
    {
      id: 4,
      title: '4. MEMBERSHIP & SUBSCRIPTION OPTIONS',
      description:
        'Ventidole offers optional membership plans and digital purchases such as event tickets, tokens, and idol merchandise. Pricing and benefits are displayed in-app. All payments are handled securely through third-party providers. Memberships automatically renew unless canceled before the renewal date.',
    },
    {
      id: 5,
      title: '5. COMMUNITY INTERACTIONS & BLOCKING',
      description:
        'You can follow idols, comment, and message other fans. You may block users who engage in abusive behavior. Once blocked, they cannot contact or view your profile.',
    },
    {
      id: 6,
      title: '6. PRIVACY & DATA USAGE',
      description:
        'Your privacy is important to us. Please review our Privacy Policy for details on how your personal data is collected and processed. We never sell your personal information to third parties.',
    },
    {
      id: 7,
      title: '7. CODE OF CONDUCT',
      description:
        'You agree to:\n\n' +
        '    • Treat other users respectfully\n' +
        '    • Avoid offensive or spam behavior\n' +
        '    • Respect the intellectual property of idols and creators\n' +
        'Repeated violations may lead to suspension or permanent ban.',
    },
    {
      id: 8,
      title: '8. DIGITAL ITEMS & TOKENS',
      description:
        'Some features may include digital collectibles, tokens, or NFT-based assets. Ownership of these assets follows the blockchain’s public record. Users are responsible for securing their wallets and understanding the risks of digital transactions.',
    },
    {
      id: 9,
      title: '9. LIMITATION OF LIABILITY',
      description:
        'Ventidole and its affiliates are not liable for indirect or consequential damages, including loss of data or virtual goods, resulting from your use of the App. The App is provided “AS IS” without any warranty of uninterrupted or error-free service.',
    },
    {
      id: 10,
      title: '10. ELIGIBILITY',
      description:
        'You must be at least 16 years old to use the App. Some regions may require parental consent for minors. Idol or creator accounts must comply with all local laws and verification procedures.',
    },
    {
      id: 11,
      title: '11. GOVERNING LAW',
      description:
        'This Agreement is governed by the laws of the State of Delaware, USA, without regard to its conflict of law provisions. Disputes will be resolved through binding arbitration unless prohibited by local law.',
    },
    {
      id: 12,
      title: '12. THIRD-PARTY SERVICES',
      description:
        'The App may integrate third-party services (e.g., Google, Apple, payment gateways). You agree to follow their respective terms. Ventidole is not responsible for any external service failures.',
    },
    {
      id: 13,
      title: '13. UPDATES & MODIFICATIONS',
      description:
        'Ventidole may update these terms periodically. Continued use of the App after changes take effect constitutes your acceptance of the revised Agreement.',
    },
    {
      id: 14,
      title: '14. CONTACT INFORMATION',
      description:
        'If you have any questions or concerns about this Agreement, please contact us at support@ventidole.app.',
    },
    {
      id: 15,
      title: 'ACCEPTANCE',
      description:
        'By clicking “Agree” or continuing to use the App, you acknowledge that you have read and understood this Agreement and agree to its terms, including community guidelines, content restrictions, and digital item policies.',
    },
  ]);
  const [endReached, setEndReached] = useState(false);
  const [loading, setLoading] = useState(false);

  const onEndReached = useCallback(() => {
    setEndReached(true);
  }, []);

  return { dataEula, loading, endReached, onEndReached };
};
