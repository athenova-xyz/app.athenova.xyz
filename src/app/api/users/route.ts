import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { walletAddress } = body ?? {};
        if (!walletAddress || typeof walletAddress !== "string") {
            return NextResponse.json({ error: "walletAddress is required" }, { status: 400 });
        }

        const address = walletAddress.toLowerCase();

        const user = await prisma.user.upsert({
            where: { walletAddress: address },
            update: { lastLoginAt: new Date() },
            create: { walletAddress: address, lastLoginAt: new Date() },
        });

        return NextResponse.json({ ok: true, user });
    } catch (err) {
        console.error("/api/users POST error:", err);
        return NextResponse.json({ error: "internal server error" }, { status: 500 });
    }
}
