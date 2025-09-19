import { actionClient } from '@/lib/action';
import { verifySiwe } from './logic';
import { verifySiweSchema } from './schema';

export const verifySiweAction = actionClient
    .inputSchema(verifySiweSchema)
    .metadata({ actionName: 'auth.verifySiwe' })
    .action(async ({ parsedInput, ctx }) => {
        return verifySiwe(parsedInput.message, parsedInput.signature, ctx.headers);
    });
