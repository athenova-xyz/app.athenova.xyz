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

        // Prepare expected values for SIWE verification
        const host = req.headers.get("host") || "";
        const forwardedProto = req.headers.get("x-forwarded-proto") || undefined;
        const proto = forwardedProto ?? (process.env.NODE_ENV === "production" ? "https" : "http");
        const expectedDomain = process.env.SIWE_DOMAIN ?? host.split(":")[0];
        const expectedUri = process.env.SIWE_URI ?? `${proto}://${host}`;

        // Optional server-side expectations
        const expectedChainId = process.env.SIWE_CHAIN_ID ? parseInt(process.env.SIWE_CHAIN_ID, 10) : undefined;
        const expectedStatement = process.env.SIWE_STATEMENT ?? undefined;

        // Validate basic SIWE fields before crypto verification
        if (expectedChainId && siwe.chainId !== expectedChainId) {
            return NextResponse.json({
                error: "Chain mismatch",
                message: `Expected chainId ${expectedChainId}`
            }, { status: 401 });
        }

        if (expectedStatement && siwe.statement !== expectedStatement) {
            return NextResponse.json({
                error: "Invalid statement",
                message: "SIWE statement does not match server expectation"
            }, { status: 401 });
        }

        try {
            // @ts-expect-error - some siwe versions have slightly different typings for verify options
            await siwe.verify({ signature, domain: expectedDomain, uri: expectedUri, nonce, time: new Date() });
        } catch {
            return NextResponse.json({
                error: "SIWE verification failed",
                message: "Signature or message validation failed"
            }, { status: 401 });
        }

        // After successful verification, consume/mark the nonce as used (single-use)
        const hashed = hashNonce(nonce);
        const consumed = await consumeNonce(hashed);

        if (!consumed) {
            // If consumption fails at this point it likely means the nonce was raced/used already
            return NextResponse.json({
                error: "Invalid nonce",
                message: "Nonce is invalid, expired, or already used"
            }, { status: 400 });
        }

        // Extra safety: ensure recovered address (from signature) matches the parsed SIWE address
        const recovered = verifyMessage(message, signature);
        if (recovered.toLowerCase() !== siwe.address.toLowerCase()) {
            return NextResponse.json({
                error: "Address mismatch",
                message: "Recovered address does not match SIWE message address"
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
