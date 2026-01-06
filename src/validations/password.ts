import i18n from '@/config/i18n';
import { z } from 'zod';

// Helper function to get translated message
const t = (key: string) => i18n.t(key);

// Password validation schema for change password
export const getChangePasswordSchema = () =>
  z
    .object({
      oldPassword: z.string().min(1, t('VALIDATION.OLD_PASSWORD_REQUIRED')),
      newPassword: z
        .string()
        .min(8, t('VALIDATION.PASSWORD_MIN_LENGTH'))
        .regex(/[A-Z]/, t('VALIDATION.PASSWORD_UPPERCASE'))
        .regex(/[a-z]/, t('VALIDATION.PASSWORD_LOWERCASE'))
        .regex(/[0-9]/, t('VALIDATION.PASSWORD_NUMBER')),
      confirmPassword: z
        .string()
        .min(1, t('VALIDATION.CONFIRM_PASSWORD_REQUIRED')),
    })
    .refine(data => data.newPassword === data.confirmPassword, {
      message: t('VALIDATION.PASSWORDS_MUST_MATCH'),
      path: ['confirmPassword'],
    })
    .refine(data => data.oldPassword !== data.newPassword, {
      message: t('VALIDATION.NEW_PASSWORD_SAME_AS_OLD'),
      path: ['newPassword'],
    });

export type ChangePasswordFormData = z.infer<
  ReturnType<typeof getChangePasswordSchema>
>;

// Validation helper functions for real-time feedback
export const validatePasswordStrength = (
  password: string,
): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push(t('VALIDATION.PASSWORD_MIN_LENGTH'));
  }

  if (!/[A-Z]/.test(password)) {
    errors.push(t('VALIDATION.PASSWORD_UPPERCASE'));
  }

  if (!/[a-z]/.test(password)) {
    errors.push(t('VALIDATION.PASSWORD_LOWERCASE'));
  }

  if (!/[0-9]/.test(password)) {
    errors.push(t('VALIDATION.PASSWORD_NUMBER'));
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validatePasswordMatch = (
  password: string,
  confirmPassword: string,
): boolean => {
  return password === confirmPassword;
};
