import { issueNonce } from "./logic";
import { actionClient } from "@/lib/action";

export const issueNonceAction = actionClient
    .metadata({ actionName: "auth.issueNonce" })
    .action(async () => {
        return issueNonce();
    });
