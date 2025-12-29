import { useState, useEffect } from 'react';
import { View, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { z } from 'zod';
import AppButton from '@/components/ui/AppButton';
import AppInput from '@/components/ui/AppInput';
import AppText from '@/components/ui/AppText';
import Icon from '@/components/ui/Icon';
import AuthTitle from '@/components/auth/AuthTitle';
import BackButton from '@/components/auth/BackButton';
import { useForm } from '@/hooks/useForm';
import { getSignUpSchema } from '@/validations/common';
import { useSignUp } from './hooks/useSignUp';

type SignUpRouteParams = {
  email?: string;
};

const SignUpScreen = () => {
  const route = useRoute();
  const params = route.params as SignUpRouteParams;
  const { email } = params || {};
  const navigation = useNavigation();
  const [showPassword, setShowPassword] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [pendingSignUpData, setPendingSignUpData] = useState<any>(null);

  const { signUp, isLoading, isSuccess } = useSignUp();

  const signUpSchema = getSignUpSchema();
  type SignUpFormData = z.infer<typeof signUpSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    defaultValues: {
      email: email || '',
      username: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: signUpSchema,
    mode: 'onBlur',
  });

  // Navigate after successful sign up
  useEffect(() => {
    if (isSuccess) {
      navigation.navigate('AuthComplete', {
        type: 'register',
        title: 'Registration Complete',
        subtitle: 'Welcome! Discover various features to get started.',
      });
    }
  }, [isSuccess, navigation]);

  const handleContinue = (data: SignUpFormData) => {
    // For now, directly submit. Can add terms modal later if needed
    signUp({
      email: data.email,
      password: data.password,
      username: data.username,
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
                  <AuthTitle title="Please, fill your information" />

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
                      {...register('username')}
                      label="Username"
                      placeholder="Enter your username"
                      autoCapitalize="none"
                      errorText={errors.username?.message}
                    />

                    <AppInput
                      {...register('phoneNumber')}
                      label="Phone Number"
                      placeholder="Enter your phone number"
                      keyboardType="phone-pad"
                      errorText={errors.phoneNumber?.message}
                    />

                    <AppInput
                      {...register('password')}
                      label="Password"
                      placeholder="Enter your password"
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
                      label="Confirm Password"
                      placeholder="Re-enter your password"
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
                Continue
              </AppButton>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

export default SignUpScreen;