'use server';

import { actionClient } from '@/lib/action';
import { signin } from './logic';
import { signinSchema } from './schema';

export const signinAction = actionClient
  .inputSchema(signinSchema)
  .metadata({ actionName: 'signin' })
  .action(async ({ parsedInput }) => {
    try {
      const result = await signin(parsedInput);

      if (result.success) {
        return result.data;
      }

      throw new Error(result.error, { cause: { internal: true } });
    } catch (err) {
      const error = err as Error;
      const cause = error.cause as { internal: boolean } | undefined;

      if (cause?.internal) {
        throw new Error(error.message);
      }

      console.error('Sign in error:', error, {
        email: '[redacted]'
      });
      throw new Error('Something went wrong');
    }
  });
