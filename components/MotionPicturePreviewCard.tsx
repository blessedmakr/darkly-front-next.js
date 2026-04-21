import Image from "next/image";
import Link from "next/link";
import type { MotionPicturePreviewDto } from "../types/motion-picture";
import WatchlistBookmark from "./WatchlistBookmark";

export default function MotionPicturePreviewCard({ film }: { film: MotionPicturePreviewDto }) {
    return (
        <div className="relative w-full">
            <div className="absolute right-2 top-2 z-10">
                <WatchlistBookmark motionPictureId={film.id} />
            </div>

        <article className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60 transition hover:border-zinc-600 hover:bg-zinc-900">
            <Link href={`/motion-pictures/${film.id}`} className="group block">
                <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-800">
                    {film.posterUrl ? (
                        <Image
                            src={film.posterUrl}
                            alt={`${film.originalTitle} poster`}
                            fill
                            loading="lazy"
                            className="object-cover transition-opacity duration-300 group-hover:opacity-40"
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-sm text-zinc-600">
                            No Image
                        </div>
                    )}
                </div>

                <div className="px-4 pt-4">
                    <h2 className="text-base font-semibold leading-tight tracking-tight text-zinc-100 line-clamp-2 group-hover:text-red-400">
                        {film.originalTitle}
                        {film.releaseYear > 0 && <span className="ml-2 text-xs font-normal text-zinc-500">{film.releaseYear}</span>}
                    </h2>
                </div>

                <div className="grid grid-cols-2 gap-x-3 gap-y-2 px-4 pb-4 pt-3">
                    {[
                        { label: "Overall", value: film.score,           color: "text-zinc-100",   shadow: "drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]"  },
                        { label: "Fear",    value: film.fearScore,       color: "text-red-300",    shadow: "drop-shadow-[0_0_10px_rgba(252,165,165,0.7)]"  },
                        { label: "Atmos",   value: film.atmosphereScore, color: "text-violet-300", shadow: "drop-shadow-[0_0_10px_rgba(196,181,253,0.7)]"  },
                        { label: "Gore",    value: film.goreScore,       color: "text-orange-300", shadow: "drop-shadow-[0_0_10px_rgba(253,186,116,0.7)]"  },
                    ].map(({ label, value, color, shadow }) => (
                        <div key={label} className="flex flex-col items-center">
                            <span className="text-[9px] uppercase tracking-[0.15em] text-zinc-600">{label}</span>
                            <span className={`text-xs font-semibold tabular-nums ${color} ${shadow}`}>
                                {value > 0 ? value.toFixed(1) : "—"}
                            </span>
                        </div>
                    ))}
                </div>
            </Link>
        </article>
        </div>
    );
}
