import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { hashNonce } from "@/lib/auth";
import { Result, success } from "@/lib/result";

export async function issueNonce(): Promise<Result<{ nonce: string }>> {
    const nonce = randomBytes(16).toString("hex");
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    const hashed = hashNonce(nonce);

    await prisma.nonce.create({ data: { hashed, expiresAt } });

    return success({ nonce });
}
