import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { randomBytes, createHash } from "crypto";

// GET /api/auth/nonce - Issues a new nonce for SIWE challenge
export async function GET() {
    try {
        // Generate a random nonce and store hashed version with expiry
        const nonce = randomBytes(16).toString("hex");
        const hashed = createHash("sha256").update(nonce).digest("hex");
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        // Store hashed nonce in database
        await prisma.nonce.create({
            data: { hashed, expiresAt },
        });

        return NextResponse.json({ nonce });

    } catch {
        return NextResponse.json({
            error: "Internal server error",
            message: "Failed to generate nonce"
        }, { status: 500 });
    }
}
