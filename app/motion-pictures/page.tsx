import { Suspense } from "react";
import type { Metadata } from "next";
import MotionPictureGrid from "../../components/MotionPictureGrid";
import FilterSidebar from "../../components/FilterSidebar";
import MobileFilterDrawer from "../../components/MobileFilterDrawer";
import SearchPagination from "../../components/SearchPagination";
import SortControl from "../../components/SortControl";
import { searchMotionPicturesWithFilters } from "../../services/motion-pictures";
import { getTags, getGenres } from "../../services/catalog";
import {
    parseSearchParamsToFilters,
    hasActiveFilters,
} from "../../lib/motion-picture-filters";

export const metadata: Metadata = {
    title: "Browse Horror Films",
    description: "Search and filter horror films by fear, gore, atmosphere scores, genre, tags, and more.",
    openGraph: {
        title: "Browse Horror Films",
        description: "Search and filter horror films by fear, gore, atmosphere scores, genre, tags, and more.",
    },
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
        searchMotionPicturesWithFilters(filters, { page }).catch(() => null),
    ]);

    const activeFilters = hasActiveFilters(filters);
    const activeFilterCount =
        (filters.query ? 1 : 0) +
        filters.includeGenres.length +
        filters.excludeGenres.length +
        filters.includeTags.length +
        filters.excludeTags.length +
        (filters.minYear !== null || filters.maxYear !== null ? 1 : 0) +
        (filters.minScore !== null ? 1 : 0) +
        (filters.minFearScore !== null ? 1 : 0) +
        (filters.minAtmosphereScore !== null ? 1 : 0) +
        (filters.minGoreScore !== null ? 1 : 0);
    const heading = filters.query
        ? `Results for "${filters.query}"`
        : "Browse";

    return (
        <main className="min-h-screen bg-zinc-950 px-6 py-24">
            <div className="mx-auto max-w-7xl">
                <p className="mb-2 text-sm uppercase tracking-[0.3em] text-red-500">
                    Motion Pictures
                </p>

                <div className="mb-4 flex items-baseline justify-between">
                    <h1 className="text-4xl font-semibold tracking-tight text-zinc-100">
                        {heading}
                    </h1>
                    {result && result.total > 0 && (
                        <p className="text-sm text-zinc-500">
                            {result.total} motion picture{result.total === 1 ? "" : "s"}
                        </p>
                    )}
                </div>

                <div className="mt-8 flex gap-10">
                    <aside className="hidden w-72 shrink-0 lg:block">
                        <Suspense fallback={null}>
                            <FilterSidebar
                                availableGenres={genres}
                                availableTags={tags}
                                currentFilters={filters}
                            />
                        </Suspense>
                    </aside>

                    <div className="min-w-0 flex-1">
                        <div className="mb-6 flex items-center justify-between">
                            <div className="lg:hidden">
                                <MobileFilterDrawer
                                    availableGenres={genres}
                                    availableTags={tags}
                                    currentFilters={filters}
                                    activeFilterCount={activeFilterCount}
                                />
                            </div>
                            {result !== null && result.items.length > 0 && (
                                <Suspense fallback={null}>
                                    <div className="ml-auto">
                                        <SortControl
                                            currentSortBy={filters.sortBy}
                                            currentSortDir={filters.sortDir}
                                        />
                                    </div>
                                </Suspense>
                            )}
                        </div>

                        {result === null ? (
                            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-zinc-400">
                                Something went wrong loading results. Try adjusting your filters.
                            </div>
                        ) : result.items.length > 0 ? (
                            <>
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
                                    : "Search or use the filters to find motion pictures."}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
