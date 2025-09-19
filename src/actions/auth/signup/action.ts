'use server';

import { actionClient } from '@/lib/action';
import { signup } from './logic';
import { signupSchema } from './schema';
import { getSession } from '@/lib/session';

export const signupAction = actionClient
    .inputSchema(signupSchema)
    .metadata({ actionName: 'signup' })
    .action(async ({ parsedInput }): Promise<Record<string, unknown>> => {
        console.log('Signup action called with:', { email: parsedInput.email, hasName: !!parsedInput.name });

        let result;
        try {
            result = await signup(parsedInput);
        } catch (err) {
            console.error('signup() threw an error:', err);
            return { serverError: 'Internal server error' } as unknown as Record<string, unknown>;
        }

        if (!result.success) {
            console.log('Signup failed:', result.error);
            // Return a structured serverError so the client can present it
            return { serverError: result.error } as unknown as Record<string, unknown>;
        }

        console.log('Signup successful, setting session for user:', result.data.id);

        try {
            // Set session
            const session = await getSession();
            session.user = { id: result.data.id };
            await session.save();

            console.log('Session saved successfully');

            return { data: result.data } as unknown as Record<string, unknown>;
        } catch (sessionError) {
            console.error('Session creation error:', sessionError);
            // User was created but session failed - return success data anyway
            return { data: result.data } as unknown as Record<string, unknown>;
        }
    });