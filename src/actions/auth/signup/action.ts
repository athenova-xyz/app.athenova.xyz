'use server';

import { actionClient } from '@/lib/action';
import { signup } from './logic';
import { signupSchema } from './schema';
import { getSession } from '@/lib/session';

type SignupActionResult = {
    serverError?: string;
    data?: {
        id: string;
        email: string | null;
        role: string;
    };
};

export const signupAction = actionClient
    .inputSchema(signupSchema)
    .metadata({ actionName: 'signup' })
    .action(async ({ parsedInput, ctx }): Promise<SignupActionResult> => {
        // Validate required fields
        if (!parsedInput.email) {
            return { serverError: 'Email is required' };
        }

        let result;
        try {
            result = await signup(parsedInput);
        } catch (err) {
            console.error('signup() threw an error:', err);
            return { serverError: 'Failed to create account. Please try again.' };
        }

        if (!result.success) {
            return { serverError: result.error };
        }

        try {
            const { session } = ctx as { session: Awaited<ReturnType<typeof getSession>> };
            session.user = { id: result.data.id };
            await session.save();
            return { data: result.data };
        } catch (sessionError) {
            console.error('Session creation error:', sessionError);
            return { serverError: "Account created, but couldn't sign you in automatically. Please log in." };
        }
    });