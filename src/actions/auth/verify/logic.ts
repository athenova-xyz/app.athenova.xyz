import 'server-only';

import { consumeNonce, hashNonce } from '@/lib/auth';
import { SIWE_DOMAIN } from '@/lib/env';
import { prisma } from '@/lib/prisma';
import { failure, Result, success } from '@/lib/result';
import { getSession } from '@/lib/session';
import { SiweMessage } from 'siwe';
import { VerifySiweInput } from './schema';

export async function verifySiwe(input: VerifySiweInput): Promise<Result<{ success: boolean }>> {
  const siwe = new SiweMessage(input.message);
  const nonce = siwe.nonce;
  if (!nonce) {
    console.error('Verify error: Invalid SIWE message: missing nonce');
    return failure('Invalid SIWE message: missing nonce');
  }

  // Check verification without catching - if it fails, it will throw and be caught by action layer
  await siwe.verify({
    signature: input.signature,
    domain: SIWE_DOMAIN,
    nonce
  });

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
