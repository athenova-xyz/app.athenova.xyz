"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUserFromCookie } from "@/lib/auth";
import { cookies } from "next/headers";
import { CourseSchema, CourseInput } from "@/lib/schemas/course";

// NOTE: Zod enforces a maximum length for `description` (<= 10000 chars).
// The DB currently defines `description` as TEXT (no length limit). To
// guarantee consistency and avoid runtime rejections when Prisma writes to
// the DB, add a DB-level constraint (either change the column to
// `VARCHAR(10000)` or add `CHECK (char_length(description) <= 10000)`),
// and then update `schema.prisma` and create a migration. This ensures the
// DB cannot contain values that violate the Zod schema and keeps validations
// consistent across application and database layers.


export async function createCourse(data: CourseInput) {
    const { title, description } = data;

    // Get the current authenticated user from centralized auth helper
    const user = await getCurrentUserFromCookie(cookies());

    if (!user) {
        // In development only, provide helpful error message about demo user setup
        if (process.env.NODE_ENV !== "production") {
            return {
                success: false,
                error: "Authentication required. Please sign in to create a course. For development, ensure you have a demo user created and are signed in with the demo wallet address."
            };
        }
        return { success: false, error: "Authentication required. Please sign in to create a course." };
    }

    try {
        await prisma.course.create({
            data: {
                title,
                description,
                authorId: user.id,
            }
        });
        revalidatePath("/courses");
        return { success: true };
    } catch (error) {
        console.error("Failed to create course:", error);
        return { success: false, error: "Failed to create course" };
    }
}

// Server Action usable directly as a form `action`
export async function createCourseAction(formData: FormData) {
    const payload = {
        title: String(formData.get("title") ?? ""),
        description: String(formData.get("description") ?? ""),
    };

    const parsed = CourseSchema.safeParse(payload);
    if (!parsed.success) {
        const fieldErrors: Record<string, string[]> = {};
        for (const issue of parsed.error.issues) {
            const key = issue.path[0] as string;
            fieldErrors[key] = fieldErrors[key] || [];
            fieldErrors[key].push(issue.message);
        }
        return { success: false, errors: fieldErrors };
    }

    return await createCourse(parsed.data);
}
