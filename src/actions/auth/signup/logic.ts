import 'server-only';

import { prisma } from '@/lib/prisma';
import { Result, success, failure } from '@/lib/result';
import { SignupInput } from './schema';

type CreatedUser = {
    id: string;
    email: string | null;
    role: string;
};

export async function signup(input: SignupInput): Promise<Result<CreatedUser>> {
    const { email } = input;

    try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return failure('User already exists with this email');
        }

        // Create user with email (using placeholder wallet address since it's required)
        const user = await prisma.user.create({
            data: {
                email,
                walletAddress: `email-${Date.now()}-${Math.random().toString(36).substring(7)}`,
                role: 'LEARNER'
            },
            select: { id: true, email: true, role: true }
        });

        return success(user);
    } catch (err) {
        console.error('Sign-up error:', err);
        return failure('Internal server error');
    }
}