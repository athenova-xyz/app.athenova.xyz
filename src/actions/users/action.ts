"use server";
import { actionClient } from '@/lib/action';
import { getOrUpdateCurrentUser } from './logic';

export const usersAction = actionClient
    .metadata({ actionName: 'users.getOrUpdate' })
    .action(async () => {
        try {
            const res = await getOrUpdateCurrentUser();
            if (!res) throw new Error('Authentication required');
            return res;
        } catch (err) {
            const error = err as Error;
            if (error.message === 'Authentication required') {
                throw error;
            }
            console.error('usersAction failed:', error);
            throw new Error('Something went wrong');
        }
    });
