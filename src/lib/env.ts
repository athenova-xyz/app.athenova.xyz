import "server-only";
// Environment variables with validation
const envSessionSecret = process.env.SESSION_SECRET ?? process.env.CI_SESSION_SECRET;
// Enforce the presence of a strong secret when running in CI or on hosting platforms.
const isOfficialProductionCheck = process.env.NODE_ENV === 'production' && (process.env.CI === 'true' || !!process.env.VERCEL);
if (isOfficialProductionCheck) {
    if (!envSessionSecret || envSessionSecret.trim() === '') {
        throw new Error('SESSION_SECRET must be set in production environment');
    }
    if (envSessionSecret.length < 32) {
        throw new Error('SESSION_SECRET must be at least 32 characters long in production');
    }
}

// Allow a safe fallback for local builds (keeps developer DX) but prefer explicit secrets.
export const SESSION_SECRET = envSessionSecret ?? 'local-dev-session-secret-32-chars-min';
export const NODE_ENV = process.env.NODE_ENV || "development";
export const SIWE_DOMAIN = process.env.SIWE_DOMAIN;
export const SIWE_URI = process.env.SIWE_URI;
export const SIWE_CHAIN_ID = process.env.SIWE_CHAIN_ID ? parseInt(process.env.SIWE_CHAIN_ID, 10) : undefined;
export const SIWE_STATEMENT = process.env.SIWE_STATEMENT;
export const SIWE_RPC_URL = process.env.SIWE_RPC_URL || process.env.RPC_URL;
export const NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;