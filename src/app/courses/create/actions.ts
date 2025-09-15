"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { verifySession, COOKIE_NAME } from "@/lib/auth";
import { cookies } from "next/headers";

// Helper function to get the current authenticated user
async function getCurrentUser() {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(COOKIE_NAME)?.value;

    if (!sessionToken) {
        return null;
    }

    const session = verifySession(sessionToken);
    if (!session || typeof session.walletAddress !== "string") {
        return null;
    }

    // Get the user from the database
    const user = await prisma.user.findUnique({
        where: { walletAddress: session.walletAddress.toLowerCase() },
    });

    return user;
}

export async function createCourse(data: { title: string; description: string }) {
    const { title, description } = data;

    // Get the current authenticated user
    const user = await getCurrentUser();

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
    const title = String(formData.get("title") ?? "");
    const description = String(formData.get("description") ?? "");
    return await createCourse({ title, description });
}
