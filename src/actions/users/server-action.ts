'use server';

import { getOrUpdateCurrentUser } from './logic';

export async function getUserAction() {
    try {
        const updatedUser = await getOrUpdateCurrentUser();
        if (!updatedUser) {
            return { success: false, error: 'Authentication required', message: 'Please complete SIWE authentication first' };
        }
        return { success: true, user: updatedUser };
    } catch (err) {
        const eid = (globalThis as unknown as { crypto?: { randomUUID?: () => string } }).crypto?.randomUUID?.() ?? Date.now().toString();
        console.error(`getUserAction error [${eid}]`, err);
        return { success: false, error: 'internal server error', message: 'Failed to create or update user profile', eid };
    }
}