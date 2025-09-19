import { getSession } from '@/lib/session';

export async function logout() {
    const session = await getSession();
    if (session) await session.destroy();
    return { success: true };
}
