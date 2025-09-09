import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { randomBytes } from "crypto";
import { hashNonce } from "@/lib/auth";

// GET /api/auth/nonce - Issues a new nonce for SIWE challenge
export async function GET() {
    try {
        // Generate a random nonce and store hashed version with expiry.
        // On the extremely rare event of a hash collision (unique constraint),
        // retry a small fixed number of times with a new nonce.
        let nonce = randomBytes(16).toString("hex");
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        const maxRetries = 2; // try original + up to 2 regenerations
        let created = null;
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            const hashed = hashNonce(nonce);
            try {
                created = await prisma.nonce.create({ data: { hashed, expiresAt } });
                break; // success
            } catch (err: unknown) {
                // Prisma unique constraint violation code (P2002). Narrow safely.
                const prismaErr = (err && typeof err === "object") ? (err as { code?: unknown }) : undefined;
                const code = prismaErr && typeof prismaErr.code === "string" ? prismaErr.code : undefined;
                if (code === "P2002" && attempt < maxRetries) {
                    // regenerate nonce and retry
                    nonce = randomBytes(16).toString("hex");
                    continue;
                }

                // If it's not a unique constraint or retries exhausted, rethrow to outer catch
                throw err;
            }
        }

        if (!created) {
            // Shouldn't happen, but guard in case of unexpected failure
            throw new Error("Failed to create nonce after retries");
        }

        const res = NextResponse.json({ nonce });
        // Prevent intermediaries from caching nonces
        res.headers.set("Cache-Control", "no-store");
        return res;

    } catch (err) {
        console.error("nonce issuance failed", err);
        return NextResponse.json({
            error: "Internal server error",
            message: "Failed to generate nonce"
        }, { status: 500 });
    }
}
