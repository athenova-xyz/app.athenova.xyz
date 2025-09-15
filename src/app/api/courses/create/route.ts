import { NextResponse } from "next/server";
import { createCourse } from "@/app/courses/create/actions";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const result = await createCourse({
            title: String(formData.get("title") ?? ""),
            description: String(formData.get("description") ?? ""),
        });
        if (result.success) return NextResponse.json({ success: true });
        return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    } catch (error) {
        console.error("API create course error:", error);
        return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
    }
}
