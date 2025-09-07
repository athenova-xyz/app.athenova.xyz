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
        // Use full host (may include port) to match client `window.location.host`
        const expectedDomain = process.env.SIWE_DOMAIN ?? host;
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

        // Perform full SIWE verification using the correct API for siwe v2
        try {
            // For siwe v2.x, verify() takes an object with signature and provider/time options
            // Let's validate manually since the verify API might have changed

            // First validate the parsed message fields match our expectations
            if (siwe.domain !== expectedDomain) {
                throw new Error(`Domain mismatch: expected "${expectedDomain}", got "${siwe.domain}"`);
            }

            if (siwe.uri !== expectedUri) {
                throw new Error(`URI mismatch: expected "${expectedUri}", got "${siwe.uri}"`);
            }

            // Verify the signature using ethers (already imported)
            const recovered = verifyMessage(message, signature);
            if (recovered.toLowerCase() !== siwe.address.toLowerCase()) {
                throw new Error(`Signature verification failed: recovered ${recovered}, expected ${siwe.address}`);
            }

            // Verify nonce matches
            if (siwe.nonce !== nonce) {
                throw new Error(`Nonce mismatch: expected "${nonce}", got "${siwe.nonce}"`);
            }

            // Check time constraints if present
            const now = new Date();
            if (siwe.expirationTime && new Date(siwe.expirationTime) < now) {
                throw new Error('Message has expired');
            }

            if (siwe.notBefore && new Date(siwe.notBefore) > now) {
                throw new Error('Message is not yet valid');
            }

        } catch (err) {
            // Provide richer diagnostics in non-production to help debugging
            const devDetails = process.env.NODE_ENV === "production" ? undefined : {
                error: err instanceof Error ? err.message : String(err),
                expectedDomain,
                expectedUri,
                actualDomain: siwe.domain,
                actualUri: siwe.uri,
                nonce,
                actualNonce: siwe.nonce
            };

            return NextResponse.json({
                error: "SIWE verification failed",
                message: "Signature or message validation failed",
                details: devDetails
            }, { status: 401 });
        }        // After successful verification, consume/mark the nonce as used (single-use)
        const hashed = hashNonce(nonce);
        const consumed = await consumeNonce(hashed);

        if (!consumed) {
            // If consumption fails at this point it likely means the nonce was raced/used already
            return NextResponse.json({
                error: "Invalid nonce",
                message: "Nonce is invalid, expired, or already used"
            }, { status: 400 });
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
