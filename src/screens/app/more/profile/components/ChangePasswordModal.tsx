import { AppButton, AppInput, AppText, Icon } from '@/components/ui';
import { useToast } from '@/components/ui/ToastProvider';
import { useVerifyEmail } from '@/hooks/useVerifyEmail';
import {
  getChangePasswordSchema,
  validatePasswordStrength,
} from '@/validations/password';
import { useEffect, useState } from 'react';
import { Modal, TouchableOpacity, View } from 'react-native';
import { useChangePassword } from '../hooks/useChangePassword';

interface ChangePasswordModalProps {
  visible: boolean;
  onClose: () => void;
  currentEmail: string;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  visible,
  onClose,
  currentEmail,
}) => {
  const { showSuccess, showError } = useToast();

  // Step management
  const [step, setStep] = useState<'verifyOtp' | 'changePassword'>('verifyOtp');

  // Step 1: Verify OTP
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [canSendOtp, setCanSendOtp] = useState(true);
  const [countdown, setCountdown] = useState(0);

  // Step 2: Change Password
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isOldPasswordVisible, setIsOldPasswordVisible] = useState(false);
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    oldPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  // Use verification hook
  const {
    sendVerification,
    isSendingVerification,
    confirmVerification,
    isConfirmingVerification,
    verificationData,
  } = useVerifyEmail({
    verificationType: 'CHANGE_PASSWORD',
    email: email,
    onSuccess: () => {
      setStep('changePassword');
    },
  });

  // Use change password hook
  const { changePassword, isChangingPassword } = useChangePassword({
    onSuccess: () => {
      showSuccess('Password changed successfully!');
      onClose();
    },
    onError: (error: string) => {
      setPasswordError(error);
    },
  });

  // Set email from current user when modal opens
  useEffect(() => {
    if (visible && currentEmail) {
      setEmail(currentEmail);
    }
  }, [visible, currentEmail]);

  // Update countdown when verification is sent
  useEffect(() => {
    if (verificationData?.waitSeconds) {
      const waitTime = Math.floor(verificationData.waitSeconds);
      setCountdown(waitTime);
      setCanSendOtp(false);
    }
  }, [verificationData]);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCanSendOtp(true);
    }
  }, [countdown]);

  // Reset state when modal closes
  useEffect(() => {
    if (!visible) {
      setStep('verifyOtp');
      setEmail('');
      setOtp('');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError('');
      setFieldErrors({});
      setCountdown(0);
      setCanSendOtp(true);
    }
  }, [visible]);

  const isValidEmail = (emailStr: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailStr);
  };

  const handleSendOtp = async () => {
    if (!isValidEmail(email)) {
      showError('Please enter a valid email address');
      return;
    }

    sendVerification({
      email,
      verificationType: 'CHANGE_PASSWORD',
    });
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 4) {
      showError('Please enter a valid 4-digit code');
      return;
    }

    confirmVerification({
      email,
      code: otp,
      verificationType: 'CHANGE_PASSWORD',
    });
  };

  const validatePasswords = () => {
    setPasswordError('');
    setFieldErrors({});

    const schema = getChangePasswordSchema();
    const result = schema.safeParse({
      oldPassword,
      newPassword,
      confirmPassword,
    });

    if (!result.success) {
      const errors: {
        oldPassword?: string;
        newPassword?: string;
        confirmPassword?: string;
      } = {};

      result.error.errors.forEach(err => {
        const field = err.path[0] as keyof typeof errors;
        if (!errors[field]) {
          errors[field] = err.message;
        }
      });

      setFieldErrors(errors);

      // Set general error message for the first error
      const firstError = result.error.errors[0];
      setPasswordError(firstError.message);
      return false;
    }

    return true;
  };

  // Real-time validation for new password
  const handleNewPasswordChange = (value: string) => {
    setNewPassword(value);

    if (value.length > 0) {
      const validation = validatePasswordStrength(value);
      if (!validation.isValid) {
        setFieldErrors(prev => ({
          ...prev,
          newPassword: validation.errors[0],
        }));
      } else {
        setFieldErrors(prev => ({
          ...prev,
          newPassword: undefined,
        }));
      }
    } else {
      setFieldErrors(prev => ({
        ...prev,
        newPassword: undefined,
      }));
    }
  };

  // Real-time validation for confirm password
  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);

    if (value.length > 0 && newPassword.length > 0) {
      if (value !== newPassword) {
        setFieldErrors(prev => ({
          ...prev,
          confirmPassword: 'Passwords do not match',
        }));
      } else {
        setFieldErrors(prev => ({
          ...prev,
          confirmPassword: undefined,
        }));
      }
    } else {
      setFieldErrors(prev => ({
        ...prev,
        confirmPassword: undefined,
      }));
    }
  };

  const handleChangePassword = async () => {
    if (!validatePasswords()) {
      return;
    }

    changePassword({
      oldPassword,
      newPassword,
      confirmPassword,
    });
  };

  const renderVerifyOtpStep = () => (
    <>
      <AppText variant="heading3" className="mb-2 text-center">
        Verify Email
      </AppText>
      <AppText variant="body" color="muted" className="mb-6 text-center">
        To change your password, we need to verify your email address first.
      </AppText>

      <View className="gap-4 mb-6">
        <View className="flex-row gap-2">
          <View className="flex-1">
            <AppText variant="body" weight="medium" className="mb-2">
              Email
            </AppText>
            <AppInput value={email} editable={false} />
          </View>
          <View className="pt-7">
            <AppButton
              variant="outline"
              onPress={handleSendOtp}
              disabled={
                !canSendOtp || isSendingVerification || !isValidEmail(email)
              }
              loading={isSendingVerification}
            >
              {countdown > 0 ? `Wait ${countdown}s` : 'Send OTP'}
            </AppButton>
          </View>
        </View>

        <View>
          <AppText variant="body" weight="medium" className="mb-2">
            Verification Code
          </AppText>
          <AppInput
            value={otp}
            onChangeText={setOtp}
            placeholder="Enter the 4-digit code"
            keyboardType="number-pad"
            maxLength={4}
          />
        </View>
      </View>

      <View className="flex-row gap-3">
        <AppButton variant="outline" onPress={onClose} className="flex-1">
          Cancel
        </AppButton>
        <AppButton
          onPress={handleVerifyOtp}
          disabled={isConfirmingVerification || !isValidEmail(email) || !otp}
          loading={isConfirmingVerification}
          className="flex-1"
        >
          {isConfirmingVerification ? 'Verifying...' : 'Verify & Continue'}
        </AppButton>
      </View>
    </>
  );

  const renderChangePasswordStep = () => (
    <>
      <AppText variant="heading3" className="mb-2 text-center">
        Change Password
      </AppText>
      <AppText variant="body" color="muted" className="mb-6 text-center">
        Enter your current password and choose a new password.
      </AppText>

      <View className="gap-4 mb-6">
        <View>
          <AppText variant="body" weight="medium" className="mb-2">
            Current Password
          </AppText>
          <AppInput
            value={oldPassword}
            onChangeText={setOldPassword}
            placeholder="Enter current password"
            secureTextEntry={!isOldPasswordVisible}
            errorText={fieldErrors.oldPassword}
            leftIcon={<Icon name="Lock" className="w-5 h-5 text-foreground" />}
            rightIcon={
              <TouchableOpacity
                onPress={() => setIsOldPasswordVisible(!isOldPasswordVisible)}
              >
                <Icon
                  name={isOldPasswordVisible ? 'EyeOff' : 'Eye'}
                  className="w-5 h-5 text-neutrals400"
                />
              </TouchableOpacity>
            }
          />
        </View>

        <View>
          <AppText variant="body" weight="medium" className="mb-2">
            New Password
          </AppText>
          <AppInput
            value={newPassword}
            onChangeText={handleNewPasswordChange}
            placeholder="Enter new password"
            secureTextEntry={!isNewPasswordVisible}
            errorText={fieldErrors.newPassword}
            leftIcon={<Icon name="Lock" className="w-5 h-5 text-foreground" />}
            rightIcon={
              <TouchableOpacity
                onPress={() => setIsNewPasswordVisible(!isNewPasswordVisible)}
              >
                <Icon
                  name={isNewPasswordVisible ? 'EyeOff' : 'Eye'}
                  className="w-5 h-5 text-neutrals400"
                />
              </TouchableOpacity>
            }
          />
          {!fieldErrors.newPassword && newPassword.length > 0 && (
            <AppText variant="bodySmall" color="muted" className="mt-1">
              Must be at least 8 characters with uppercase, lowercase, and
              number
            </AppText>
          )}
        </View>

        <View>
          <AppText variant="body" weight="medium" className="mb-2">
            Confirm New Password
          </AppText>
          <AppInput
            value={confirmPassword}
            onChangeText={handleConfirmPasswordChange}
            placeholder="Confirm new password"
            secureTextEntry={!isConfirmPasswordVisible}
            errorText={fieldErrors.confirmPassword}
            leftIcon={<Icon name="Lock" className="w-5 h-5 text-foreground" />}
            rightIcon={
              <TouchableOpacity
                onPress={() =>
                  setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
                }
              >
                <Icon
                  name={isConfirmPasswordVisible ? 'EyeOff' : 'Eye'}
                  className="w-5 h-5 text-neutrals400"
                />
              </TouchableOpacity>
            }
          />
        </View>
      </View>

      {passwordError ? (
        <AppText variant="bodySmall" className="text-error mb-4">
          {passwordError}
        </AppText>
      ) : null}

      <View className="flex-row gap-3">
        <AppButton variant="outline" onPress={onClose} className="flex-1">
          Cancel
        </AppButton>
        <AppButton
          onPress={handleChangePassword}
          disabled={isChangingPassword}
          loading={isChangingPassword}
          className="flex-1"
        >
          {isChangingPassword ? 'Changing...' : 'Change Password'}
        </AppButton>
      </View>
    </>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center">
        <View className="bg-background rounded-2xl p-6 mx-5 w-11/12 max-w-md">
          {step === 'verifyOtp' && renderVerifyOtpStep()}
          {step === 'changePassword' && renderChangePasswordStep()}
        </View>
      </View>
    </Modal>
  );
};
