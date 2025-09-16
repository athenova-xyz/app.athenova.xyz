"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUserFromCookie } from "@/lib/auth";
import { cookies } from "next/headers";
import { CourseSchema, CourseInput } from "@/lib/schemas/course";


export async function createCourse(data: CourseInput) {
    // Defensively validate here as well to guarantee server-side enforcement
    const parsed = CourseSchema.safeParse(data);
    if (!parsed.success) {
        const fieldErrors: Record<string, string[]> = {};
        for (const issue of parsed.error.issues) {
            const key = issue.path[0] as string;
            fieldErrors[key] = fieldErrors[key] || [];
            fieldErrors[key].push(issue.message);
        }
        return { success: false, errors: fieldErrors };
    }

    const { title, description } = parsed.data;

    // Get the current authenticated user from centralized auth helper
    const user = await getCurrentUserFromCookie(await cookies());

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
