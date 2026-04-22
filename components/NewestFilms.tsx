import Link from "next/link";
import { getDiscovery } from "../services/motion-pictures";
import MotionPicturePreviewCard from "./MotionPicturePreviewCard";

const DISPLAY_LIMIT = 10;

export default async function NewestFilms() {
    let films: Awaited<ReturnType<typeof getDiscovery>>["films"] = [];
    try {
        const { films: raw } = await getDiscovery();
        films = [...raw]
            .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
            .slice(0, DISPLAY_LIMIT);
    } catch {
        return null;
    }

    if (films.length === 0) return null;

    return (
        <section className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
            <div className="mb-6 flex items-baseline justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-500">New Releases</p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-100">Newest Films</h2>
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
                        <MotionPicturePreviewCard film={film} />
                    </div>
                ))}
            </div>
        </section>
    );
}
