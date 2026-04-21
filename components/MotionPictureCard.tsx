import Image from "next/image";
import Link from "next/link";
import type { MotionPicture } from "../types/motion-picture";
import {
    formatRunningTime,
    getPrimaryTag,
    getReleaseYear,
} from "../lib/motion-picture";
import TagsPopover from "./TagsPopover";
import WatchlistBookmark from "./WatchlistBookmark";

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
        <div className="relative w-full">
            {/* Bookmark sits outside the <Link> to avoid invalid <a><button> nesting */}
            <div className="absolute right-2 top-2 z-10">
                <WatchlistBookmark motionPictureId={motionPicture.id} />
            </div>

            <article className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60 transition hover:border-zinc-600 hover:bg-zinc-900">
                <Link href={`/motion-pictures/${motionPicture.id}`} className="group block">
                    <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-800">
                        {posterImage ? (
                            <Image
                                src={posterImage}
                                alt={`${motionPicture.originalTitle} poster`}
                                fill
                                loading="lazy"
                                className="object-cover transition-opacity duration-300 group-hover:opacity-40"
                                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 33vw, 280px"
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center text-zinc-600 text-sm">
                                No Image
                            </div>
                        )}

                        {motionPicture.hook && (
                            <div className="absolute inset-0 flex items-center p-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                <p className="text-sm leading-6 text-zinc-100">
                                    {motionPicture.hook}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="flex items-start gap-2 px-4 pt-4">
                        <div className="min-w-0 flex-1">
                            {primaryTag && (
                                <p className="text-[11px] uppercase tracking-[0.2em] text-red-500">
                                    {primaryTag}
                                </p>
                            )}

                            <h2 className="mt-2 text-lg font-semibold leading-tight tracking-tight text-zinc-100 group-hover:text-red-400">
                                {motionPicture.originalTitle}
                            </h2>

                            <p className="mt-2 text-xs text-zinc-500">
                                {releaseYear} · {displayRating} ·{" "}
                                {formatRunningTime(motionPicture.runningTime)}
                            </p>
                        </div>

                        {motionPicture.score > 0 && (
                            <div className="shrink-0 text-right">
                                <p className="text-xl font-bold tabular-nums leading-none text-lime-400">
                                    {motionPicture.score.toFixed(1)}
                                </p>
                                <p className="mt-0.5 text-[10px] text-zinc-600">/ 10</p>
                            </div>
                        )}
                    </div>
                </Link>

                <div className="px-4 pb-4">
                    {displayGenres.length > 0 && (
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
                    )}

                    {(motionPicture.fearScore > 0 || motionPicture.goreScore > 0 || motionPicture.atmosphereScore > 0) && (
                        <div className="mt-4 flex justify-around px-1 py-2">
                            {[
                                { label: "Fear", value: motionPicture.fearScore,       text: "text-red-300",    glow: "drop-shadow-[0_0_10px_rgba(252,165,165,0.9)]"  },
                                { label: "Gore", value: motionPicture.goreScore,       text: "text-orange-300", glow: "drop-shadow-[0_0_10px_rgba(253,186,116,0.9)]"  },
                                { label: "Atm.", value: motionPicture.atmosphereScore, text: "text-violet-300", glow: "drop-shadow-[0_0_10px_rgba(196,181,253,0.9)]"  },
                            ].filter(({ value }) => value > 0).map(({ label, value, text, glow }) => (
                                <div key={label} className="flex flex-col items-center">
                                    <span className={`text-lg font-black tabular-nums leading-none ${text} ${glow}`}>
                                        {value.toFixed(1)}
                                    </span>
                                    <span className="mt-1 text-[9px] uppercase tracking-[0.15em] text-white/50">{label}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <TagsPopover tags={motionPicture.tags} />
                </div>
            </article>
        </div>
    );
}
