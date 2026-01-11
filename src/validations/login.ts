import i18n from '@/config/i18n';
import { z } from 'zod';

// Helper function to get translated message
const t = (key: string) => i18n.t(key);

// Sign In Schema supporting credential (email or username)
export const getLoginSchema = () =>
  z.object({
    credential: z.string().min(1, t('VALIDATION.CREDENTIAL_REQUIRED')),
    password: z.string().min(1, t('VALIDATION.PASSWORD_REQUIRED')),
  });

export const loginSchema = getLoginSchema();
