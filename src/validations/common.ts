import i18n from '@/config/i18n';
import { z } from 'zod';

// Helper function to get translated message
const t = (key: string) => i18n.t(key);

// Common validation schemas - customize for your app

export const getEmailSchema = () =>
  z.string().email(t('VALIDATION.INVALID_EMAIL'));

// Simple password schema for sign in (no complexity requirements)
export const getPasswordSchema = () =>
  z.string().min(8, t('VALIDATION.PASSWORD_MIN_LENGTH'));

// Strong password schema for sign up (with complexity requirements)
export const getStrongPasswordSchema = () =>
  z
    .string()
    .min(8, t('VALIDATION.PASSWORD_MIN_LENGTH'))
    .regex(/[A-Z]/, t('VALIDATION.PASSWORD_UPPERCASE'))
    .regex(/[a-z]/, t('VALIDATION.PASSWORD_LOWERCASE'))
    .regex(/[0-9]/, t('VALIDATION.PASSWORD_NUMBER'));

export const getPhoneSchema = () =>
  z.string().regex(/^\+?[1-9]\d{1,14}$/, t('VALIDATION.INVALID_PHONE'));

export const getUrlSchema = () => z.string().url(t('VALIDATION.INVALID_URL'));

// Example form validation schema
export const getContactFormSchema = () =>
  z.object({
    name: z
      .string()
      .min(1, t('VALIDATION.NAME_REQUIRED'))
      .max(100, t('VALIDATION.NAME_TOO_LONG')),
    email: getEmailSchema(),
    message: z
      .string()
      .min(10, t('VALIDATION.MESSAGE_MIN_LENGTH'))
      .max(1000, t('VALIDATION.MESSAGE_TOO_LONG')),
  });

// Sign In Schema
// Sign Up Schema
export const getSignUpSchema = () =>
  z
    .object({
      email: getEmailSchema(),
      username: z
        .string()
        .min(3, t('VALIDATION.USERNAME_MIN_LENGTH'))
        .max(50, t('VALIDATION.USERNAME_TOO_LONG')),
      password: z.string().min(8, t('VALIDATION.PASSWORD_MIN_LENGTH')),
      confirmPassword: z.string(),
    })
    .refine(data => data.password === data.confirmPassword, {
      message: t('VALIDATION.PASSWORDS_DONT_MATCH'),
      path: ['confirmPassword'],
    });

// Verify Email Schema (for OTP verification)
export const getVerifyEmailSchema = () =>
  z.object({
    email: getEmailSchema(),
    otp: z.string().length(4, t('VALIDATION.OTP_LENGTH')),
  });

// Reset Password Schema
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

// Legacy alias for compatibility
export const getRegisterFormSchema = () =>
  z
    .object({
      name: z.string().min(1, t('VALIDATION.NAME_REQUIRED')),
      email: getEmailSchema(),
      password: getStrongPasswordSchema(),
      confirmPassword: z.string(),
    })
    .refine(data => data.password === data.confirmPassword, {
      message: t('VALIDATION.PASSWORDS_DONT_MATCH'),
      path: ['confirmPassword'],
    });
// signInSchema moved to login.ts
export const signUpSchema = getSignUpSchema();
export const verifyEmailSchema = getVerifyEmailSchema();
export const resetPasswordSchema = getResetPasswordSchema();
// Legacy alias for compatibility

// Deprecated: Keep for backward compatibility, but prefer using getter functions
export const emailSchema = getEmailSchema();
export const passwordSchema = getPasswordSchema();
export const phoneSchema = getPhoneSchema();
export const urlSchema = getUrlSchema();
export const contactFormSchema = getContactFormSchema();
export const registerFormSchema = getRegisterFormSchema();

// Helper function to validate data
export const validateData = <T>(schema: z.ZodSchema<T>, data: unknown) => {
  const result = schema.safeParse(data);

  if (result.success) {
    return { isValid: true, data: result.data, errors: [] };
  }

  return {
    isValid: false,
    data: null,
    errors: result.error.errors.map(err => err.message),
  };
};
