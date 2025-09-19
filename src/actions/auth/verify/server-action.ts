'use server';

import { verifySiwe } from './logic';
import { headers } from 'next/headers';

export async function verifySiweAction(message: string, signature: string) {
    try {
        const headersList = await headers();
        await verifySiwe(message, signature, headersList);
        return { success: true };
    } catch (error) {
        console.error('Verification error:', error);
        return { success: false, error: 'Failed to verify signature' };
    }
}