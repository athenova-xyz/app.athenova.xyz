'use server';

import { logout } from './logic';

export async function logoutAction() {
    try {
        await logout();
        return { success: true, message: 'Logged out successfully' };
    } catch (error) {
        console.error('Logout error:', error);
        return { success: false, error: 'Internal server error' };
    }
}