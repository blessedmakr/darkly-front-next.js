"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    TouchSensor,
    closestCenter,
    useSensor,
    useSensors,
    type DragEndEvent,
    type DragStartEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    arrayMove,
    rectSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useFavorites } from "./FavoritesProvider";
import { useToast } from "./ToastProvider";
import type { FavoriteItemResponseDto } from "../types/favorites";

type SortKey = "position" | "added" | "title";

// ─── Shared card pieces ───────────────────────────────────────────────────────

function PositionBadge({ n }: { n: number }) {
    return (
        <div className="absolute left-2 top-2 z-10 flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-black/70 px-1.5 text-[10px] font-bold tabular-nums text-zinc-300 backdrop-blur-sm">
            {n}
        </div>
    );
}

// ─── Desktop poster card (recommendations style) ──────────────────────────────

interface DesktopCardProps {
    item: FavoriteItemResponseDto;
    showPosition: boolean;
    dragListeners?: Record<string, unknown>;
    onConfirmRemove: () => void;
}

function DesktopCard({ item, showPosition, dragListeners, onConfirmRemove }: DesktopCardProps) {
    return (
        <div className="group relative w-full" {...dragListeners}>
            {showPosition && <PositionBadge n={item.position} />}
            <button
                onClick={(e) => { e.stopPropagation(); onConfirmRemove(); }}
                className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-zinc-400 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:text-white"
                aria-label={`Remove ${item.originalTitle} from favorites`}
            >
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                </svg>
            </button>
            <article className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60 transition hover:border-zinc-600 hover:bg-zinc-900">
                <Link href={`/motion-pictures/${item.motionPictureId}`} className="group/link block">
                    <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-800">
                        {item.posterUrl ? (
                            <Image
                                src={item.posterUrl}
                                alt={item.originalTitle}
                                fill
                                loading="lazy"
                                className="object-cover transition-opacity duration-300 group-hover/link:opacity-40"
                                sizes="(max-width: 768px) 50vw, 20vw"
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center text-xs text-zinc-600">No Image</div>
                        )}
                    </div>
                    <div className="px-3 pt-3 pb-3">
                        <p className="line-clamp-2 text-sm font-semibold leading-tight tracking-tight text-zinc-100 group-hover/link:text-red-400">
                            {item.originalTitle}
                        </p>
                        {item.releaseYear && (
                            <p className="mt-0.5 text-xs text-zinc-500">{item.releaseYear}</p>
                        )}
                    </div>
                </Link>
            </article>
        </div>
    );
}

// ─── Mobile full card ─────────────────────────────────────────────────────────

interface MobileCardProps {
    item: FavoriteItemResponseDto;
    showPosition: boolean;
    isDragMode: boolean;
    dragListeners?: Record<string, unknown>;
    onConfirmRemove: () => void;
}

function MobileCard({ item, showPosition, isDragMode, dragListeners, onConfirmRemove }: MobileCardProps) {
    return (
        <div
            {...(isDragMode ? dragListeners : {})}
            className={`flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 transition hover:border-zinc-700${isDragMode ? " touch-none cursor-grab active:cursor-grabbing" : ""}`}
        >
            {showPosition && (
                <span className="w-5 shrink-0 text-center text-xs font-bold tabular-nums text-zinc-600">
                    {item.position}
                </span>
            )}
            <Link href={`/motion-pictures/${item.motionPictureId}`} className="shrink-0">
                <div className="relative h-[72px] w-12 overflow-hidden rounded bg-zinc-800">
                    {item.posterUrl && (
                        <Image src={item.posterUrl} alt={item.originalTitle} fill className="object-cover" sizes="48px" />
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
            <button
                onClick={onConfirmRemove}
                className="shrink-0 text-xs text-zinc-600 transition-colors hover:text-red-400"
                aria-label={`Remove ${item.originalTitle}`}
            >
                Remove
            </button>
        </div>
    );
}

// ─── Confirm overlay (shared) ─────────────────────────────────────────────────

function ConfirmRemove({
    title,
    removing,
    onCancel,
    onConfirm,
}: {
    title: string;
    removing: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}) {
    return (
        <div className="flex min-h-[84px] flex-col items-center justify-center gap-3 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-4 text-center">
            <p className="text-sm text-zinc-300">
                Remove <span className="font-medium text-zinc-100">{title}</span> from favorites?
            </p>
            <div className="flex gap-2">
                <button
                    onClick={onCancel}
                    className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200"
                >
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    disabled={removing}
                    className="rounded-md bg-red-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-red-500 disabled:opacity-50"
                >
                    {removing ? "Removing…" : "Remove"}
                </button>
            </div>
        </div>
    );
}

// ─── Sortable item wrapper ────────────────────────────────────────────────────

interface SortableItemProps {
    item: FavoriteItemResponseDto;
    isDragMode: boolean;
    showPosition: boolean;
    confirmId: number | null;
    removingId: number | null;
    onConfirm: (id: number) => void;
    onCancelConfirm: () => void;
    onRemove: (id: number) => void;
}

function SortableItem({
    item,
    isDragMode,
    showPosition,
    confirmId,
    removingId,
    onConfirm,
    onCancelConfirm,
    onRemove,
}: SortableItemProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: item.motionPictureId,
        disabled: !isDragMode,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const isConfirming = confirmId === item.motionPictureId;
    const isRemoving = removingId === item.motionPictureId;

    return (
        <div ref={setNodeRef} style={style} {...attributes} className={isDragging ? "opacity-30" : ""}>
            {isConfirming ? (
                <ConfirmRemove
                    title={item.originalTitle}
                    removing={isRemoving}
                    onCancel={onCancelConfirm}
                    onConfirm={() => onRemove(item.motionPictureId)}
                />
            ) : (
                <>
                    {/* Desktop: whole card is the drag handle */}
                    <div className="hidden md:block">
                        <DesktopCard
                            item={item}
                            showPosition={showPosition}
                            dragListeners={isDragMode ? listeners : undefined}
                            onConfirmRemove={() => onConfirm(item.motionPictureId)}
                        />
                    </div>
                    {/* Mobile: grip icon is the drag handle */}
                    <div className="md:hidden">
                        <MobileCard
                            item={item}
                            showPosition={showPosition}
                            isDragMode={isDragMode}
                            dragListeners={isDragMode ? listeners : undefined}
                            onConfirmRemove={() => onConfirm(item.motionPictureId)}
                        />
                    </div>
                </>
            )}
        </div>
    );
}

// ─── Main list ────────────────────────────────────────────────────────────────

export default function FavoritesList({ initialItems }: { initialItems: FavoriteItemResponseDto[] }) {
    const { toggle, reorder } = useFavorites();
    const { showToast } = useToast();

    const [items, setItems] = useState(() =>
        [...initialItems].sort((a, b) => a.position - b.position)
    );
    const [sortBy, setSortBy] = useState<SortKey>("position");
    const [confirmId, setConfirmId] = useState<number | null>(null);
    const [removingId, setRemovingId] = useState<number | null>(null);
    const [activeId, setActiveId] = useState<number | null>(null);

    const isDragMode = sortBy === "position";

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
    );

    const visible = [...items].sort((a, b) => {
        if (sortBy === "title") return a.originalTitle.localeCompare(b.originalTitle);
        if (sortBy === "added") return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
        return a.position - b.position;
    });

    const activeItem = activeId ? items.find((i) => i.motionPictureId === activeId) ?? null : null;

    function handleDragStart(event: DragStartEvent) {
        setActiveId(event.active.id as number);
        setConfirmId(null);
    }

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        setActiveId(null);

        if (!over || active.id === over.id) return;

        const oldIndex = items.findIndex((i) => i.motionPictureId === active.id);
        const newIndex = items.findIndex((i) => i.motionPictureId === over.id);
        const reordered = arrayMove(items, oldIndex, newIndex).map((item, idx) => ({
            ...item,
            position: idx + 1,
        }));

        const snapshot = items;
        setItems(reordered);

        try {
            await reorder(active.id as number, newIndex + 1);
        } catch {
            setItems(snapshot);
            showToast("Couldn't save order — try again.");
        }
    }

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
                        {isDragMode && (
                            <p className="text-xs text-zinc-500">
                                <span className="hidden md:inline">Drag to reorder</span>
                                <span className="md:hidden">Hold to reorder</span>
                            </p>
                        )}
                    </div>

                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={visible.map((i) => i.motionPictureId)}
                            strategy={rectSortingStrategy}
                        >
                            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                                {visible.map((item) => (
                                    <SortableItem
                                        key={item.motionPictureId}
                                        item={item}
                                        isDragMode={isDragMode}
                                        showPosition={isDragMode}
                                        confirmId={confirmId}
                                        removingId={removingId}
                                        onConfirm={setConfirmId}
                                        onCancelConfirm={() => setConfirmId(null)}
                                        onRemove={handleRemove}
                                    />
                                ))}
                            </div>
                        </SortableContext>

                        <DragOverlay>
                            {activeItem && (
                                <div className="rotate-1 opacity-90">
                                    <div className="hidden md:block">
                                        <DesktopCard
                                            item={activeItem}
                                            showPosition={true}
                                            onConfirmRemove={() => {}}
                                        />
                                    </div>
                                    <div className="md:hidden">
                                        <MobileCard
                                            item={activeItem}
                                            showPosition={true}
                                            isDragMode={false}
                                            onConfirmRemove={() => {}}
                                        />
                                    </div>
                                </div>
                            )}
                        </DragOverlay>
                    </DndContext>
                </>
            )}
        </>
    );
}
