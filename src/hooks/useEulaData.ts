import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

export const useEulaData = () => {
  const { t } = useTranslation();
  
  const dataEula = useMemo(() => [
    {
      id: 0,
      title: '',
      description: t('EULA.INTRO'),
    },
    {
      id: 1,
      title: t('EULA.LICENSE_GRANT.TITLE'),
      description: t('EULA.LICENSE_GRANT.DESCRIPTION'),
    },
    {
      id: 2,
      title: t('EULA.ACCOUNT.TITLE'),
      description: t('EULA.ACCOUNT.DESCRIPTION'),
    },
    {
      id: 3,
      title: t('EULA.USER_CONTENT.TITLE'),
      description: t('EULA.USER_CONTENT.DESCRIPTION'),
    },
    {
      id: 4,
      title: t('EULA.MEMBERSHIP.TITLE'),
      description: t('EULA.MEMBERSHIP.DESCRIPTION'),
    },
    {
      id: 5,
      title: t('EULA.COMMUNITY.TITLE'),
      description: t('EULA.COMMUNITY.DESCRIPTION'),
    },
    {
      id: 6,
      title: t('EULA.PRIVACY.TITLE'),
      description: t('EULA.PRIVACY.DESCRIPTION'),
    },
    {
      id: 7,
      title: t('EULA.CODE_OF_CONDUCT.TITLE'),
      description: t('EULA.CODE_OF_CONDUCT.DESCRIPTION'),
    },
    {
      id: 8,
      title: t('EULA.DIGITAL_ITEMS.TITLE'),
      description: t('EULA.DIGITAL_ITEMS.DESCRIPTION'),
    },
    {
      id: 9,
      title: t('EULA.LIABILITY.TITLE'),
      description: t('EULA.LIABILITY.DESCRIPTION'),
    },
    {
      id: 10,
      title: t('EULA.ELIGIBILITY.TITLE'),
      description: t('EULA.ELIGIBILITY.DESCRIPTION'),
    },
    {
      id: 11,
      title: t('EULA.GOVERNING_LAW.TITLE'),
      description: t('EULA.GOVERNING_LAW.DESCRIPTION'),
    },
    {
      id: 12,
      title: t('EULA.THIRD_PARTY.TITLE'),
      description: t('EULA.THIRD_PARTY.DESCRIPTION'),
    },
    {
      id: 13,
      title: t('EULA.UPDATES.TITLE'),
      description: t('EULA.UPDATES.DESCRIPTION'),
    },
    {
      id: 14,
      title: t('EULA.CONTACT.TITLE'),
      description: t('EULA.CONTACT.DESCRIPTION'),
    },
    {
      id: 15,
      title: t('EULA.ACCEPTANCE.TITLE'),
      description: t('EULA.ACCEPTANCE.DESCRIPTION'),
    },
  ], [t]);

  const [endReached, setEndReached] = useState(false);
  const [loading, setLoading] = useState(false);

  const onEndReached = useCallback(() => {
    setEndReached(true);
  }, []);

  return { dataEula, loading, endReached, onEndReached };
};
