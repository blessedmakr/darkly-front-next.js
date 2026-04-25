import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import WatchlistList from "../../components/WatchlistList";
import { SERVER_API_BASE } from "../../lib/config";

export const metadata: Metadata = {
    title: "My Watchlist",
    robots: { index: false, follow: false },
};

interface WatchlistItem {
    motionPictureId: number;
    originalTitle: string;
    posterUrl: string | null;
    releaseYear: number | null;
    addedAt: string;
}

interface UserRating {
    motionPictureId: number;
}

export default async function MyWatchlistPage() {
    const { getToken, userId } = await auth();
    if (!userId) redirect("/");

    const token = await getToken();

    const [watchlistRes, ratingsRes] = await Promise.all([
        fetch(`${SERVER_API_BASE}/watchlist/mine`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
        }),
        fetch(`${SERVER_API_BASE}/ratings/mine`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
        }),
    ]);

    const items: WatchlistItem[] = watchlistRes.ok ? await watchlistRes.json() : [];
    const ratings: UserRating[] = ratingsRes.ok ? await ratingsRes.json() : [];
    const ratedIds = ratings.map((r) => r.motionPictureId);

    return (
        <main className="min-h-screen bg-zinc-950 px-6 py-16 text-zinc-100">
            <div className="mx-auto max-w-3xl">
                <h1 className="text-3xl font-semibold tracking-tight">My Watchlist</h1>
                <WatchlistList initialItems={items} initialRatedIds={ratedIds} />
            </div>
        </main>
    );
}
