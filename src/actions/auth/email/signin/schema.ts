import * as z from 'zod';

export const signInSchema = z.object({
    email: z.string().email(),
    password: z.string().nonempty(),
});

export type SignInInput = z.infer<typeof signInSchema>;
