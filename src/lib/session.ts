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
  try {
    const session = await getIronSession<SessionData>(await cookies(), {
      password: SESSION_SECRET,
      cookieName: COOKIE_NAME,
      cookieOptions: {
        secure: SESSION_CONFIG.SECURE,
        httpOnly: SESSION_CONFIG.HTTP_ONLY,
        sameSite: SESSION_CONFIG.SAME_SITE,
        path: SESSION_CONFIG.PATH,
        maxAge: SESSION_CONFIG.MAX_AGE
      }
    });
    return session;
  } catch (error) {
    // If an error occurs during session retrieval (e.g., malformed cookie),
    // return an empty session object to ensure resilience.
    // The expected shape of the session object is { user?: { id: string; }; }.
    // Manual test: Clear all cookies in your browser and refresh the page.
    // The application should not crash and should behave as if no user is logged in.
    console.error('Error retrieving session:', error);
    return { user: undefined };
  }
}
