import { getSession } from '@/lib/session';

export async function logout() {
    const session = await getSession();

    try {
        if (session) {
            await session.destroy();
        }

        return { success: true };
    } catch (error) {
        console.error('Failed to destroy session:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Failed to logout' };
    }
}
