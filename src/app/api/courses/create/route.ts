import { NextResponse } from "next/server";
import { createCourse } from "@/app/courses/create/actions";
import { CourseSchema } from "@/lib/schemas/course";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
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
            return NextResponse.json({ success: false, errors: fieldErrors }, { status: 400 });
        }

        const result = await createCourse(parsed.data);
        if (result.success) {
            return NextResponse.redirect(new URL("/courses", request.url), { status: 303 });
        }

        // If createCourse returned structured errors, forward them; otherwise return 500
        if (result && typeof result === "object" && "errors" in result) {
            return NextResponse.json(result as unknown as Record<string, unknown>, { status: 400 });
        }
        return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    } catch (error) {
        console.error("API create course error:", error);
        return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
    }
}
