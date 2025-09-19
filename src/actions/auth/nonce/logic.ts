import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { hashNonce } from "@/lib/auth";

export async function issueNonce() {
    let nonce = randomBytes(16).toString("hex");
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    const maxRetries = 2;
    let created = null;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        const hashed = hashNonce(nonce);
        try {
            created = await prisma.nonce.create({ data: { hashed, expiresAt } });
            break;
        } catch (err: unknown) {
            const prismaErr = err && typeof err === "object" && 'code' in err ? err as { code: string } : undefined;
            const code = prismaErr && typeof prismaErr.code === "string" ? prismaErr.code : undefined;
            if (code === "P2002" && attempt < maxRetries) {
                nonce = randomBytes(16).toString("hex");
                continue;
            }
            throw err;
        }
    }

    if (!created) throw new Error("Failed to create nonce after retries");

    return { nonce };
}
