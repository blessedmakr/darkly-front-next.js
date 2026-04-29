import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { SERVER_API_BASE, SITE_URL } from "../../../../lib/config";

async function requireAdmin(): Promise<{ ok: true } | { ok: false; res: NextResponse }> {
    const { userId, getToken } = await auth();
    if (!userId) {
        return { ok: false, res: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
    }
    const token = await getToken();
    const roleRes = await fetch(`${SERVER_API_BASE}/auth/role`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
    });
    if (!roleRes.ok) {
        return { ok: false, res: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
    }
    const { role } = await roleRes.json();
    if (role !== "admin") {
        return { ok: false, res: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
    }
    return { ok: true };
}

export async function GET() {
    const gate = await requireAdmin();
    if (!gate.ok) return gate.res;

    try {
        const client = await clerkClient();
        const list = await client.invitations.getInvitationList({ limit: 100 });
        // The Clerk SDK returns a paginated wrapper { data, totalCount }; older
        // versions returned the array directly. Normalize to an array.
        const invitations = Array.isArray(list) ? list : list.data;
        return NextResponse.json({
            invitations: invitations.map((inv) => ({
                id: inv.id,
                emailAddress: inv.emailAddress,
                status: inv.status,
                createdAt: inv.createdAt,
                url: inv.url,
            })),
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to load invitations";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const gate = await requireAdmin();
    if (!gate.ok) return gate.res;

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
