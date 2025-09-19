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
    .action(async ({ parsedInput }): Promise<SignupActionResult> => {
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
            // Set session
            const session = await getSession();
            session.user = { id: result.data.id };
            await session.save();

            return { data: result.data };
        } catch (sessionError) {
            console.error('Session creation error:', sessionError);
            // User was created but session failed - return success anyway since user exists
            return { data: result.data };
        }
    });