"use server";

import { issueNonce } from "./logic";
import { actionClient } from "@/lib/action";

export const issueNonceAction = actionClient
    .metadata({ actionName: "auth.issueNonce" })
    .action(async () => {
        try {
            const result = await issueNonce();

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

            console.error('Issue nonce error:', { message: error.message });
            throw new Error('Something went wrong');
        }
    });
