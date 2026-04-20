import { getSimilarFilms } from "../services/motion-pictures";
import MotionPicturePreviewCard from "./MotionPicturePreviewCard";

interface SimilarFilmsSectionProps {
    motionPictureId: number;
}

export default async function SimilarFilmsSection({ motionPictureId }: SimilarFilmsSectionProps) {
    let films;
    try {
        films = await getSimilarFilms(motionPictureId);
    } catch {
        return null;
    }

    if (!films || films.length === 0) return null;

    return (
        <section className="mx-auto max-w-6xl px-6 pb-16">
            <div className="flex items-center gap-4 mb-6">
                <div className="h-px flex-1 bg-zinc-800" />
                <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">More Like This</p>
                <div className="h-px flex-1 bg-zinc-800" />
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {films.map((film) => (
                    <MotionPicturePreviewCard key={film.id} film={film} />
                ))}
            </div>
        </section>
    );
}
