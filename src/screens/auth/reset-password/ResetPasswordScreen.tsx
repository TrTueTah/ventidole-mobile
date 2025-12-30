import AuthTitle from '@/components/auth/AuthTitle';
import BackButton from '@/components/auth/BackButton';
import AppButton from '@/components/ui/AppButton';
import AppInput from '@/components/ui/AppInput';
import Icon from '@/components/ui/Icon';
import { useForm } from '@/hooks/useForm';
import { getResetPasswordWithEmailSchema } from '@/validations/common';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { z } from 'zod';
import { useResetPassword } from './hooks/useResetPassword';

type ResetPasswordRouteParams = {
  email: string;
};

const ResetPasswordScreen = () => {
  const route = useRoute();
  const params = route.params as ResetPasswordRouteParams;
  const { email } = params || {};
  const navigation = useNavigation();
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
                  <AuthTitle title="Reset your password" />

                  {/* Input Fields */}
                  <View className="w-full gap-2">
                    <AppInput
                      {...register('email')}
                      label="Email"
                      placeholder="Enter your email"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      editable={false}
                      errorText={errors.email?.message}
                      containerClassName="opacity-60"
                    />

                    <AppInput
                      {...register('password')}
                      label="New Password"
                      placeholder="Enter your new password"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
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

                    <AppInput
                      {...register('confirmPassword')}
                      label="Confirm New Password"
                      placeholder="Re-enter your new password"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      errorText={errors.confirmPassword?.message}
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
                </View>
              </ScrollView>
            </View>

            {/* Bottom Button */}
            <View className="py-4">
              <AppButton
                variant="primary"
                size="lg"
                onPress={handleSubmit(handleContinue)}
                loading={isLoading}
                disabled={isLoading}
              >
                Reset Password
              </AppButton>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

export default ResetPasswordScreen;
