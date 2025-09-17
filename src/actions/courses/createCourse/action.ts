"use server";
import { authActionClient } from "@/lib/action";
import { createCourse } from "./logic";
import { createCourseSchema } from "./schema";

export const createCourseAction = authActionClient
    .inputSchema(createCourseSchema)
    .action(async ({ parsedInput, ctx }) => {
        if (!ctx.user) {
            throw new Error('Unauthorized');
        }
        const userId = ctx.user.id;
        const result = await createCourse(parsedInput, userId);
        if (result.success) return result.data;
        throw new Error(result.error || "Failed to create course");
    });
