import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifySession, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        // Extract session token from cookie or Authorization header
        const cookieHeader = req.headers.get("cookie") || "";
        const cookies = Object.fromEntries(
            cookieHeader.split(";").map((c) => {
                const [k, ...v] = c.split("=");
                return [k?.trim(), decodeURIComponent((v || []).join("=") || "")];
            })
        );

        const tokenFromCookie = cookies[COOKIE_NAME];
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
        const address = (session.walletAddress as string).toLowerCase();

        const user = await prisma.user.upsert({
            where: { walletAddress: address },
            update: { lastLoginAt: new Date() },
            create: {
                walletAddress: address,
                lastLoginAt: new Date()
            },
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

    } catch {
        return NextResponse.json({
            error: "Internal server error",
            message: "Failed to create or update user profile"
        }, { status: 500 });
    }
}
