import { NextResponse } from "next/server";
import { verifyMessage } from "ethers";
import { hashNonce, consumeNonce, signSession, COOKIE_NAME } from "@/lib/auth";
import { SiweMessage } from "siwe";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { message, signature } = body ?? {};

        if (!message || !signature) {
            return NextResponse.json({
                error: "Missing required fields",
                message: "Both message and signature are required"
            }, { status: 400 });
        }

        const siwe = new SiweMessage(message);
        const nonce = siwe.nonce;

        if (!nonce) {
            return NextResponse.json({
                error: "Invalid SIWE message",
                message: "Message must contain a valid nonce"
            }, { status: 400 });
        }

        // Verify and consume nonce (single-use)
        const hashed = hashNonce(nonce);
        const consumed = await consumeNonce(hashed);

        if (!consumed) {
            return NextResponse.json({
                error: "Invalid nonce",
                message: "Nonce is invalid, expired, or already used"
            }, { status: 400 });
        }

        // Verify signature matches message and address
        const recovered = verifyMessage(message, signature);
        if (recovered.toLowerCase() !== siwe.address.toLowerCase()) {
            return NextResponse.json({
                error: "Signature verification failed",
                message: "Signature does not match the message"
            }, { status: 401 });
        }

        // Create session token
        const token = signSession({ walletAddress: siwe.address.toLowerCase() });

        const response = NextResponse.json({ success: true });
        response.cookies.set(COOKIE_NAME, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 7 * 24 * 60 * 60, // 7 days
        });

        return response;

    } catch {
        return NextResponse.json({
            error: "Internal server error",
            message: "Failed to verify signature"
        }, { status: 500 });
    }
}
