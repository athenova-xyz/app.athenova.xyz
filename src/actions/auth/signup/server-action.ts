'use server';

import { signup } from './logic';

export async function signupServerAction(name: string, email: string, password: string) {
    try {
        const result = await signup({ name, email, password });
        if (!result.success) {
            return { success: false, error: result.error };
        }

        return { success: true, user: result.data };
    } catch (error) {
        console.error('Signup error:', error);
        return { success: false, error: 'Internal server error' };
    }
}