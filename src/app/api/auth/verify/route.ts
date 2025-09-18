import { NextResponse } from "next/server";
import { hashNonce, consumeNonce } from "@/lib/auth";
import { getSession } from "@/lib/session";
import { SiweMessage, type VerifyParams } from "siwe";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        let body: unknown;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({
                error: "Invalid JSON",
                message: "Request body must be valid JSON"
            }, { status: 400 });
        }

        const parsed = (body && typeof body === "object") ? (body as Record<string, unknown>) : {};
        const message = parsed["message"] as unknown;
        const signature = parsed["signature"] as unknown;

        if (typeof message !== "string" || typeof signature !== "string" || !message || !signature) {
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
        // Prefer the X-Forwarded-Host header (set by proxies) and fall back to Host.
        const forwardedHostHeader = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
        const forwardedProto = req.headers.get("x-forwarded-proto") || undefined;
        const proto = forwardedProto ?? (process.env.NODE_ENV === "production" ? "https" : "http");

        // In production require SIWE_DOMAIN to be explicitly configured and use it exclusively.
        let expectedDomain: string;
        if (process.env.NODE_ENV === "production") {
            if (process.env.SIWE_DOMAIN && process.env.SIWE_DOMAIN.trim() !== "") {
                expectedDomain = process.env.SIWE_DOMAIN;
            } else {
                return NextResponse.json({
                    error: "Server misconfiguration",
                    message: "SIWE_DOMAIN must be set in production to validate incoming SIWE messages"
                }, { status: 500 });
            }
        } else {
            // In non-production prefer configured SIWE_DOMAIN or the forwarded host (including port)
            // This matches how browsers set window.location.host during local dev (e.g., localhost:3000)
            expectedDomain = process.env.SIWE_DOMAIN ?? forwardedHostHeader;
        }

        // Build expected URI from chosen proto and the forwarded host (preserves port if present)
        const expectedUri = process.env.SIWE_URI ?? `${proto}://${forwardedHostHeader}`;

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

        // Replace manual verification with SiweMessage.verify (siwe v2) which handles signature, nonce,
        // time validation and EIP-1271 contract-wallet checks when a provider is supplied.
        try {
            // Build an ethers provider. Prefer configured RPC URL, otherwise fall back to a public mainnet RPC for chainId 1.
            const rpcUrl = process.env.SIWE_RPC_URL || process.env.RPC_URL || (expectedChainId === 1 ? "https://cloudflare-eth.com" : undefined);
            // Dynamically import ethers to avoid top-level environment issues in edge or serverless runtimes
            const provider = rpcUrl ? new (await import("ethers")).JsonRpcProvider(rpcUrl) : undefined;

            const verifyOptions: VerifyParams = {
                signature: signature as string,
                domain: expectedDomain,
                nonce: nonce as string,
            };

            if (provider) (verifyOptions as unknown as { provider?: unknown }).provider = provider;

            // siwe v2 verify will throw on failure
            await siwe.verify(verifyOptions);

        } catch (err) {
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

        // Create or find user
        const walletAddr = siwe.address.toLowerCase();
        let user = await prisma.user.findUnique({ where: { walletAddress: walletAddr } });

        if (!user) {
            user = await prisma.user.create({
                data: { walletAddress: walletAddr },
            });
        }

        // Create Iron Session
        const session = await getSession();
        session.user = { id: user.id };
        await session.save();

        return NextResponse.json({ success: true });

    } catch (err) {
        console.error("siwe verify failed", err);
        return NextResponse.json({
            error: "Internal server error",
            message: "Failed to verify signature"
        }, { status: 500 });
    }
}
