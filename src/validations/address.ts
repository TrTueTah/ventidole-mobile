import { z } from 'zod';

export const addAddressSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  provinceCode: z.number().min(1, 'Province is required'),
  districtCode: z.number().min(1, 'District is required'),
  detailAddress: z.string().min(1, 'Detail address is required'),
  phoneNumber: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(11, 'Phone number must not exceed 11 digits')
    .regex(/^[0-9]+$/, 'Phone number must contain only digits'),
  isDefaultAddress: z.boolean().optional(),
  options: z.any().optional().nullable(),
});

export type AddAddressFormValues = z.infer<typeof addAddressSchema>;
