import AuthCommonContainer from '@/components/auth/AuthCommonContainer';
import AppButton from '@/components/ui/AppButton';
import AppInput from '@/components/ui/AppInput';
import { useForm } from '@/hooks/useForm';
import { useVerifyEmail } from '@/hooks/useVerifyEmail';
import { getVerifyEmailSchema } from '@/validations/common';
import { useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { z } from 'zod';

type VerifyEmailRouteParams = {
  type?: 'register' | 'resetPassword';
  header?: string;
  email?: string;
};

const VerifyEmailScreen = () => {
  const route = useRoute();
  const { t } = useTranslation();
  const params = (route.params as VerifyEmailRouteParams) || {};
  const { type = 'register', header, email: initialEmail } = params;

  const [canSendOtp, setCanSendOtp] = useState<boolean>(true);
  const [countdown, setCountdown] = useState<number>(0);

  const verificationType =
    type === 'register' ? 'REGISTER_ACCOUNT' : 'RESET_PASSWORD';

  const {
    sendVerification,
    isSendingVerification,
    verificationData,
    confirmVerification,
    isConfirmingVerification,
  } = useVerifyEmail({ verificationType });

  const verifyEmailSchema = getVerifyEmailSchema();
  type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValue,
  } = useForm<VerifyEmailFormData>({
    defaultValues: {
      email: initialEmail || '',
      otp: '',
    },
    validationSchema: verifyEmailSchema,
    mode: 'onBlur',
  });

  // Handle countdown timer for resend OTP
  useEffect(() => {
    if (verificationData?.waitSeconds) {
      setCountdown(verificationData.waitSeconds);
      setCanSendOtp(false);
    }
  }, [verificationData]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !canSendOtp) {
      setCanSendOtp(true);
    }
  }, [countdown, canSendOtp]);

  const handleSendOtp = () => {
    const email = getValue('email');
    if (email && canSendOtp) {
      sendVerification({
        email,
        verificationType,
      });
    }
  };

  const onSubmit = async (data: VerifyEmailFormData) => {
    confirmVerification({
      email: data.email,
      code: data.otp,
      verificationType,
    });
  };

  // Email validation helper
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const currentEmail = getValue('email') || '';
  const currentOtp = getValue('otp') || '';

  return (
    <AuthCommonContainer
      title={header || t('AUTH.VERIFY_EMAIL.TITLE')}
      bottomButtonText={t('BUTTON.VERIFY')}
      onBottomButtonPress={handleSubmit(onSubmit)}
      bottomButtonLoading={isConfirmingVerification}
      bottomButtonDisabled={!isValidEmail(currentEmail) || !currentOtp}
    >
      {/* Input Fields */}
      <View className="w-full gap-2">
        {/* Email with Send OTP button in row */}
        <View className="flex-row gap-2 items-start overflow-visible">
          <View className="flex-[2] overflow-visible">
            <AppInput
              {...register('email')}
              label={t('LABEL.EMAIL')}
              placeholder={t('PLACEHOLDER.EMAIL')}
              keyboardType="email-address"
              autoCapitalize="none"
              errorText={errors.email?.message}
            />
          </View>
          <View className="flex-1 mt-7">
            <AppButton
              variant="outline"
              size="default"
              onPress={handleSendOtp}
              disabled={
                !canSendOtp ||
                isSendingVerification ||
                !isValidEmail(currentEmail)
              }
              loading={isSendingVerification}
            >
              {countdown > 0
                ? t('BUTTON.WAIT_SECONDS', { seconds: countdown })
                : t('BUTTON.SEND_OTP')}
            </AppButton>
          </View>
        </View>

        {/* OTP Input */}
        <AppInput
          {...register('otp')}
          label={t('LABEL.VERIFICATION_CODE')}
          placeholder={t('PLACEHOLDER.VERIFICATION_CODE')}
          keyboardType="number-pad"
          maxLength={4}
          errorText={errors.otp?.message}
        />
      </View>
    </AuthCommonContainer>
  );
};

export default VerifyEmailScreen;
