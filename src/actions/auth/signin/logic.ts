import 'server-only';

import { SiweMessage, type VerifyParams } from 'siwe';
import { hashNonce, consumeNonce } from '@/lib/auth';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { Result, success, failure } from '@/lib/result';
import { SigninInput } from './schema';

type UserData = {
    id: string;
    walletAddress: string | null;
    role: string;
    lastLoginAt: Date | null;
    createdAt: Date;
};

export async function signin(input: SigninInput, headers: Headers): Promise<Result<UserData>> {
    const { message: messageStr, signature } = input;

    try {
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

            const verifyOptions: VerifyParams & { provider?: import('ethers').JsonRpcProvider } = {
                signature,
                domain: expectedDomain,
                nonce
            };

            if (provider) {
                verifyOptions.provider = provider;
            }

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

        // Update last login
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
            select: { id: true, walletAddress: true, role: true, lastLoginAt: true, createdAt: true }
        });

        const session = await getSession();
        session.user = { id: user.id };
        await session.save();

        return success(updatedUser);
    } catch (err) {
        // Log full error for observability, but return generic message to client
        if (err instanceof Error) {
            console.error('Sign-in error:', err.stack || err.message);
        } else {
            try {
                console.error('Sign-in error (non-Error):', JSON.stringify(err));
            } catch {
                console.error('Sign-in error (non-Error, unstringifiable):', String(err));
            }
        }

        return failure('Sign-in failed');
    }
}