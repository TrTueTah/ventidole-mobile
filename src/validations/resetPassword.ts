import i18n from '@/config/i18n';
import { z } from 'zod';
import { getEmailSchema } from './common';

// Helper function to get translated message
const t = (key: string) => i18n.t(key);

// Reset Password Schema (without email)
export const getResetPasswordSchema = () =>
  z
    .object({
      password: z.string().min(8, t('VALIDATION.PASSWORD_MIN_LENGTH')),
      confirmPassword: z.string(),
    })
    .refine(data => data.password === data.confirmPassword, {
      message: t('VALIDATION.PASSWORDS_DONT_MATCH'),
      path: ['confirmPassword'],
    });

// Reset Password with Email Schema (for API call)
export const getResetPasswordWithEmailSchema = () =>
  z
    .object({
      email: getEmailSchema(),
      password: z.string().min(8, t('VALIDATION.PASSWORD_MIN_LENGTH')),
      confirmPassword: z.string(),
    })
    .refine(data => data.password === data.confirmPassword, {
      message: t('VALIDATION.PASSWORDS_DONT_MATCH'),
      path: ['confirmPassword'],
    });

// Legacy aliases for compatibility
export const resetPasswordSchema = getResetPasswordSchema();
