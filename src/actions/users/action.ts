"use server";
import { actionClient } from '@/lib/action';
import { getOrUpdateCurrentUser } from './logic';

export const usersAction = actionClient
    .metadata({ actionName: 'users.getOrUpdate' })
    .action(async () => {
        const res = await getOrUpdateCurrentUser();
        if (!res) throw new Error('Authentication required');
        return res;
    });
