"use server";

import { authActionClient } from '@/lib/action';
import { logout } from './logic';

export const logoutAction = authActionClient
    .metadata({ actionName: 'auth.logout' })
    .action(async ({ ctx }) => {
        const result = await logout(ctx.session);

        if (result.success) {
            return result.data;
        }

        throw new Error(result.error, { cause: { internal: true } });
    });
