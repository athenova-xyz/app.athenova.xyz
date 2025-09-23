import 'server-only';

import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { hashNonce } from "@/lib/auth";
import { Result, success, failure } from "@/lib/result";

export async function issueNonce(): Promise<Result<{ nonce: string }>> {
    let nonce = randomBytes(16).toString("hex");
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    const maxRetries = 2;
    let created = false;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        const hashed = hashNonce(nonce);

        // Check if nonce already exists
        const existing = await prisma.nonce.findUnique({ where: { hashed } });

        if (!existing) {
            // Create the nonce since it doesn't exist
            await prisma.nonce.create({ data: { hashed, expiresAt } });
            created = true;
            break;
        }

        // If collision and we have retries left, generate new nonce
        if (attempt < maxRetries) {
            nonce = randomBytes(16).toString("hex");
        }
    }

    if (!created) {
        console.error("Failed to create nonce after retries");
        return failure("Failed to create nonce after retries");
    }

    return success({ nonce });
}
