import { IronSession } from 'iron-session';
import { SessionData } from '@/lib/session';
import { Result, success } from '@/lib/result';

export async function logout(session: IronSession<SessionData>): Promise<Result<{ success: boolean }>> {
    // Since we're using authActionClient, we know session exists
    // Destroy the session directly
    await session.destroy();
    return success({ success: true });
}
