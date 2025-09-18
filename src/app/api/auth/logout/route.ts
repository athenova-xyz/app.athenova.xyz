import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function POST() {
    try {
        const session = await getSession();
        session.destroy();

        return NextResponse.json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        console.error("Logout error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
