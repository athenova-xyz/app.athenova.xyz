"use server";

import { actionClient } from '@/lib/action';
import { verifySiwe } from './logic';
import { verifySiweSchema } from './schema';

export const verifySiweAction = actionClient
    .inputSchema(verifySiweSchema)
    .metadata({ actionName: 'auth.verifySiwe' })
    .action(async ({ parsedInput, ctx }) => {
        try {
            const result = await verifySiwe(parsedInput.message, parsedInput.signature, ctx.headers);

            if (result.success) {
                return result.data;
            }

            throw new Error(result.error);
        } catch (err) {
            console.error('Verify action failed:', err);
            throw new Error('Something went wrong');
        }
    });
