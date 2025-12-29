import AuthTitle from '@/components/auth/AuthTitle';
import BackButton from '@/components/auth/BackButton';
import AppButton from '@/components/ui/AppButton';
import AppInput from '@/components/ui/AppInput';
import { useForm } from '@/hooks/useForm';
import { getVerifyEmailSchema } from '@/validations/common';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { z } from 'zod';
import { useVerifyEmail } from './hooks/useVerifyEmail';

type VerifyEmailRouteParams = {
  type?: 'register' | 'resetPassword';
  header?: string;
  email?: string;
};

const VerifyEmailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const params = (route.params as VerifyEmailRouteParams) || {};
  const { type = 'register', header, email: initialEmail } = params;

  const [canSendOtp, setCanSendOtp] = useState<boolean>(true);
  const [countdown, setCountdown] = useState<number>(0);

  const {
    sendVerification,
    isSendingVerification,
    verificationData,
    confirmVerification,
    isConfirmingVerification,
  } = useVerifyEmail({ type });

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
      sendVerification({ email });
    }
  };

  const onSubmit = async (data: VerifyEmailFormData) => {
    confirmVerification({ email: data.email, code: data.otp });
  };

  // Email validation helper
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const currentEmail = getValue('email') || '';
  const currentOtp = getValue('otp') || '';

  return (
    <View className="flex-1 bg-background">
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View className="flex-1 justify-between px-4">
            {/* Header with Back Button */}
            <View>
              <View className="flex-row items-center py-4">
                {navigation.canGoBack() && (
                  <BackButton onPress={() => navigation.goBack()} />
                )}
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 24 }}
              >
                <View className="gap-6">
                  {/* Title */}
                  <AuthTitle title={header || t('VERIFY_EMAIL')} />

                  {/* Input Fields */}
                  <View className="w-full gap-2">
                    {/* Email with Send OTP button in row */}
                    <View className="flex-row gap-2">
                      <View className="flex-[2]">
                        <AppInput
                          {...register('email')}
                          label={t('EMAIL')}
                          placeholder="johndoe@gmail.com"
                          keyboardType="email-address"
                          autoCapitalize="none"
                          errorText={errors.email?.message}
                        />
                      </View>
                      <View className="flex-1 justify-end pb-6">
                        <AppButton
                          variant="outline"
                          size="md"
                          onPress={handleSendOtp}
                          disabled={
                            !canSendOtp ||
                            isSendingVerification ||
                            !isValidEmail(currentEmail)
                          }
                          loading={isSendingVerification}
                        >
                          {countdown > 0
                            ? t('WAIT_SECONDS', { seconds: countdown })
                            : t('SEND_OTP')}
                        </AppButton>
                      </View>
                    </View>

                    {/* OTP Input */}
                    <AppInput
                      {...register('otp')}
                      label={t('VERIFICATION_CODE')}
                      placeholder={t('ENTER_CODE')}
                      keyboardType="number-pad"
                      maxLength={4}
                      errorText={errors.otp?.message}
                    />
                  </View>
                </View>
              </ScrollView>
            </View>

            {/* Bottom Button */}
            <View className="py-4">
              <AppButton
                variant="primary"
                size="lg"
                onPress={handleSubmit(onSubmit)}
                loading={isConfirmingVerification}
                disabled={
                  isConfirmingVerification ||
                  !isValidEmail(currentEmail) ||
                  !currentOtp
                }
              >
                {t('VERIFY_CONTINUE')}
              </AppButton>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

export default VerifyEmailScreen;
