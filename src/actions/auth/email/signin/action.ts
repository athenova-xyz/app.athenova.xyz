/**
 * Minimal local signIn implementation to satisfy types and allow compilation.
 * Replace this with the real authentication logic or import from the actual module.
 */
'use server';

import { actionClient } from '@/lib/action';
import { signInSchema } from './schema';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

type SignInActionResult = {
    serverError?: string;
    data?: { id: string; email: string | null; role: string };
};

export const signInWithEmailAction = actionClient
    .inputSchema(signInSchema)
    .metadata({ actionName: 'signInWithEmail' })
    .action(async ({ parsedInput, ctx }): Promise<SignInActionResult> => {
        if (!parsedInput.email || !parsedInput.password) {
            return { serverError: 'Email and password are required' };
        }

        try {
            const user = await prisma.user.findUnique({ where: { email: parsedInput.email } });

            if (!user || !user.passwordHash) {
                return { serverError: 'Invalid credentials' };
            }

            const match = await bcrypt.compare(parsedInput.password, user.passwordHash);

            if (!match) {
                return { serverError: 'Invalid credentials' };
            }

            const { session } = ctx as { session: Awaited<ReturnType<typeof getSession>> };
            session.user = { id: user.id };
            await session.save();

            return { data: { id: user.id, email: user.email, role: user.role } };
        } catch (err) {
            console.error('signIn action failed:', err);
            return { serverError: 'Sign in failed. Please try again.' };
        }
    });
