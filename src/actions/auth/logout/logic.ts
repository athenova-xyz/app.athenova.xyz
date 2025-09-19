import { IronSession } from 'iron-session';
import { SessionData } from '@/lib/session';

export async function logout(session: IronSession<SessionData>) {
    try {
        // Since we're using authActionClient, we know session exists
        // Destroy the session directly
        await session.destroy();

        return { success: true };
    } catch (error) {
        console.error('Failed to destroy session:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Failed to logout' };
    }
}
