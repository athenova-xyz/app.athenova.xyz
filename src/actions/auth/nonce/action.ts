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

            throw new Error(result.error);
        } catch (err) {
            console.error('Issue nonce action failed:', err);
            throw new Error('Something went wrong');
        }
    });
