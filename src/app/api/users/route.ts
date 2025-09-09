import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { verifySession, COOKIE_NAME } from "@/lib/auth";
import { isAddress } from "ethers";

export async function POST(req: NextRequest) {
    try {
        // Extract session token from cookie or Authorization header
        const tokenFromCookie = req.cookies.get(COOKIE_NAME)?.value;
        const authHeader = req.headers.get("authorization") || "";
        const tokenFromHeader = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : undefined;

        const sessionToken = tokenFromCookie || tokenFromHeader;

        // Verify authentication session
        if (!sessionToken) {
            return NextResponse.json({
                error: "Authentication required",
                message: "Please complete SIWE authentication first"
            }, { status: 401 });
        }

        const session = verifySession(sessionToken);
        if (!session || !session.walletAddress) {
            return NextResponse.json({
                error: "Invalid or expired session",
                message: "Please re-authenticate using SIWE flow"
            }, { status: 401 });
        }

        // Create or update user with verified wallet address from session
        const rawAddress = session.walletAddress as string;

        // Validate format server-side
        if (typeof rawAddress !== "string" || !isAddress(rawAddress)) {
            return NextResponse.json({ error: "invalid walletAddress" }, { status: 400 });
        }

        const address = rawAddress.toLowerCase();

        const user = await prisma.user.upsert({
            where: { walletAddress: address },
            update: { lastLoginAt: new Date() },
            create: {
                walletAddress: address,
                lastLoginAt: new Date()
            },
            select: { id: true, walletAddress: true, role: true, lastLoginAt: true, createdAt: true }
        });

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                walletAddress: user.walletAddress,
                role: user.role,
                lastLoginAt: user.lastLoginAt,
                createdAt: user.createdAt
            }
        });

    } catch (err) {
        // Generate a short error id for observability and avoid returning raw errors to clients
        const eid = (globalThis as unknown as { crypto?: { randomUUID?: () => string } }).crypto?.randomUUID?.() ?? Date.now().toString();
        console.error(`/api/users POST error [${eid}]`, err);
        return NextResponse.json({
            error: "internal server error",
            message: "Failed to create or update user profile",
            eid
        }, { status: 500 });
    }
}
