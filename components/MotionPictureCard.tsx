import Image from "next/image";
import Link from "next/link";
import type { MotionPicture } from "../types/motion-picture";
import {
    formatRunningTime,
    getPrimaryTag,
    getReleaseYear,
} from "../lib/motion-picture";

interface MotionPictureCardProps {
    motionPicture: MotionPicture;
}

export default function MotionPictureCard({
    motionPicture,
}: MotionPictureCardProps) {
    const posterImage = motionPicture.posterUrl;
    const releaseYear = getReleaseYear(motionPicture.releaseDate);
    const primaryTag = getPrimaryTag(motionPicture.tags);

    const displayRating =
        motionPicture.motionPictureRating &&
            motionPicture.motionPictureRating.trim().length > 0
            ? motionPicture.motionPictureRating
            : "NR";

    const displayGenres = motionPicture.genres.filter(
        (genre) => genre.toLowerCase() !== "horror"
    );

    return (
        <article className="w-[240px] overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60 transition hover:border-zinc-600 hover:bg-zinc-900">
            <Link href={`/motion-pictures/${motionPicture.id}`} className="group block">
                <div className="relative h-[360px] w-full overflow-hidden bg-zinc-800">
                    {posterImage ? (
                        <Image
                            src={posterImage}
                            alt={`${motionPicture.originalTitle} poster`}
                            fill
                            loading="lazy"
                            className="object-cover"
                            sizes="240px"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-zinc-600 text-sm">
                            No Image
                        </div>
                    )}
                </div>

                <div className="px-4 pt-4">
                    {primaryTag && (
                        <p className="text-[11px] uppercase tracking-[0.2em] text-red-500">
                            {primaryTag}
                        </p>
                    )}

                    <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                        <h2 className="text-lg font-semibold leading-tight tracking-tight text-zinc-100 group-hover:text-red-400">
                            {motionPicture.originalTitle}
                        </h2>

                        <p className="text-sm text-zinc-400">
                            {releaseYear} · {displayRating} ·{" "}
                            {formatRunningTime(motionPicture.runningTime)}
                            {motionPicture.score > 0 && (
                                <span className="ml-2 font-semibold tabular-nums text-zinc-200">
                                    {motionPicture.score.toFixed(1)}
                                </span>
                            )}
                        </p>
                    </div>
                </div>
            </Link>

            <div className="px-4 pb-4">
                {displayGenres.length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                        {displayGenres.map((genre) => (
                            <span
                                key={genre}
                                className="rounded-full border border-zinc-700 px-2 py-0.5 text-[11px] font-medium leading-5 text-zinc-300"
                            >
                                {genre}
                            </span>
                        ))}
                    </div>
                ) : null}

                {motionPicture.tags.length > 0 ? (
                    <details className="group mt-4">
                        <summary className="list-none cursor-pointer text-sm text-zinc-400 transition hover:text-zinc-200 marker:hidden">
                            <span className="inline-flex items-center gap-2">
                                <span className="text-lime-400 transition group-open:rotate-90 group-open:text-lime-300">
                                    ›
                                </span>
                                <span className="tracking-wide">Tags</span>
                            </span>
                        </summary>

                        <div className="mt-3 pl-5">
                            <div className="flex flex-wrap gap-1.5 border-l border-zinc-800 pl-3">
                                {motionPicture.tags.map((tag) => (
                                    <span
                                        key={`${tag.tagType}-${tag.name}`}
                                        className="rounded-full border border-lime-400/20 bg-lime-400/5 px-2 py-0.5 text-[11px] font-medium leading-5 text-zinc-200"
                                    >
                                        {tag.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </details>
                ) : null}

                {motionPicture.hook ? (
                    <details className="group mt-4">
                        <summary className="list-none cursor-pointer text-sm text-zinc-400 transition hover:text-zinc-200 marker:hidden">
                            <span className="inline-flex items-center gap-2">
                                <span className="text-zinc-500 transition group-open:rotate-90 group-open:text-zinc-300">
                                    ›
                                </span>
                                <span className="tracking-wide">Summary</span>
                            </span>
                        </summary>

                        <div className="mt-3 pl-5">
                            <p className="border-l border-zinc-800 pl-3 text-sm leading-6 text-zinc-400">
                                {motionPicture.hook}
                            </p>
                        </div>
                    </details>
                ) : null}

                {(motionPicture.fearScore > 0 || motionPicture.goreScore > 0 || motionPicture.atmosphereScore > 0) && (
                    <div className="mt-4 grid grid-cols-3 gap-2 border-t border-zinc-800 pt-4">
                        {[
                            { label: "Fear", value: motionPicture.fearScore, bar: "bg-red-500", text: "text-red-400" },
                            { label: "Gore", value: motionPicture.goreScore, bar: "bg-orange-500", text: "text-orange-400" },
                            { label: "Atm", value: motionPicture.atmosphereScore, bar: "bg-violet-500", text: "text-violet-400" },
                        ].map(({ label, value, bar, text }) => (
                            <div key={label}>
                                <div className="flex items-baseline justify-between">
                                    <span className="text-[9px] uppercase tracking-[0.12em] text-zinc-600">{label}</span>
                                    <span className={`text-[11px] font-semibold tabular-nums ${value > 0 ? text : "text-zinc-700"}`}>
                                        {value > 0 ? value.toFixed(1) : "—"}
                                    </span>
                                </div>
                                <div className="mt-1 h-0.5 w-full rounded-full bg-zinc-800">
                                    <div
                                        className={`h-0.5 rounded-full ${bar}`}
                                        style={{ width: value > 0 ? `${(value / 10) * 100}%` : "0%" }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </article>
    );
}