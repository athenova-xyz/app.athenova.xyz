import jwt from "jsonwebtoken";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";

interface RequestCookies { get(name: string): { value: string } | undefined; }

const envJwt = process.env.JWT_SECRET;
if (process.env.NODE_ENV === "production" && (!envJwt || envJwt.trim() === "")) {
    throw new Error("JWT_SECRET must be set in production environment");
}

const JWT_SECRET = envJwt ?? "local-dev-secret";
export const COOKIE_NAME = "athena_session";

export function signSession(payload: Record<string, unknown>) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifySession(token: string) {
    try { return jwt.verify(token, JWT_SECRET) as Record<string, unknown> | null; } catch { return null; }
}

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

// Resolve current user from cookie/session
export async function getCurrentUserFromCookie(cookieStore: RequestCookies | Promise<RequestCookies> | undefined) {
    try {
        if (!cookieStore) return null;
        const store = await cookieStore;
        const token = store.get(COOKIE_NAME)?.value;
        if (!token) return null;
        const session = verifySession(token);
        if (!session || typeof session.walletAddress !== "string") return null;
        const addr = (session.walletAddress as string).toLowerCase();
        const user =
            (await prisma.user.findUnique({ where: { walletAddress: addr } })) ??
            (await prisma.user.findFirst({ where: { walletAddress: { equals: addr, mode: "insensitive" } } }));
        return user ?? null;
    } catch { return null; }
}
