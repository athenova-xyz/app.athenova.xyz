import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { getSession } from "./session";

export const COOKIE_NAME = "athena_session";

export function hashNonce(nonce: string) {
    return createHash("sha256").update(nonce).digest("hex");
}

export async function consumeNonce(hashed: string) {
    try {
        const now = new Date();
        const result = await prisma.nonce.updateMany({
            where: { hashed, used: false, expiresAt: { gt: now } },
            data: { used: true, usedAt: now },
        });
        if (result.count === 0) return null;
        const updated = await prisma.nonce.findUnique({ where: { hashed } });
        return updated ?? null;
    } catch { return null; }
}

// Get current user from Iron Session
export async function getCurrentUserFromSession() {
    try {
        const session = await getSession();
        if (!session.user?.id) return null;

        const user = await prisma.user.findFirst({
            where: { id: session.user.id }
        });
        return user ?? null;
    } catch {
        return null;
    }
}
