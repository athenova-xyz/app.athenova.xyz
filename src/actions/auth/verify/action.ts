'use server';

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

      throw new Error(result.error, { cause: { internal: true } });
    } catch (err) {
      const error = err as Error;
      const cause = error.cause as { internal: boolean } | undefined;

      if (cause?.internal) {
        throw new Error(error.message);
      }

      console.error('Verify SIWE error:', { message: error.message });
      throw new Error('Something went wrong');
    }
  });
