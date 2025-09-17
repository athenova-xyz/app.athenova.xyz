// Typically in lib/action.ts
import { getCurrentUserFromCookie } from "./auth";
import { createSafeActionClient } from "next-safe-action";
import { cookies } from "next/headers";

export const actionClient = createSafeActionClient({})
    .use(async ({ next }) => {
        const user = await getCurrentUserFromCookie(await cookies());
        if (!user) throw new Error("Not Authorised");
        return next({ ctx: { user } });
    });

export const authActionClient = actionClient /* .add more ctx/middleware if needed */;
