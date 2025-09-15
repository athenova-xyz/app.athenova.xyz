import { NextResponse } from "next/server";
import { createCourse } from "@/app/courses/create/actions";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const title = String(formData.get("title") ?? "").trim();
        const description = String(formData.get("description") ?? "").trim();

        // Server-side validation
        if (!title || title.length > 256) {
            return NextResponse.json({ success: false, error: "Invalid title" }, { status: 400 });
        }
        if (!description || description.length > 10000) {
            return NextResponse.json({ success: false, error: "Invalid description" }, { status: 400 });
        }

        const result = await createCourse({ title, description });
        if (result.success) {
            // Redirect to courses list instead of JSON response
            return NextResponse.redirect(new URL("/courses", request.url), { status: 303 });
        }
        return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    } catch (error) {
        console.error("API create course error:", error);
        return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
    }
}
