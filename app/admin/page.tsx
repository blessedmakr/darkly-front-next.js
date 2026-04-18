import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AdminPanel from "../../components/AdminPanel";

const API_BASE = process.env.MOTION_PICTURES_API_BASE_URL;

export const metadata: Metadata = { title: "Admin | Darkly" };

export default async function AdminPage() {
    const { userId, getToken } = await auth();
    if (!userId) redirect("/sign-in");

    const token = await getToken();

    // Verify admin role server-side before rendering
    const roleRes = await fetch(`${API_BASE}/auth/role`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
    });

    if (!roleRes.ok) redirect("/");

    const { role } = await roleRes.json();
    if (role !== "admin") redirect("/");

    const [usersRes, submissionsRes] = await Promise.all([
        fetch(`${API_BASE}/admin/users`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
        }),
        fetch(`${API_BASE}/admin/submissions`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
        }),
    ]);

    const users = usersRes.ok ? await usersRes.json() : [];
    const submissions = submissionsRes.ok ? await submissionsRes.json() : [];

    return (
        <main className="min-h-screen bg-zinc-950 text-zinc-100">
            <div className="mx-auto max-w-5xl px-6 py-16">
                <h1 className="text-3xl font-semibold tracking-tight mb-12">Admin</h1>
                <AdminPanel initialUsers={users} initialSubmissions={submissions} />
            </div>
        </main>
    );
}
