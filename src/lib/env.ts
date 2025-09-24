import 'server-only';

export const SESSION_SECRET = process.env.SESSION_SECRET as string;

if (!SESSION_SECRET || SESSION_SECRET.trim() === '') {
  throw new Error('SESSION_SECRET must be set');
}

export const NODE_ENV = process.env.NODE_ENV || 'development';
export const SIWE_DOMAIN = process.env.SIWE_DOMAIN;
export const NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
