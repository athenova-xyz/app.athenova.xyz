import { SignInInput } from './schema';

export async function signIn(input: SignInInput) {
    // Placeholder logic: in real app, validate credentials against DB and return user
    // This mirrors existing `signup` logic shape and should be replaced with real auth checks.
    if (!input.email.includes('@') || input.password.length < 6) {
        return { success: false, error: 'Invalid credentials' };
    }

    // Simulate user record
    return {
        success: true,
        data: {
            id: 'user_' + Math.random().toString(36).slice(2, 9),
            email: input.email,
            role: 'user',
        },
    };
}
