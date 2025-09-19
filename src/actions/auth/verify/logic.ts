import { SiweMessage, type VerifyParams } from 'siwe';
import { hashNonce, consumeNonce } from '@/lib/auth';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function verifySiwe(messageStr: string, signature: string, headers: Headers) {
    const siwe = new SiweMessage(messageStr);
    const nonce = siwe.nonce;
    if (!nonce) throw new Error('Invalid SIWE message: missing nonce');

    const forwardedHostHeader = headers.get('x-forwarded-host') || headers.get('host') || '';

    let expectedDomain: string;
    if (process.env.NODE_ENV === 'production') {
        if (process.env.SIWE_DOMAIN && process.env.SIWE_DOMAIN.trim() !== '') {
            expectedDomain = process.env.SIWE_DOMAIN;
        } else {
            throw new Error('SIWE_DOMAIN must be set in production');
        }
    } else {
        expectedDomain = process.env.SIWE_DOMAIN ?? forwardedHostHeader;
    }

    // Constructed URI is not needed for verification but kept intentionally omitted
    const expectedChainId = process.env.SIWE_CHAIN_ID ? parseInt(process.env.SIWE_CHAIN_ID, 10) : undefined;
    const expectedStatement = process.env.SIWE_STATEMENT ?? undefined;

    if (expectedChainId && siwe.chainId !== expectedChainId) {
        throw new Error(`Chain mismatch, expected ${expectedChainId}`);
    }

    if (expectedStatement && siwe.statement !== expectedStatement) {
        throw new Error('SIWE statement mismatch');
    }

    try {
        const rpcUrl = process.env.SIWE_RPC_URL || process.env.RPC_URL || (expectedChainId === 1 ? 'https://cloudflare-eth.com' : undefined);
        const provider = rpcUrl ? new (await import('ethers')).JsonRpcProvider(rpcUrl) : undefined;

        const verifyOptions: VerifyParams = {
            signature,
            domain: expectedDomain,
            nonce
        } as unknown as VerifyParams;

        if (provider) (verifyOptions as unknown as { provider?: unknown }).provider = provider;

        await siwe.verify(verifyOptions);
    } catch (err) {
        throw err;
    }

    const hashed = hashNonce(nonce);
    const consumed = await consumeNonce(hashed);
    if (!consumed) throw new Error('Nonce invalid or already used');

    const walletAddr = siwe.address.toLowerCase();
    let user = await prisma.user.findUnique({ where: { walletAddress: walletAddr } });
    if (!user) {
        user = await prisma.user.create({ data: { walletAddress: walletAddr } });
    }

    const session = await getSession();
    session.user = { id: user.id };
    await session.save();

    return { success: true };
}
