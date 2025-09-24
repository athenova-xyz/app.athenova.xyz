import { z } from 'zod';

export const signinSchema = z.object({
  message: z.string().min(1, 'SIWE message is required'),
  signature: z.string().min(1, 'Signature is required')
});

export type SigninInput = z.infer<typeof signinSchema>;
