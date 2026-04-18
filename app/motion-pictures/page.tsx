import { Suspense } from "react";
import type { Metadata } from "next";
import MotionPictureGrid from "../../components/MotionPictureGrid";
import FilterSidebar from "../../components/FilterSidebar";
import SearchPagination from "../../components/SearchPagination";
import SortControl from "../../components/SortControl";
import { searchMotionPicturesWithFilters } from "../../services/motion-pictures";
import { getTags, getGenres } from "../../services/catalog";
import {
    parseSearchParamsToFilters,
    hasActiveFilters,
} from "../../lib/motion-picture-filters";

export const metadata: Metadata = {
    title: "Browse Horror Films | Darkly",
    description: "Search and filter horror films by fear, gore, atmosphere scores, genre, tags, and more.",
};

interface MotionPicturesPageProps {
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function MotionPicturesPage({
    searchParams,
}: MotionPicturesPageProps) {
    const resolvedParams = (await searchParams) ?? {};
    const { filters, page } = parseSearchParamsToFilters(resolvedParams);

    const [tags, genres, result] = await Promise.all([
        getTags(),
        getGenres(),
        searchMotionPicturesWithFilters(filters, { page }),
    ]);

    const activeFilters = hasActiveFilters(filters);
    const heading = filters.query
        ? `Results for "${filters.query}"`
        : "Browse";

    return (
        <main className="min-h-screen bg-zinc-950 px-6 py-24">
            <div className="mx-auto max-w-7xl">
                <p className="mb-2 text-sm uppercase tracking-[0.3em] text-red-500">
                    Motion Pictures
                </p>
                <h1 className="mb-10 text-4xl font-semibold tracking-tight text-zinc-100">
                    {heading}
                </h1>

                <div className="flex gap-10">
                    <aside className="w-72 shrink-0">
                        {/*
                         * FilterSidebar calls useSearchParams() internally, so it must
                         * be wrapped in Suspense even though this page is already dynamic.
                         */}
                        <Suspense fallback={null}>
                            <FilterSidebar
                                availableGenres={genres}
                                availableTags={tags}
                                currentFilters={filters}
                            />
                        </Suspense>
                    </aside>

                    <div className="min-w-0 flex-1">
                        {result.items.length > 0 ? (
                            <>
                                <div className="mb-6 flex items-center justify-between">
                                    <p className="text-sm text-zinc-500">
                                        {result.total} motion picture
                                        {result.total === 1 ? "" : "s"}
                                    </p>
                                    <Suspense fallback={null}>
                                        <SortControl
                                            currentSortBy={filters.sortBy}
                                            currentSortDir={filters.sortDir}
                                        />
                                    </Suspense>
                                </div>
                                <MotionPictureGrid motionPictures={result.items} />
                                {result.total > result.pageSize && (
                                    <Suspense fallback={null}>
                                        <SearchPagination
                                            page={page}
                                            pageSize={result.pageSize}
                                            total={result.total}
                                        />
                                    </Suspense>
                                )}
                            </>
                        ) : (
                            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-zinc-400">
                                {activeFilters || filters.query
                                    ? "No motion pictures matched your filters."
                                    : "Use the filters or search bar to find motion pictures."}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
