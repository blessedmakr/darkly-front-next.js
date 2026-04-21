import Link from "next/link";
import Image from "next/image";

import type { MotionPicture } from "../types/motion-picture";
import { formatRunningTime, getReleaseYear } from "../lib/motion-picture";
import HeroCTAs from "./HeroCTAs";

interface FeaturedHeroProps {
    motionPicture: MotionPicture;
}

export default function FeaturedHero({ motionPicture }: FeaturedHeroProps) {
    const releaseYear = getReleaseYear(motionPicture.releaseDate);
    const displayRating = motionPicture.motionPictureRating?.trim() || "NR";
    const hasScore =
        motionPicture.scoreRatingCount != null && motionPicture.scoreRatingCount > 0;

    return (
        <section
            className="relative isolate min-h-screen overflow-hidden bg-zinc-950"
            aria-label="Featured motion picture"
        >
            {/* Backdrop — fades heavily left so the text column sits on near-black */}
            {motionPicture.backdropUrl && (
                <Image
                    src={motionPicture.backdropUrl}
                    alt=""
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover object-center opacity-40"
                />
            )}

            {/* Mobile: top-to-bottom gradient. md+: left-to-right so text column sits on near-black */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(9,9,11,0.85)_0%,rgba(9,9,11,0.55)_40%,rgba(9,9,11,0.85)_100%)] md:bg-[linear-gradient(to_right,rgba(9,9,11,1)_0%,rgba(9,9,11,0.92)_30%,rgba(9,9,11,0.60)_60%,rgba(9,9,11,0.15)_100%)]" />
            {/* Top and bottom vignette (md+ only) */}
            <div className="absolute inset-0 hidden bg-[linear-gradient(to_bottom,rgba(9,9,11,0.70)_0%,transparent_20%,transparent_75%,rgba(9,9,11,0.90)_100%)] md:block" />

            {/* Content grid */}
            <div className="relative mx-auto grid min-h-screen max-w-7xl grid-cols-1 items-center gap-10 px-6 pb-20 pt-28 md:grid-cols-[1fr_auto] md:gap-16 lg:px-12">

                {/* ── Left column ─────────────────────────────────────────── */}
                <div className="max-w-lg">

                    {/* Site identity */}
                    <p className="text-[10px] uppercase tracking-[0.45em] text-zinc-500">
                        Darkly &nbsp;·&nbsp; The horror film companion
                    </p>

                    {/* Red rule */}
                    <div className="mt-5 h-px w-10 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />

                    {/* Eyebrow */}
                    <p className="mt-5 text-[11px] uppercase tracking-[0.3em] text-red-500">
                        Now featuring
                    </p>

                    {/* Title */}
                    <h1 className="mt-2 text-5xl font-semibold leading-[1.05] tracking-tight text-zinc-100 lg:text-6xl">
                        {motionPicture.originalTitle}
                    </h1>

                    {/* Meta */}
                    <p className="mt-3 text-sm text-zinc-500">
                        {releaseYear}
                        {motionPicture.runningTime ? ` · ${formatRunningTime(motionPicture.runningTime)}` : ""}
                        {` · ${displayRating}`}
                    </p>

                    {/* Score */}
                    {hasScore && (
                        <div className="mt-5 flex items-baseline gap-2">
                            <span className="text-3xl font-bold tabular-nums text-zinc-100">
                                {motionPicture.score.toFixed(1)}
                            </span>
                            <span className="text-sm text-zinc-500">/ 10</span>
                            <span className="ml-1 text-xs text-zinc-600">
                                {motionPicture.scoreRatingCount} rating{motionPicture.scoreRatingCount === 1 ? "" : "s"}
                            </span>
                        </div>
                    )}

                    {/* Dimension scores */}
                    {motionPicture.scoreRatingCount > 0 && (
                        <div className="mt-5 flex gap-4">
                            {[
                                { label: "Fear", value: motionPicture.fearScore, border: "border-red-500/30", glow: "shadow-[0_0_18px_rgba(239,68,68,0.18)]", text: "text-red-400", sub: "text-red-500/50" },
                                { label: "Gore", value: motionPicture.goreScore, border: "border-orange-500/30", glow: "shadow-[0_0_18px_rgba(249,115,22,0.18)]", text: "text-orange-400", sub: "text-orange-500/50" },
                                { label: "Atmosphere", value: motionPicture.atmosphereScore, border: "border-violet-500/30", glow: "shadow-[0_0_18px_rgba(139,92,246,0.18)]", text: "text-violet-400", sub: "text-violet-500/50" },
                            ].map(({ label, value, border, glow, text, sub }) => (
                                <div key={label} className={`rounded-xl border bg-zinc-900/60 px-4 py-3 backdrop-blur-sm ${border} ${glow}`}>
                                    <p className="text-[9px] uppercase tracking-[0.25em] text-zinc-500">{label}</p>
                                    <div className="mt-1 flex items-baseline gap-1">
                                        <span className={`text-2xl font-bold tabular-nums leading-none ${text}`}>{value.toFixed(1)}</span>
                                        <span className={`text-xs ${sub}`}>/10</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Tagline */}
                    {motionPicture.tagline && (
                        <p className="mt-5 text-lg italic leading-relaxed text-zinc-300">
                            &ldquo;{motionPicture.tagline}&rdquo;
                        </p>
                    )}

                    {/* Hook / overview excerpt */}
                    {motionPicture.hook && (
                        <p className="mt-3 line-clamp-2 text-sm leading-7 text-zinc-500">
                            {motionPicture.hook}
                        </p>
                    )}

                    {/* CTAs */}
                    <div className="mt-8 flex flex-wrap items-center gap-3">
                        <Link
                            href="/motion-pictures"
                            className="rounded-md bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(220,38,38,0.35)] transition-colors hover:bg-red-500"
                        >
                            Browse all films
                        </Link>
                        <HeroCTAs motionPictureId={motionPicture.id} />
                    </div>
                </div>

                {/* ── Right column: poster ─────────────────────────────────── */}
                {motionPicture.posterUrl && (
                    <div className="flex justify-center md:block">
                        <Link
                            href={`/motion-pictures/${motionPicture.id}`}
                            className="group block"
                            aria-label={`View details for ${motionPicture.originalTitle}`}
                        >
                            {/* Hover glow ring */}
                            <div className="pointer-events-none absolute -inset-4 rounded-[1.5rem] border border-lime-300/0 bg-lime-300/0 transition duration-300 group-hover:border-lime-300/50 group-hover:bg-lime-300/5" />

                            <div className="relative w-[240px] overflow-hidden rounded-2xl border border-white/10 bg-black/80 shadow-[0_24px_80px_rgba(0,0,0,0.9)] transition duration-300 group-hover:-translate-y-1.5 group-hover:shadow-[0_40px_120px_rgba(0,0,0,0.95)] lg:w-[280px]">
                                {/* Inner border glow on hover */}
                                <div className="pointer-events-none absolute inset-0 z-10 rounded-2xl border border-lime-300/0 transition duration-300 group-hover:border-lime-300/40" />

                                <Image
                                    src={motionPicture.posterUrl}
                                    alt={`${motionPicture.originalTitle} poster`}
                                    width={560}
                                    height={840}
                                    priority
                                    className="h-auto w-full object-cover"
                                />
                            </div>
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
}
