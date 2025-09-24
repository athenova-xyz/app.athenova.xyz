import { z } from 'zod';

export const verifySiweSchema = z.object({
  message: z.string(),
  signature: z.string()
});

export type VerifySiweInput = z.infer<typeof verifySiweSchema>;
