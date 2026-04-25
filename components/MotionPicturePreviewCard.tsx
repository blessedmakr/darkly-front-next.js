import Image from "next/image";
import Link from "next/link";
import type { MotionPicturePreviewDto } from "../types/motion-picture";
import WatchlistBookmark from "./WatchlistBookmark";
import FavoriteHeartButton from "./FavoriteHeartButton";
import ScoreGrid from "./ScoreGrid";

export default function MotionPicturePreviewCard({ film }: { film: MotionPicturePreviewDto }) {
    return (
        <div className="relative w-full">
            <div className="absolute right-2 top-2 z-10 flex gap-1">
                <FavoriteHeartButton motionPictureId={film.id} />
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

                <div className="px-4 pb-4 pt-3">
                    <ScoreGrid
                        score={film.score}
                        fearScore={film.fearScore}
                        atmosphereScore={film.atmosphereScore}
                        goreScore={film.goreScore}
                    />
                </div>
            </Link>
        </article>
        </div>
    );
}
