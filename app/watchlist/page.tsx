import Image from "next/image";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

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

const READY_TO_RATE_LIMIT = 5;

export default async function MyWatchlistPage() {
    const { getToken, userId } = await auth();

    if (!userId) {
        redirect("/");
    }

    const token = await getToken();

    const [watchlistRes, ratingsRes] = await Promise.all([
        fetch(`${process.env.MOTION_PICTURES_API_BASE_URL}/watchlist/mine`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
        }),
        fetch(`${process.env.MOTION_PICTURES_API_BASE_URL}/ratings/mine`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
        }),
    ]);

    const items: WatchlistItem[] = watchlistRes.ok ? await watchlistRes.json() : [];
    const ratings: UserRating[] = ratingsRes.ok ? await ratingsRes.json() : [];

    const ratedIds = new Set(ratings.map((r) => r.motionPictureId));
    const unrated = items.filter((item) => !ratedIds.has(item.motionPictureId));
    const readyToRate = unrated.slice(0, READY_TO_RATE_LIMIT);

    return (
        <main className="min-h-screen bg-zinc-950 px-6 py-16 text-zinc-100">
            <div className="mx-auto max-w-3xl">
                <h1 className="text-3xl font-semibold tracking-tight">My Watchlist</h1>
                <p className="mt-2 text-zinc-400">
                    {items.length === 0
                        ? "Your watchlist is empty."
                        : `${items.length} film${items.length === 1 ? "" : "s"}`}
                </p>

                {readyToRate.length > 0 && (
                    <section className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                            Ready to rate?
                        </p>
                        <p className="mt-1 text-sm text-zinc-400">
                            Seen any of these? Rate them to improve your recommendations.
                        </p>
                        <div className="mt-4 flex gap-3 overflow-x-auto scrollbar-none pb-1">
                            {readyToRate.map((item) => (
                                <Link
                                    key={item.motionPictureId}
                                    href={`/motion-pictures/${item.motionPictureId}`}
                                    className="group shrink-0"
                                >
                                    <div className="relative h-24 w-16 overflow-hidden rounded-md bg-zinc-800">
                                        {item.posterUrl ? (
                                            <Image
                                                src={item.posterUrl}
                                                alt={item.originalTitle}
                                                fill
                                                className="object-cover transition-opacity group-hover:opacity-70"
                                                sizes="64px"
                                            />
                                        ) : (
                                            <div className="h-full w-full bg-zinc-800" />
                                        )}
                                    </div>
                                    <p className="mt-1.5 w-16 truncate text-[11px] text-zinc-400 group-hover:text-zinc-200">
                                        {item.originalTitle}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {items.length > 0 && (
                    <div className="mt-8 grid gap-4 sm:grid-cols-2">
                        {items.map((item) => (
                            <Link
                                key={item.motionPictureId}
                                href={`/motion-pictures/${item.motionPictureId}`}
                                className="flex gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition-colors hover:border-zinc-700"
                            >
                                <div className="shrink-0">
                                    {item.posterUrl ? (
                                        <Image
                                            src={item.posterUrl}
                                            alt={item.originalTitle}
                                            width={56}
                                            height={84}
                                            className="rounded-md object-cover"
                                        />
                                    ) : (
                                        <div className="h-[84px] w-[56px] rounded-md bg-zinc-800" />
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <p className="font-medium leading-snug text-zinc-100">
                                                {item.originalTitle}
                                            </p>
                                            {item.releaseYear && (
                                                <p className="mt-0.5 text-sm text-zinc-500">{item.releaseYear}</p>
                                            )}
                                        </div>
                                        {ratedIds.has(item.motionPictureId) ? (
                                            <span className="shrink-0 rounded-full border border-lime-400/30 px-2 py-0.5 text-[10px] font-medium text-lime-400">
                                                Rated
                                            </span>
                                        ) : (
                                            <span className="shrink-0 rounded-full border border-zinc-700 px-2 py-0.5 text-[10px] text-zinc-500">
                                                Unrated
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
