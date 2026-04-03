import type { MotionPicture } from "../types/motion-picture";

interface MotionPictureCardProps {
    motionPicture: MotionPicture;
}

export default function MotionPictureCard({
    motionPicture,
}: MotionPictureCardProps) {
    const releaseYear = new Date(motionPicture.releaseDate).getFullYear();

    const subgenreTag = motionPicture.tags.find(
        (tag) => tag.tagType === "subgenre"
    );

    return (
        <article className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
            <p className="text-sm uppercase tracking-[0.2em] text-red-500">
                {subgenreTag?.name ?? "Horror"}
            </p>

            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-100">
                {motionPicture.originalTitle}
            </h2>

            <p className="mt-2 text-sm text-zinc-400">
                {releaseYear} · {motionPicture.motionPictureRating} ·{" "}
                {motionPicture.runningTime} min
            </p>

            <p className="mt-4 leading-7 text-zinc-300">
                {motionPicture.hook || motionPicture.tagline || motionPicture.overview}
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
                {motionPicture.genres.slice(0, 3).map((genre) => (
                    <span
                        key={genre}
                        className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-300"
                    >
                        {genre}
                    </span>
                ))}
            </div>
        </article>
    );
}