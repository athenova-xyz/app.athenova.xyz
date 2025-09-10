import jwt from "jsonwebtoken";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";

const envJwt = process.env.JWT_SECRET;
if (process.env.NODE_ENV === "production" && (!envJwt || envJwt.trim() === "")) {
    throw new Error("JWT_SECRET must be set in production environment");
}

// Use provided secret in all environments; fall back to a non-empty dev value in non-production
const JWT_SECRET = envJwt ?? "local-dev-secret";
export const COOKIE_NAME = "athena_session";

export function signSession(payload: Record<string, unknown>) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifySession(token: string) {
    try {
        return jwt.verify(token, JWT_SECRET) as Record<string, unknown> | null;
    } catch {
        return null;
    }
}

export function hashNonce(nonce: string) {
    return createHash("sha256").update(nonce).digest("hex");
}

export async function consumeNonce(hashed: string) {
    try {
        // Atomically mark a matching unused, unexpired nonce as used.
        // This avoids a read-then-write race: updateMany will only affect rows
        // where used = false and expiresAt > now(). If count is 0, nothing matched.
        const now = new Date();
        const result = await prisma.nonce.updateMany({
            where: {
                hashed,
                used: false,
                expiresAt: { gt: now },
            },
            data: { used: true, usedAt: now },
        });

        if (result.count === 0) return null;

        // Return the record as it now exists (marked used)
        const updated = await prisma.nonce.findUnique({ where: { hashed } });
        return updated ?? null;
    } catch {
        return null;
    }
}
