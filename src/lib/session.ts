import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { SESSION_SECRET } from './env';
import { COOKIE_NAME, SESSION_CONFIG } from './constants';

export type SessionData = {
    user?: {
        id: string;
    };
};

export async function getSession() {
    const session = await getIronSession<SessionData>(await cookies(), {
        password: SESSION_SECRET,
        cookieName: COOKIE_NAME,
        cookieOptions: {
            secure: SESSION_CONFIG.SECURE,
            httpOnly: SESSION_CONFIG.HTTP_ONLY,
            sameSite: SESSION_CONFIG.SAME_SITE,
            path: SESSION_CONFIG.PATH,
            maxAge: SESSION_CONFIG.MAX_AGE,
        }
    });

    return session;
}
