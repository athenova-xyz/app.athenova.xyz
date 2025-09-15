"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createCourse(data: { title: string; description: string }) {
    const { title, description } = data;

    // For demo purposes, using a placeholder authorId
    // In a real app, you would get this from the user session
    const authorId = "demo-user-id";

    try {
        await prisma.course.create({
            data: {
                title,
                description,
                authorId
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
    const title = String(formData.get("title") ?? "");
    const description = String(formData.get("description") ?? "");
    return await createCourse({ title, description });
}
