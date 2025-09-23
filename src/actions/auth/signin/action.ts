'use server';

import { actionClient } from '@/lib/action';
import { signin } from './logic';
import { signinSchema } from './schema';
import { headers } from 'next/headers';

export const signinAction = actionClient
    .inputSchema(signinSchema)
    .metadata({ actionName: 'signin' })
    .action(async ({ parsedInput }) => {
        try {
            const headersList = await headers();
            const result = await signin(parsedInput, headersList);

            if (!result.success) {
                throw new Error(result.error);
            }

            return result.data;
        } catch (error) {
            console.error('Signin error:', error);
            throw new Error((error as Error).message);
        }
    });