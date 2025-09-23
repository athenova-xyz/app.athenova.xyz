"use server";

import { issueNonce } from "./logic";
import { actionClient } from "@/lib/action";

export const issueNonceAction = actionClient
    .metadata({ actionName: "auth.issueNonce" })
    .action(async () => {
        const result = await issueNonce();

        if (result.success) {
            return result.data;
        }

        throw new Error(result.error, { cause: { internal: true } });
    });
