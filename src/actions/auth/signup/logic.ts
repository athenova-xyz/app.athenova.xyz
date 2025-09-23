import 'server-only';

import { prisma } from '@/lib/prisma';
import { Result, success, failure } from '@/lib/result';
import { getSession } from '@/lib/session';
import bcryptjs from 'bcryptjs';
import { SignupInput } from './schema';

interface User {
    id: string;
    displayName?: string | null;
    email: string | null;
    role: string;
    createdAt: Date;
}

export async function signup(input: SignupInput): Promise<Result<User>> {
    const { name, email, password } = input;

    const normalisedEmail = email.toLowerCase().trim();

    // Ensure password present
    if (!password) {
        return failure('Password is required');
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
        where: { email: normalisedEmail }
    });

    if (existingUser) {
        console.error('Signup error: User with this email already exists');
        return failure('Something went wrong');
    }

    // Hash password and create user
    const hashedPassword = await bcryptjs.hash(password, 12);

    const user = await prisma.user.create({
        data: {
            displayName: name,
            email: normalisedEmail,
            passwordHash: hashedPassword,
            walletAddress: `email-${Date.now()}-${Math.random().toString(36).substring(7)}`
        },
        select: {
            id: true,
            displayName: true,
            email: true,
            role: true,
            createdAt: true
        }
    });

    const session = await getSession();
    session.user = { id: user.id };
    await session.save();

    return success(user as User);
}