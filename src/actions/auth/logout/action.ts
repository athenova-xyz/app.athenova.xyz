"use server";

import { authActionClient } from '@/lib/action';
import { logout } from './logic';

export const logoutAction = authActionClient
    .metadata({ actionName: 'auth.logout' })
    .action(async ({ ctx }) => {
        return logout(ctx.session);
    });
