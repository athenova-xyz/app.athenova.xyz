import 'server-only';

import { SiweMessage, type VerifyParams } from 'siwe';
import { JsonRpcProvider } from 'ethers';
import { hashNonce, consumeNonce } from '@/lib/auth';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { Result, success, failure } from '@/lib/result';

export async function verifySiwe(
  messageStr: string,
  signature: string,
  headers: Headers
): Promise<Result<{ success: boolean }>> {
  const siwe = new SiweMessage(messageStr);
  const nonce = siwe.nonce;
  if (!nonce) {
    console.error('Verify error: Invalid SIWE message: missing nonce');
    return failure('Invalid SIWE message: missing nonce');
  }

  const forwardedHostHeader = headers.get('x-forwarded-host') || headers.get('host') || '';

  let expectedDomain: string;
  if (process.env.NODE_ENV === 'production') {
    if (process.env.SIWE_DOMAIN && process.env.SIWE_DOMAIN.trim() !== '') {
      expectedDomain = process.env.SIWE_DOMAIN;
    } else {
      console.error('Verify error: SIWE_DOMAIN must be set in production');
      return failure('SIWE_DOMAIN must be set in production');
    }
  } else {
    expectedDomain = process.env.SIWE_DOMAIN ?? forwardedHostHeader;
  }

  // Constructed URI is not needed for verification but kept intentionally omitted
  const expectedChainId = process.env.SIWE_CHAIN_ID ? parseInt(process.env.SIWE_CHAIN_ID, 10) : undefined;
  const expectedStatement = process.env.SIWE_STATEMENT ?? undefined;

  if (expectedChainId && siwe.chainId !== expectedChainId) {
    console.error('Verify error: Chain mismatch', { expected: expectedChainId, actual: siwe.chainId });
    return failure(`Chain mismatch, expected ${expectedChainId}`);
  }

  if (expectedStatement && siwe.statement !== expectedStatement) {
    console.error('Verify error: SIWE statement mismatch');
    return failure('SIWE statement mismatch');
  }

  const rpcUrl =
    process.env.SIWE_RPC_URL ||
    process.env.RPC_URL ||
    (expectedChainId === 1 ? 'https://cloudflare-eth.com' : undefined);
  const provider = rpcUrl ? new JsonRpcProvider(rpcUrl) : undefined;

  const verifyOptions: VerifyParams & { provider?: JsonRpcProvider } = {
    signature,
    domain: expectedDomain,
    nonce
  };

  if (provider) {
    verifyOptions.provider = provider;
  }

  // Check verification without catching - if it fails, it will throw and be caught by action layer
  await siwe.verify(verifyOptions);

  const hashed = hashNonce(nonce);
  const consumed = await consumeNonce(hashed);
  if (!consumed) {
    console.error('Verify error: Nonce invalid or already used');
    return failure('Nonce invalid or already used');
  }

  const walletAddr = siwe.address.toLowerCase();
  let user = await prisma.user.findUnique({ where: { walletAddress: walletAddr } });
  if (!user) {
    user = await prisma.user.create({ data: { walletAddress: walletAddr } });
  }

  const session = await getSession();
  session.user = { id: user.id };
  await session.save();

  return success({ success: true });
}
