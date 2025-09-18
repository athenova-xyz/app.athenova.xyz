import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

export type SessionData = {
    user?: {
        id: string;
    };
};

const sessionSecret = process.env.SESSION_SECRET;
if (process.env.NODE_ENV === 'production' && (!sessionSecret || sessionSecret.trim() === '')) {
    throw new Error('SESSION_SECRET must be set in production environment');
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
