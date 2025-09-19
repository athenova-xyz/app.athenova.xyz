import { actionClient } from '@/lib/action';
import { logout } from './logic';

export const logoutAction = actionClient
    .metadata({ actionName: 'auth.logout' })
    .action(async () => {
        return logout();
    });
