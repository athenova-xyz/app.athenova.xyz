'use server';

import { issueNonce } from './logic';

export async function getNonceAction() {
    try {
        const result = await issueNonce();
        return { success: true, nonce: result.nonce };
    } catch (error) {
        console.error('Nonce error:', error);
        return { success: false, error: 'Failed to generate nonce' };
    }
}