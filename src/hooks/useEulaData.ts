import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

export const useEulaData = () => {
  const { t } = useTranslation();

  const dataEula = useMemo(
    () => [
      {
        id: 0,
        title: '',
        description: t('AUTH.EULA.INTRO'),
      },
      {
        id: 1,
        title: t('AUTH.EULA.LICENSE_GRANT.TITLE'),
        description: t('AUTH.EULA.LICENSE_GRANT.DESCRIPTION'),
      },
      {
        id: 2,
        title: t('AUTH.EULA.ACCOUNT.TITLE'),
        description: t('AUTH.EULA.ACCOUNT.DESCRIPTION'),
      },
      {
        id: 3,
        title: t('AUTH.EULA.USER_CONTENT.TITLE'),
        description: t('AUTH.EULA.USER_CONTENT.DESCRIPTION'),
      },
      {
        id: 4,
        title: t('AUTH.EULA.MEMBERSHIP.TITLE'),
        description: t('AUTH.EULA.MEMBERSHIP.DESCRIPTION'),
      },
      {
        id: 5,
        title: t('AUTH.EULA.COMMUNITY.TITLE'),
        description: t('AUTH.EULA.COMMUNITY.DESCRIPTION'),
      },
      {
        id: 6,
        title: t('AUTH.EULA.PRIVACY.TITLE'),
        description: t('AUTH.EULA.PRIVACY.DESCRIPTION'),
      },
      {
        id: 7,
        title: t('AUTH.EULA.CODE_OF_CONDUCT.TITLE'),
        description: t('AUTH.EULA.CODE_OF_CONDUCT.DESCRIPTION'),
      },
      {
        id: 8,
        title: t('AUTH.EULA.DIGITAL_ITEMS.TITLE'),
        description: t('AUTH.EULA.DIGITAL_ITEMS.DESCRIPTION'),
      },
      {
        id: 9,
        title: t('AUTH.EULA.LIABILITY.TITLE'),
        description: t('AUTH.EULA.LIABILITY.DESCRIPTION'),
      },
      {
        id: 10,
        title: t('AUTH.EULA.ELIGIBILITY.TITLE'),
        description: t('AUTH.EULA.ELIGIBILITY.DESCRIPTION'),
      },
      {
        id: 11,
        title: t('AUTH.EULA.GOVERNING_LAW.TITLE'),
        description: t('AUTH.EULA.GOVERNING_LAW.DESCRIPTION'),
      },
      {
        id: 12,
        title: t('AUTH.EULA.THIRD_PARTY.TITLE'),
        description: t('AUTH.EULA.THIRD_PARTY.DESCRIPTION'),
      },
      {
        id: 13,
        title: t('AUTH.EULA.UPDATES.TITLE'),
        description: t('AUTH.EULA.UPDATES.DESCRIPTION'),
      },
      {
        id: 14,
        title: t('AUTH.EULA.CONTACT.TITLE'),
        description: t('AUTH.EULA.CONTACT.DESCRIPTION'),
      },
      {
        id: 15,
        title: t('AUTH.EULA.ACCEPTANCE.TITLE'),
        description: t('AUTH.EULA.ACCEPTANCE.DESCRIPTION'),
      },
    ],
    [t],
  );

  const [endReached, setEndReached] = useState(false);
  const [loading, setLoading] = useState(false);

  const onEndReached = useCallback(() => {
    setEndReached(true);
  }, []);

  return { dataEula, loading, endReached, onEndReached };
};
