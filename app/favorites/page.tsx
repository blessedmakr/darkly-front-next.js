import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import FavoritesList from "../../components/FavoritesList";
import UserDataSeeder from "../../components/UserDataSeeder";
import { SERVER_API_BASE } from "../../lib/config";
import type { FavoriteItemResponseDto } from "../../types/favorites";

export const metadata: Metadata = {
    title: "My Favorites",
    robots: { index: false, follow: false },
};

export default async function MyFavoritesPage() {
    const { getToken, userId } = await auth();
    if (!userId) redirect("/");

    const token = await getToken();

    const res = await fetch(`${SERVER_API_BASE}/favorites/mine`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
    });

    const items: FavoriteItemResponseDto[] = res.ok ? await res.json() : [];

    return (
        <main className="min-h-screen bg-zinc-950 px-6 py-16 text-zinc-100">
            <UserDataSeeder favoriteIds={items.map((i) => i.motionPictureId)} />
            <div className="mx-auto max-w-3xl">
                <h1 className="text-3xl font-semibold tracking-tight">My Favorites</h1>
                <FavoritesList initialItems={items} />
            </div>
        </main>
    );
}
