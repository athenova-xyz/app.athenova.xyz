import { prisma } from '@/lib/prisma';
import { getCurrentUserFromSession } from '@/lib/auth';

export async function getOrUpdateCurrentUser() {
    const user = await getCurrentUserFromSession();
    if (!user) {
        return null;
    }

    const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
        select: { id: true, walletAddress: true, role: true, lastLoginAt: true, createdAt: true }
    });

    return updatedUser;
}
