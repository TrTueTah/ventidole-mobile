import AuthTitle from '@/components/auth/AuthTitle';
import AppButton from '@/components/ui/AppButton';
import AppInput from '@/components/ui/AppInput';
import AppText from '@/components/ui/AppText';
import Icon from '@/components/ui/Icon';
import { useForm } from '@/hooks/useForm';
import { getSignInSchema } from '@/validations/common';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import {
  TouchableOpacity,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useLogin } from './hooks/useLogin';

export default function SignInScreen() {
  const navigation = useNavigation();
  const { login, isLoading } = useLogin();
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const signInSchema = getSignInSchema();
  type SignInFormData = z.infer<typeof signInSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    defaultValues: {
      email: '',
      password: '',
    },
    validationSchema: signInSchema,
    mode: 'onBlur',
  });

  const onSubmit = async (data: SignInFormData) => {
    login({
      email: data.email,
      password: data.password,
    });
  };

  return (
    <View className="flex-1 bg-background">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingVertical: 24,
          }}
          keyboardShouldPersistTaps="handled"
          className="flex-1"
        >
          <View className="flex-1 px-4 justify-center gap-6">
            {/* Auth Title */}
            <AuthTitle title={t('WELCOME_BACK_TO_VENTIDOLE')} />

            {/* Input Fields */}
            <View className="w-full gap-2">
              <AppInput
                {...register('email')}
                label={t('EMAIL')}
                placeholder="johndoe@gmail.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                errorText={errors.email?.message}
              />

              <AppInput
                {...register('password')}
                label={t('PASSWORD')}
                placeholder={t('ENTER_PASSWORD')}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
                errorText={errors.password?.message}
                rightIcon={
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Icon
                      name={showPassword ? 'EyeOff' : 'Eye'}
                      className="w-5 h-5 text-neutrals400"
                    />
                  </TouchableOpacity>
                }
              />
            </View>

            {/* Remember Me / Forgot Password */}
            <View className="flex-row-reverse">
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('VerifyEmail', {
                    type: 'resetPassword',
                  });
                }}
              >
                <AppText className="text-primary font-sans-medium underline">
                  {t('FORGET_PASSWORD')}
                </AppText>
              </TouchableOpacity>
            </View>

            {/* Buttons */}
            <View className="gap-4">
              <AppButton
                variant="primary"
                size="lg"
                onPress={handleSubmit(onSubmit)}
                loading={isLoading}
                disabled={isLoading}
              >
                {t('LOGIN')}
              </AppButton>
            </View>

            {/* Sign Up Link */}
            <View className="flex-row justify-center items-center">
              <AppText className="text-foreground font-sans-medium">
                {t('DONT_HAVE_ACCOUNT_SIGNUP')}{' '}
              </AppText>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('VerifyEmail', {
                    type: 'register',
                  });
                }}
              >
                <AppText className="text-primary font-sans-medium underline">
                  {t('SIGNUP')}
                </AppText>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
