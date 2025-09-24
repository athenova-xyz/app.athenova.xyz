'use server';

import { actionClient } from '@/lib/action';
import { signin } from './logic';
import { SigninInput, signinSchema } from './schema';

export const signinAction = actionClient
  .inputSchema(signinSchema)
  .metadata({ actionName: 'signin' })
  .action(async ({ parsedInput }) => {
    try {
      const result = await signin(parsedInput as SigninInput);

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

      console.error('Sign in error:', {
        message: error.message,
        email: '[redacted]'
      });
      throw new Error('Something went wrong');
    }
  });
