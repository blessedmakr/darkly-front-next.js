import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { SERVER_API_BASE, SITE_URL } from "../../../../lib/config";

export async function POST(req: Request) {
    const { userId, getToken } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = await getToken();
    const roleRes = await fetch(`${SERVER_API_BASE}/auth/role`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
    });

    if (!roleRes.ok) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role } = await roleRes.json();
    if (role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { email } = await req.json();
    if (!email || typeof email !== "string" || !email.includes("@")) {
        return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    try {
        const client = await clerkClient();
        const invitation = await client.invitations.createInvitation({
            emailAddress: email.trim().toLowerCase(),
            redirectUrl: `${SITE_URL}/sign-up`,
        });
        return NextResponse.json({ invitation });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to send invitation";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
