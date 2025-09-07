import jwt from "jsonwebtoken";
import { createHash } from "crypto";
import prisma from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret";
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
        // Find unused nonce that hasn't expired
        const record = await prisma.nonce.findUnique({ where: { hashed } });
        if (!record || record.used || new Date(record.expiresAt) < new Date()) {
            return null;
        }

        // Mark nonce as used (single-use)
        await prisma.nonce.update({
            where: { hashed },
            data: { used: true }
        });

        return record;
    } catch {
        return null;
    }
}
