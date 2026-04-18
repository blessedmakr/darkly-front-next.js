"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { SortBy, SortDir } from "../lib/motion-picture-filters";

interface SortOption {
    label: string;
    sortBy: SortBy;
    sortDir: SortDir;
}

const SORT_OPTIONS: SortOption[] = [
    { label: "Newest",           sortBy: "releaseDate",     sortDir: "desc" },
    { label: "Oldest",           sortBy: "releaseDate",     sortDir: "asc"  },
    { label: "Highest Fear",     sortBy: "fearScore",       sortDir: "desc" },
    { label: "Highest Gore",     sortBy: "goreScore",       sortDir: "desc" },
    { label: "Highest Atmosphere", sortBy: "atmosphereScore", sortDir: "desc" },
    { label: "Top Rated",        sortBy: "score",           sortDir: "desc" },
];

interface SortControlProps {
    currentSortBy: SortBy;
    currentSortDir: SortDir;
}

export default function SortControl({ currentSortBy, currentSortDir }: SortControlProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Local state avoids the controlled-select snap-back: when router.push is
    // called the server props don't update until navigation completes, so React
    // would reset the <select> to the old value on the next synchronous render.
    const [localValue, setLocalValue] = useState(`${currentSortBy}:${currentSortDir}`);

    // Sync local state when server navigation delivers new props.
    useEffect(() => {
        setLocalValue(`${currentSortBy}:${currentSortDir}`);
    }, [currentSortBy, currentSortDir]);

    function applySort(sortBy: SortBy, sortDir: SortDir) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("sortBy", sortBy);
        params.set("sortDir", sortDir);
        params.delete("page"); // reset to page 1 on sort change
        router.push(`${pathname}?${params.toString()}`);
    }

    return (
        <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-[0.2em] text-zinc-600">Sort</span>
            <div className="relative">
                <select
                    value={localValue}
                    onChange={(e) => {
                        const [sortBy, sortDir] = e.target.value.split(":") as [SortBy, SortDir];
                        setLocalValue(e.target.value);
                        applySort(sortBy, sortDir);
                    }}
                    aria-label="Sort motion pictures"
                    className="appearance-none rounded-md border border-zinc-700 bg-zinc-900 py-1.5 pl-3 pr-8 text-sm text-zinc-200 transition-colors hover:border-zinc-600 focus:border-zinc-500 focus:outline-none"
                >
                    {SORT_OPTIONS.map((opt) => (
                        <option key={`${opt.sortBy}:${opt.sortDir}`} value={`${opt.sortBy}:${opt.sortDir}`}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                {/* Custom chevron */}
                <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center">
                    <svg viewBox="0 0 10 6" className="h-2.5 w-2.5 fill-zinc-500">
                        <path d="M0 0l5 6 5-6z" />
                    </svg>
                </div>
            </div>
        </div>
    );
}
