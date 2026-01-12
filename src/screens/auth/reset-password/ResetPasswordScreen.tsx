import AuthCommonContainer from '@/components/auth/AuthCommonContainer';
import AppInput from '@/components/ui/AppInput';
import Icon from '@/components/ui/Icon';
import { useForm } from '@/hooks/useForm';
import { getResetPasswordWithEmailSchema } from '@/validations/resetPassword';
import { useRoute } from '@react-navigation/native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity, View } from 'react-native';
import { z } from 'zod';
import { useResetPassword } from './hooks/useResetPassword';

type ResetPasswordRouteParams = {
  email: string;
};

const ResetPasswordScreen = () => {
  const route = useRoute();
  const params = route.params as ResetPasswordRouteParams;
  const { email } = params || {};
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);

  const { resetPassword, isLoading } = useResetPassword();

  const resetPasswordSchema = getResetPasswordWithEmailSchema();
  type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    defaultValues: {
      email: email || '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: resetPasswordSchema,
    mode: 'onBlur',
  });

  const handleContinue = (data: ResetPasswordFormData) => {
    resetPassword({
      email: data.email,
      password: data.password,
    });
  };

  return (
    <AuthCommonContainer
      title={t('AUTH.RESET_PASSWORD.TITLE')}
      bottomButtonText={t('BUTTON.RESET_PASSWORD')}
      onBottomButtonPress={handleSubmit(handleContinue)}
      bottomButtonLoading={isLoading}
      bottomButtonDisabled={isLoading}
    >
      {/* Input Fields */}
      <View className="w-full gap-2">
        <AppInput
          {...register('email')}
          label={t('LABEL.EMAIL')}
          placeholder={t('PLACEHOLDER.EMAIL')}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={false}
          errorText={errors.email?.message}
          containerClassName="opacity-60"
        />

        <AppInput
          {...register('password')}
          label={t('LABEL.NEW_PASSWORD')}
          placeholder={t('PLACEHOLDER.NEW_PASSWORD')}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          errorText={errors.password?.message}
          rightIcon={
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Icon
                name={showPassword ? 'EyeOff' : 'Eye'}
                className="w-5 h-5 text-neutrals400"
              />
            </TouchableOpacity>
          }
        />

        <AppInput
          {...register('confirmPassword')}
          label={t('LABEL.CONFIRM_NEW_PASSWORD')}
          placeholder={t('PLACEHOLDER.CONFIRM_NEW_PASSWORD')}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          errorText={errors.confirmPassword?.message}
          rightIcon={
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Icon
                name={showPassword ? 'EyeOff' : 'Eye'}
                className="w-5 h-5 text-neutrals400"
              />
            </TouchableOpacity>
          }
        />
      </View>
    </AuthCommonContainer>
  );
};

export default ResetPasswordScreen;
