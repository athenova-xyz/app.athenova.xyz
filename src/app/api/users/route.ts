import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserFromSession } from "@/lib/auth";

export async function POST() {
    try {
        // Get user from Iron Session
        const user = await getCurrentUserFromSession();

        if (!user) {
            return NextResponse.json({
                error: "Authentication required",
                message: "Please complete SIWE authentication first"
            }, { status: 401 });
        }

        // Update user's last login time
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
            select: { id: true, walletAddress: true, role: true, lastLoginAt: true, createdAt: true }
        });

        return NextResponse.json({
            success: true,
            user: {
                id: updatedUser.id,
                walletAddress: updatedUser.walletAddress,
                role: updatedUser.role,
                lastLoginAt: updatedUser.lastLoginAt,
                createdAt: updatedUser.createdAt
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
