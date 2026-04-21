import Image from "next/image";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getMotionPictureById } from "../../../services/motion-pictures";
import {
    formatRunningTime,
    getPrimaryTag,
    getReleaseYear,
} from "../../../lib/motion-picture";
import RatingForm from "../../../components/RatingForm";
import WatchlistBookmark from "../../../components/WatchlistBookmark";
import ReviewsSection from "../../../components/ReviewsSection";
import SimilarFilmsSection from "../../../components/SimilarFilmsSection";
import ViewTracker from "../../../components/ViewTracker";

interface MotionPictureDetailPageProps {
    params: Promise<{
        id: string;
    }>;
}

export async function generateMetadata({
    params,
}: MotionPictureDetailPageProps): Promise<Metadata> {
    try {
        const { id } = await params;
        const numericId = Number(id);
        if (Number.isNaN(numericId)) return { title: "Not Found | Darkly" };

        const motionPicture = await getMotionPictureById(numericId);
        const title = `${motionPicture.originalTitle} | Darkly`;
        const description =
            motionPicture.hook ||
            motionPicture.tagline ||
            motionPicture.overview.slice(0, 160);

        return {
            title,
            description,
            openGraph: {
                title,
                description,
                ...(motionPicture.backdropUrl ? {
                    images: [
                        {
                            url: motionPicture.backdropUrl,
                            width: 1200,
                            height: 630,
                            alt: motionPicture.originalTitle,
                        },
                    ],
                } : {}),
            },
        };
    } catch {
        return {
            title: "Motion Picture Not Found | Darkly",
            description: "The requested motion picture could not be found.",
        };
    }
}

export default async function MotionPictureDetailPage({
    params,
}: MotionPictureDetailPageProps) {
    const { id } = await params;
    const numericId = Number(id);

    if (Number.isNaN(numericId)) {
        notFound();
    }

    const motionPicture = await getMotionPictureById(numericId).catch(() => null);

    if (!motionPicture) notFound();

    const releaseYear = getReleaseYear(motionPicture.releaseDate);
    const primaryTag = getPrimaryTag(motionPicture.tags);
    const posterImage = motionPicture.posterUrl;
    const backdropImage = motionPicture.backdropUrl;

    const displayRating =
        motionPicture.motionPictureRating &&
            motionPicture.motionPictureRating.trim().length > 0
            ? motionPicture.motionPictureRating
            : "NR";

    return (
        <main className="min-h-screen bg-zinc-950 text-zinc-100">
            <ViewTracker motionPictureId={motionPicture.id} />
            <section className="relative isolate overflow-hidden border-b border-zinc-800">
                <div className="absolute inset-0">
                    {backdropImage && (
                        <Image
                            src={backdropImage}
                            alt={motionPicture.originalTitle}
                            fill
                            priority
                            className="object-cover opacity-30"
                            sizes="100vw"
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-zinc-950/30" />
                </div>
                <div className="relative mx-auto grid max-w-6xl gap-10 px-6 pb-20 pt-32 md:grid-cols-[280px_minmax(0,1fr)] md:items-start md:pb-24 md:pt-40">
                    <div className="mx-auto w-full max-w-[280px] md:mx-0">
                        {posterImage ? (
                            <Image
                                src={posterImage}
                                alt={`${motionPicture.originalTitle} poster`}
                                width={280}
                                height={420}
                                className="rounded-xl border border-zinc-800 object-cover shadow-2xl"
                                priority
                            />
                        ) : (
                            <div className="flex h-[420px] w-[280px] items-center justify-center rounded-xl border border-zinc-800 bg-zinc-800 text-sm text-zinc-600">
                                No Image
                            </div>
                        )}
                    </div>

                    <div>
                        {primaryTag && (
                            <p className="mb-4 text-sm uppercase tracking-[0.3em] text-red-500">
                                {primaryTag}
                            </p>
                        )}

                        <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
                            {motionPicture.originalTitle}
                        </h1>

                        <p className="mt-4 text-zinc-300">
                            {releaseYear} · {displayRating} ·{" "}
                            {formatRunningTime(motionPicture.runningTime)}
                        </p>

                        {motionPicture.tagline ? (
                            <p className="mt-5 text-sm italic tracking-wide text-zinc-500">
                                {motionPicture.tagline}
                            </p>
                        ) : null}

                        {motionPicture.hook ? (
                            <blockquote className="mt-6 max-w-2xl border-l-2 border-red-500 pl-4 text-base font-medium leading-7 text-zinc-200">
                                {motionPicture.hook}
                            </blockquote>
                        ) : null}

                        <div className="mt-6 max-w-3xl border-t border-zinc-800 pt-6">
                            <p className="whitespace-pre-line leading-8 text-zinc-400">
                                {motionPicture.overview}
                            </p>
                        </div>

                        <div className="mt-8">
                            <div className="flex flex-wrap gap-3">
                                {motionPicture.genres.map((genre) => (
                                    <span
                                        key={genre}
                                        className="rounded-full border border-zinc-700 px-3 py-1 text-sm text-zinc-300"
                                    >
                                        {genre}
                                    </span>
                                ))}
                            </div>

                            <div className="mt-6">
                            <WatchlistBookmark motionPictureId={motionPicture.id} />
                        </div>

                        {motionPicture.tags.length > 0 ? (
                                <>
                                    <div className="mt-6 flex items-center gap-4">
                                        <div className="h-px flex-1 bg-zinc-800" />
                                        <div className="h-px w-10 bg-lime-400 shadow-[0_0_12px_rgba(163,230,53,0.45)]" />
                                        <p className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">
                                            Tags
                                        </p>
                                        <div className="h-px flex-1 bg-zinc-800" />
                                    </div>

                                    <div className="mt-6 flex flex-wrap gap-3">
                                        {motionPicture.tags.map((tag) => (
                                            <span
                                                key={`${tag.tagType}-${tag.name}`}
                                                className="rounded-full border border-lime-400/20 bg-lime-400/5 px-3 py-1 text-sm text-zinc-200 shadow-[inset_0_0_0_1px_rgba(163,230,53,0.06)]"
                                                title={tag.description}
                                            >
                                                {tag.name}
                                            </span>
                                        ))}
                                    </div>
                                </>
                            ) : null}

                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto grid max-w-6xl gap-8 px-6 py-16 md:grid-cols-2">
                <RatingForm
                    motionPictureId={motionPicture.id}
                    motionPictureTitle={motionPicture.originalTitle}
                />

                <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-semibold text-zinc-100">Scores</h2>
                            <p className="mt-1 text-xs text-zinc-600">
                                Based on {motionPicture.scoreRatingCount} rating{motionPicture.scoreRatingCount === 1 ? "" : "s"}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-3xl font-bold tabular-nums text-zinc-100 leading-none">
                                {motionPicture.scoreRatingCount > 0
                                    ? motionPicture.score.toFixed(1)
                                    : "—"}
                            </p>
                            <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-zinc-600">Overall</p>
                        </div>
                    </div>

                    <div className="mt-5 space-y-4">
                        {[
                            { label: "Fear", value: motionPicture.fearScore, bar: "bg-red-500", text: "text-red-400" },
                            { label: "Gore", value: motionPicture.goreScore, bar: "bg-orange-500", text: "text-orange-400" },
                            { label: "Atmosphere", value: motionPicture.atmosphereScore, bar: "bg-violet-500", text: "text-violet-400" },
                        ].map(({ label, value, bar, text }) => (
                            <div key={label}>
                                <div className="flex items-baseline justify-between">
                                    <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">{label}</span>
                                    <span className={`text-sm font-semibold tabular-nums ${text}`}>
                                        {value != null ? value.toFixed(1) : "—"}
                                    </span>
                                </div>
                                <div className="mt-1.5 h-1.5 w-full rounded-full bg-zinc-800">
                                    <div
                                        className={`h-1.5 rounded-full ${bar} transition-all`}
                                        style={{ width: value != null ? `${(value / 10) * 100}%` : "0%" }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 border-t border-zinc-800 pt-5 space-y-2 text-sm text-zinc-400">
                        <div className="flex justify-between">
                            <span className="text-zinc-600">Language</span>
                            <span>{motionPicture.language || "—"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-zinc-600">Rating</span>
                            <span>{displayRating}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-zinc-600">Running time</span>
                            <span>{formatRunningTime(motionPicture.runningTime)}</span>
                        </div>
                    </div>
                </div>
            </section>

            {motionPicture.synopsis && (
                <section className="mx-auto max-w-6xl px-6 pb-16">
                    <details className="group rounded-xl border border-zinc-800 bg-zinc-900/50">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-4 marker:hidden">
                            <div className="flex items-center gap-3">
                                <span className="rounded border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.2em] text-amber-400">
                                    Spoilers
                                </span>
                                <span className="text-sm text-zinc-400 group-open:hidden">
                                    Synopsis — contains plot details
                                </span>
                                <span className="hidden text-sm text-zinc-400 group-open:inline">
                                    Synopsis
                                </span>
                            </div>
                            <span className="text-zinc-600 transition-transform group-open:rotate-180">
                                ↓
                            </span>
                        </summary>
                        <div className="space-y-4 border-t border-zinc-800 px-6 py-5">
                            {motionPicture.synopsis.split("|||").map((para, i) => (
                                <p key={i} className="leading-8 text-zinc-300">{para.trim()}</p>
                            ))}
                        </div>
                    </details>
                </section>
            )}

            <Suspense fallback={null}>
                <ReviewsSection motionPictureId={motionPicture.id} />
            </Suspense>

            <Suspense fallback={null}>
                <SimilarFilmsSection motionPictureId={motionPicture.id} />
            </Suspense>
        </main>
    );
}