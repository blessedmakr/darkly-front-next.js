"use client";

import { useState } from "react";
import { Suspense } from "react";
import FilterSidebar from "./FilterSidebar";
import type { TagDto } from "../types/motion-picture";
import type { MotionPictureFilterState } from "../lib/motion-picture-filters";

interface MobileFilterDrawerProps {
    availableGenres: string[];
    availableTags: TagDto[];
    currentFilters: MotionPictureFilterState;
    activeFilterCount: number;
}

export default function MobileFilterDrawer({
    availableGenres,
    availableTags,
    currentFilters,
    activeFilterCount,
}: MobileFilterDrawerProps) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-2 rounded-md border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-zinc-300 transition-colors hover:border-zinc-500 hover:text-zinc-100"
            >
                <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-current">
                    <path d="M1 3h14v1.5L9 10v5l-2-1V10L1 4.5V3z" />
                </svg>
                Filters
                {activeFilterCount > 0 && (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-lime-400 text-[10px] font-bold text-zinc-950">
                        {activeFilterCount}
                    </span>
                )}
            </button>

            {open && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                        onClick={() => setOpen(false)}
                    />

                    {/* Drawer */}
                    <div className="fixed inset-y-0 left-0 z-50 flex w-80 flex-col bg-zinc-950 shadow-2xl">
                        <div className="flex shrink-0 items-center justify-between border-b border-zinc-800 px-5 py-4">
                            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                                Filters
                            </span>
                            <button
                                onClick={() => setOpen(false)}
                                className="text-zinc-500 transition-colors hover:text-zinc-200"
                                aria-label="Close filters"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto px-5 py-4">
                            <Suspense fallback={null}>
                                <FilterSidebar
                                    availableGenres={availableGenres}
                                    availableTags={availableTags}
                                    currentFilters={currentFilters}
                                    mobile
                                />
                            </Suspense>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
