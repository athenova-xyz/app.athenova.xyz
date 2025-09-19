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

    // Validate email format
    if (!email || !email.includes('@')) {
        return failure('Please provide a valid email address');
    }

    try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return failure('An account with this email already exists');
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
        console.error('Sign-up database error:', err);
        return failure('Unable to create account. Please try again later.');
    }
}