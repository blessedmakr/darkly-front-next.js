"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useFavorites } from "./FavoritesProvider";
import { useToast } from "./ToastProvider";
import type { FavoriteItemResponseDto } from "../types/favorites";

type SortKey = "position" | "added" | "title";

export default function FavoritesList({
    initialItems,
}: {
    initialItems: FavoriteItemResponseDto[];
}) {
    const { toggle, reorder } = useFavorites();
    const { showToast } = useToast();

    const [items, setItems] = useState(() =>
        [...initialItems].sort((a, b) => a.position - b.position)
    );
    const [confirmId, setConfirmId] = useState<number | null>(null);
    const [removingId, setRemovingId] = useState<number | null>(null);
    const [sortBy, setSortBy] = useState<SortKey>("position");
    const [reorderingId, setReorderingId] = useState<number | null>(null);

    const dragItemIndex = useRef<number | null>(null);
    const dragOverItemIndex = useRef<number | null>(null);

    async function handleRemove(id: number) {
        setRemovingId(id);
        try {
            await toggle(id);
            setItems((prev) => {
                const filtered = prev.filter((i) => i.motionPictureId !== id);
                return filtered.map((item, idx) => ({ ...item, position: idx + 1 }));
            });
        } catch {
            // toggle rolls back internally
        } finally {
            setRemovingId(null);
            setConfirmId(null);
        }
    }

    function handleDragStart(index: number) {
        dragItemIndex.current = index;
    }

    function handleDragEnter(index: number) {
        dragOverItemIndex.current = index;
    }

    async function handleDrop() {
        const from = dragItemIndex.current;
        const to = dragOverItemIndex.current;
        dragItemIndex.current = null;
        dragOverItemIndex.current = null;

        if (from === null || to === null || from === to) return;

        const reordered = [...items];
        const [moved] = reordered.splice(from, 1);
        reordered.splice(to, 0, moved);
        const withPositions = reordered.map((item, idx) => ({ ...item, position: idx + 1 }));
        setItems(withPositions);

        const newPosition = to + 1;
        setReorderingId(moved.motionPictureId);
        try {
            await reorder(moved.motionPictureId, newPosition);
        } catch {
            setItems(items);
            showToast("Couldn't save order — try again.");
        } finally {
            setReorderingId(null);
        }
    }

    const visible = [...items].sort((a, b) => {
        if (sortBy === "title") return a.originalTitle.localeCompare(b.originalTitle);
        if (sortBy === "added") return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
        return a.position - b.position;
    });

    return (
        <>
            <p className="mt-2 text-zinc-400">
                {items.length === 0
                    ? "Your favorites list is empty."
                    : `${items.length} film${items.length === 1 ? "" : "s"}`}
            </p>

            {items.length > 0 && (
                <>
                    <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                        <div className="flex items-center gap-3">
                            <span className="text-zinc-500">Sort</span>
                            {(["position", "added", "title"] as SortKey[]).map((key) => (
                                <button
                                    key={key}
                                    onClick={() => { setSortBy(key); setConfirmId(null); }}
                                    className={`transition-colors ${sortBy === key ? "font-medium text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}
                                >
                                    {key === "position" ? "My Order" : key === "added" ? "Date Added" : "A–Z"}
                                </button>
                            ))}
                        </div>
                        {sortBy === "position" && (
                            <p className="text-xs text-zinc-500">Drag rows to reorder</p>
                        )}
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-2">
                        {visible.map((item, index) => (
                            <div
                                key={item.motionPictureId}
                                draggable={sortBy === "position" && confirmId !== item.motionPictureId}
                                onDragStart={() => handleDragStart(index)}
                                onDragEnter={() => handleDragEnter(index)}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={handleDrop}
                                className={`min-h-[84px] rounded-xl border border-zinc-800 bg-zinc-900/50 transition-colors hover:border-zinc-700 ${
                                    sortBy === "position" ? "cursor-grab active:cursor-grabbing" : ""
                                } ${reorderingId === item.motionPictureId ? "opacity-50" : ""}`}
                            >
                                {confirmId === item.motionPictureId ? (
                                    <div className="flex h-full min-h-[84px] flex-col items-center justify-center gap-3 px-4 py-5 text-center">
                                        <p className="text-sm text-zinc-300">
                                            Remove <span className="font-medium text-zinc-100">{item.originalTitle}</span> from favorites?
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
                                        {sortBy === "position" && (
                                            <div className="flex shrink-0 items-center">
                                                <span className="w-5 text-center text-xs font-medium text-zinc-600">
                                                    {item.position}
                                                </span>
                                            </div>
                                        )}
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
                                        <div className="flex shrink-0 flex-col items-end justify-end">
                                            <button
                                                onClick={() => setConfirmId(item.motionPictureId)}
                                                className="text-xs text-zinc-600 transition-colors hover:text-red-400"
                                                aria-label={`Remove ${item.originalTitle} from favorites`}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </>
    );
}
