import Link from "next/link";
import { getDiscovery } from "../services/motion-pictures";
import MotionPicturePreviewCard from "./MotionPicturePreviewCard";

const DISPLAY_LIMIT = 10;

export default async function Discovery() {
    let films: Awaited<ReturnType<typeof getDiscovery>>["films"] = [];
    let tags: string[] = [];
    try {
        const data = await getDiscovery();
        films = [...data.films]
            .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
            .slice(0, DISPLAY_LIMIT);
        tags = data.tags;
    } catch {
        return null;
    }

    if (films.length === 0) return null;

    return (
        <section className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
            <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-500">Now Showing</p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-100">
                        {tags.length > 0 ? tags.join(" · ") : "Curated Selection"}
                    </h2>
                </div>
                <Link
                    href="/motion-pictures"
                    className="shrink-0 text-sm text-zinc-500 transition-colors hover:text-zinc-300"
                >
                    Browse all →
                </Link>
            </div>

            <div className="flex gap-4 overflow-x-auto scrollbar-none pb-2">
                {films.map((film) => (
                    <div key={film.id} className="w-40 shrink-0 sm:w-44">
                        <MotionPicturePreviewCard film={film} />
                    </div>
                ))}
            </div>
        </section>
    );
}
