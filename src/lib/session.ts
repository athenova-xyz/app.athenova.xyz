import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

export type SessionData = {
    user?: {
        id: string;
    };
};

const sessionSecret = process.env.SESSION_SECRET;
if (process.env.NODE_ENV === 'production') {
    if (!sessionSecret || sessionSecret.trim() === '') {
        throw new Error('SESSION_SECRET must be set in production environment');
    }
    if (sessionSecret.length < 32) {
        throw new Error('SESSION_SECRET must be at least 32 characters long in production');
    }
}

const SESSION_PASSWORD = sessionSecret ?? 'local-dev-session-secret-32-chars-min';
const cookieName = 'athena_session';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

export async function getSession() {
    const session = await getIronSession<SessionData>(await cookies(), {
        password: SESSION_PASSWORD,
        cookieName: cookieName,
        cookieOptions: {
            secure: IS_PRODUCTION,
            httpOnly: true
        }
    });

    return session;
}
