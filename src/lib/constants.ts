export const COOKIE_NAME = "athena_session";

// Session configuration
export const SESSION_CONFIG = {
    MAX_AGE: 7 * 24 * 60 * 60, // 7 days
    SECURE: process.env.NODE_ENV === "production",
    HTTP_ONLY: true,
    SAME_SITE: "lax" as const,
    PATH: "/",
} as const;

// Auth constants
export const AUTH_CONSTANTS = {
    NONCE_EXPIRY_MINUTES: 10,
    MIN_SESSION_SECRET_LENGTH: 32,
} as const;

// API Error messages
export const ERROR_MESSAGES = {
    UNAUTHORIZED: "Unauthorized",
    INVALID_JSON: "Invalid JSON",
    MISSING_FIELDS: "Missing required fields",
    INVALID_NONCE: "Invalid or expired nonce",
    INVALID_SIGNATURE: "Invalid signature",
    AUTHENTICATION_FAILED: "Authentication failed",
    NETWORK_ERROR: "Network error. Please try again.",
    INTERNAL_ERROR: "Internal server error",
    SESSION_EXPIRED: "Session expired",
} as const;