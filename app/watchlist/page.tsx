import Image from "next/image";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "My Watchlist | Darkly",
};

interface WatchlistItem {
    motionPictureId: number;
    originalTitle: string;
    posterUrl: string | null;
    releaseYear: number | null;
    addedAt: string;
}

export default async function MyWatchlistPage() {
    const { getToken, userId } = await auth();

    if (!userId) {
        redirect("/");
    }

    const token = await getToken();
    const res = await fetch(
        `${process.env.MOTION_PICTURES_API_BASE_URL}/watchlist/mine`,
        {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
        }
    );

    const items: WatchlistItem[] = res.ok ? await res.json() : [];

    return (
        <main className="min-h-screen bg-zinc-950 px-6 py-16 text-zinc-100">
            <div className="mx-auto max-w-3xl">
                <h1 className="text-3xl font-semibold tracking-tight">My Watchlist</h1>
                <p className="mt-2 text-zinc-400">
                    {items.length === 0
                        ? "Your watchlist is empty."
                        : `${items.length} film${items.length === 1 ? "" : "s"}`}
                </p>

                {items.length > 0 && (
                    <div className="mt-10 grid gap-4 sm:grid-cols-2">
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
                                <div className="min-w-0">
                                    <p className="font-medium leading-snug text-zinc-100">
                                        {item.originalTitle}
                                    </p>
                                    {item.releaseYear && (
                                        <p className="mt-0.5 text-sm text-zinc-500">{item.releaseYear}</p>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
