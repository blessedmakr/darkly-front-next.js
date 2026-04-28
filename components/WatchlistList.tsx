"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useWatchlist } from "./UserDataProvider";

interface WatchlistItem {
    motionPictureId: number;
    originalTitle: string;
    posterUrl: string | null;
    releaseYear: number | null;
    addedAt: string;
}

type SortKey = "added" | "title";
type FilterKey = "all" | "unrated" | "rated";

const READY_TO_RATE_LIMIT = 5;

export default function WatchlistList({
    initialItems,
    initialRatedIds,
}: {
    initialItems: WatchlistItem[];
    initialRatedIds: number[];
}) {
    const { toggle } = useWatchlist();
    const ratedIds = new Set(initialRatedIds);

    const [items, setItems] = useState(initialItems);
    const [confirmId, setConfirmId] = useState<number | null>(null);
    const [removingId, setRemovingId] = useState<number | null>(null);
    const [sortBy, setSortBy] = useState<SortKey>("added");
    const [filter, setFilter] = useState<FilterKey>("all");

    async function handleRemove(id: number) {
        setRemovingId(id);
        try {
            await toggle(id);
            setItems((prev) => prev.filter((i) => i.motionPictureId !== id));
        } catch {
            // toggle rolls back internally
        } finally {
            setRemovingId(null);
            setConfirmId(null);
        }
    }

    const unrated = items.filter((i) => !ratedIds.has(i.motionPictureId));
    const readyToRate = unrated.slice(0, READY_TO_RATE_LIMIT);

    const visible = items
        .filter((i) => {
            if (filter === "rated") return ratedIds.has(i.motionPictureId);
            if (filter === "unrated") return !ratedIds.has(i.motionPictureId);
            return true;
        })
        .sort((a, b) =>
            sortBy === "title"
                ? a.originalTitle.localeCompare(b.originalTitle)
                : new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
        );

    return (
        <>
            <p className="mt-2 text-zinc-400">
                {items.length === 0
                    ? "Your watchlist is empty."
                    : `${items.length} film${items.length === 1 ? "" : "s"}`}
            </p>

            {readyToRate.length > 0 && (
                <section className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Ready to rate?</p>
                    <p className="mt-1 text-sm text-zinc-400">
                        Seen any of these? Rate them to improve your recommendations.
                    </p>
                    <div className="mt-4 flex gap-3 overflow-x-auto scrollbar-none pb-1">
                        {readyToRate.map((item) => (
                            <Link key={item.motionPictureId} href={`/motion-pictures/${item.motionPictureId}`} className="group shrink-0">
                                <div className="relative h-24 w-16 overflow-hidden rounded-md bg-zinc-800">
                                    {item.posterUrl && (
                                        <Image
                                            src={item.posterUrl}
                                            alt={item.originalTitle}
                                            fill
                                            className="object-cover transition-opacity group-hover:opacity-70"
                                            sizes="64px"
                                        />
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
                <>
                    <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                        <div className="flex items-center gap-3">
                            <span className="text-zinc-500">Sort</span>
                            {(["added", "title"] as SortKey[]).map((key) => (
                                <button
                                    key={key}
                                    onClick={() => { setSortBy(key); setConfirmId(null); }}
                                    className={`transition-colors ${sortBy === key ? "font-medium text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}
                                >
                                    {key === "added" ? "Date Added" : "A–Z"}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-zinc-500">Show</span>
                            {(["all", "unrated", "rated"] as FilterKey[]).map((key) => (
                                <button
                                    key={key}
                                    onClick={() => { setFilter(key); setConfirmId(null); }}
                                    className={`capitalize transition-colors ${filter === key ? "font-medium text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}
                                >
                                    {key}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {visible.map((item) => (
                            <div
                                key={item.motionPictureId}
                                className="min-h-[84px] rounded-xl border border-zinc-800 bg-zinc-900/50 transition-colors hover:border-zinc-700"
                            >
                                {confirmId === item.motionPictureId ? (
                                    <div className="flex h-full min-h-[84px] flex-col items-center justify-center gap-3 px-4 py-5 text-center">
                                        <p className="text-sm text-zinc-300">
                                            Remove <span className="font-medium text-zinc-100">{item.originalTitle}</span> from your watchlist?
                                        </p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setConfirmId(null)}
                                                className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => handleRemove(item.motionPictureId)}
                                                disabled={removingId === item.motionPictureId}
                                                className="rounded-md bg-red-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-red-500 disabled:opacity-50"
                                            >
                                                {removingId === item.motionPictureId ? "Removing…" : "Remove"}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex gap-3 p-3">
                                        <Link href={`/motion-pictures/${item.motionPictureId}`} className="shrink-0">
                                            <div className="relative h-[60px] w-10 overflow-hidden rounded bg-zinc-800">
                                                {item.posterUrl && (
                                                    <Image
                                                        src={item.posterUrl}
                                                        alt={item.originalTitle}
                                                        fill
                                                        className="object-cover"
                                                        sizes="40px"
                                                    />
                                                )}
                                            </div>
                                        </Link>
                                        <Link href={`/motion-pictures/${item.motionPictureId}`} className="min-w-0 flex-1">
                                            <p className="line-clamp-2 text-sm font-medium leading-snug text-zinc-100">
                                                {item.originalTitle}
                                            </p>
                                            {item.releaseYear && (
                                                <p className="mt-0.5 text-xs text-zinc-500">{item.releaseYear}</p>
                                            )}
                                        </Link>
                                        <div className="flex shrink-0 flex-col items-end justify-between gap-2">
                                            {ratedIds.has(item.motionPictureId) ? (
                                                <span className="rounded-full border border-lime-400/30 px-2 py-0.5 text-[10px] font-medium text-lime-400">
                                                    Rated
                                                </span>
                                            ) : (
                                                <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-[10px] text-zinc-500">
                                                    Unrated
                                                </span>
                                            )}
                                            <button
                                                onClick={() => setConfirmId(item.motionPictureId)}
                                                className="text-xs text-zinc-600 transition-colors hover:text-red-400"
                                                aria-label={`Remove ${item.originalTitle} from watchlist`}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {visible.length === 0 && (
                        <p className="mt-6 text-sm text-zinc-500">No films match that filter.</p>
                    )}
                </>
            )}
        </>
    );
}
