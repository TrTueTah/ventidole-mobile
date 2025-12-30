import AuthCommonContainer from '@/components/auth/AuthCommonContainer';
import AppInput from '@/components/ui/AppInput';
import AppText from '@/components/ui/AppText';
import Checkbox from '@/components/ui/Checkbox';
import Icon from '@/components/ui/Icon';
import { useForm } from '@/hooks/useForm';
import { getSignUpSchema } from '@/validations/common';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useRef, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { z } from 'zod';
import { useSignUp } from './hooks/useSignUp';
import TermsModal, { TermsModalRef } from './TermsModal';

type SignUpRouteParams = {
  email?: string;
};

const SignUpScreen = () => {
  const route = useRoute();
  const params = route.params as SignUpRouteParams;
  const { email } = params || {};
  const navigation = useNavigation();
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const termsModalRef = useRef<TermsModalRef>(null);

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
      password: '',
      confirmPassword: '',
    },
    validationSchema: signUpSchema,
    mode: 'onBlur',
  });

  const handleContinue = (data: SignUpFormData) => {
    if (!termsAccepted) {
      return;
    }

    signUp({
      email: data.email,
      password: data.password,
      username: data.username,
    });
  };

  return (
    <AuthCommonContainer
      title="Please, fill your information"
      bottomButtonText="Continue"
      onBottomButtonPress={handleSubmit(handleContinue)}
      bottomButtonLoading={isLoading}
      bottomButtonDisabled={isLoading || !termsAccepted}
    >
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

      {/* Terms Checkbox */}
      <View className="mt-4 flex-row items-center">
        <Checkbox
          checked={termsAccepted}
          onValueChange={setTermsAccepted}
          variant="primary"
        />
        <View className="flex-1 ml-2 flex-row flex-wrap">
          <AppText className="text-sm text-neutrals300">
            I agree to the{' '}
          </AppText>
          <TouchableOpacity onPress={() => termsModalRef.current?.show()}>
            <AppText className="text-sm text-primary underline">
              Terms & Conditions
            </AppText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Terms Modal */}
      <TermsModal ref={termsModalRef} />
    </AuthCommonContainer>
  );
};

export default SignUpScreen;
