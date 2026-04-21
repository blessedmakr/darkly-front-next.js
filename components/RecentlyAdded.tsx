import Link from "next/link";
import { searchMotionPicturesWithFilters } from "../services/motion-pictures";
import MotionPicturePreviewCard from "./MotionPicturePreviewCard";
import { EMPTY_FILTER_STATE } from "../lib/motion-picture-filters";

const LIMIT = 10;

export default async function RecentlyAdded() {
    let films: Awaited<ReturnType<typeof searchMotionPicturesWithFilters>>["items"] = [];
    try {
        const result = await searchMotionPicturesWithFilters(
            { ...EMPTY_FILTER_STATE, sortBy: "id", sortDir: "desc" },
            { page: 1, pageSize: LIMIT }
        );
        films = result.items;
    } catch {
        return null;
    }

    if (films.length === 0) return null;

    return (
        <section className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
            <div className="mb-6 flex items-baseline justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-500">New to Darkly</p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-100">Recently Added</h2>
                </div>
                <Link
                    href="/motion-pictures"
                    className="text-sm text-zinc-500 transition-colors hover:text-zinc-300"
                >
                    Browse all →
                </Link>
            </div>

            <div className="flex gap-4 overflow-x-auto scrollbar-none pb-2">
                {films.map((film) => (
                    <div key={film.id} className="w-40 shrink-0 sm:w-44">
                        <MotionPicturePreviewCard film={{
                            id: film.id,
                            originalTitle: film.originalTitle,
                            posterUrl: film.posterUrl ?? "",
                            score: film.score ?? 0,
                            fearScore: film.fearScore ?? 0,
                            goreScore: film.goreScore ?? 0,
                            atmosphereScore: film.atmosphereScore ?? 0,
                            releaseYear: film.releaseDate ? new Date(film.releaseDate).getFullYear() : 0,
                        }} />
                    </div>
                ))}
            </div>
        </section>
    );
}
