import Image from "next/image";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "My Ratings",
    robots: { index: false, follow: false },
};

interface UserRating {
    motionPictureId: number;
    originalTitle: string;
    posterUrl: string | null;
    releaseYear: number | null;
    overallScore: number;
    fearScore: number;
    atmosphereScore: number;
    goreScore: number;
    reviewText: string | null;
    ratedAt: string;
}

function ScorePill({ label, value }: { label: string; value: number }) {
    return (
        <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">{label}</span>
            <span className="mt-0.5 text-sm font-semibold text-zinc-200">
                {value != null ? value.toFixed(1) : "—"}
            </span>
        </div>
    );
}

export default async function MyRatingsPage() {
    const { getToken, userId } = await auth();

    if (!userId) {
        redirect("/");
    }

    const token = await getToken();
    const res = await fetch(
        `${process.env.MOTION_PICTURES_API_BASE_URL}/ratings/mine`,
        {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
        }
    );

    const ratings: UserRating[] = res.ok ? await res.json() : [];

    return (
        <main className="min-h-screen bg-zinc-950 px-6 py-16 text-zinc-100">
            <div className="mx-auto max-w-3xl">
                <h1 className="text-3xl font-semibold tracking-tight">My Ratings</h1>
                <p className="mt-2 text-zinc-400">
                    {ratings.length === 0
                        ? "You haven't rated any films yet."
                        : `${ratings.length} film${ratings.length === 1 ? "" : "s"} rated`}
                </p>

                {ratings.length > 0 && (
                    <div className="mt-10 space-y-4">
                        {ratings.map((r) => (
                            <Link
                                key={r.motionPictureId}
                                href={`/motion-pictures/${r.motionPictureId}`}
                                className="flex gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition-colors hover:border-zinc-700"
                            >
                                <div className="shrink-0">
                                    {r.posterUrl ? (
                                        <Image
                                            src={r.posterUrl}
                                            alt={r.originalTitle}
                                            width={56}
                                            height={84}
                                            className="rounded-md object-cover"
                                        />
                                    ) : (
                                        <div className="h-[84px] w-[56px] rounded-md bg-zinc-800" />
                                    )}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="font-medium text-zinc-100">{r.originalTitle}</p>
                                            {r.releaseYear != null && r.releaseYear > 0 && (
                                                <p className="text-sm text-zinc-500">{r.releaseYear}</p>
                                            )}
                                        </div>
                                        <div className="flex shrink-0 gap-4">
                                            <ScorePill label="Overall" value={r.overallScore} />
                                            <ScorePill label="Fear"    value={r.fearScore} />
                                            <ScorePill label="Atmos"   value={r.atmosphereScore} />
                                            <ScorePill label="Gore"    value={r.goreScore} />
                                        </div>
                                    </div>

                                    {r.reviewText && (
                                        <p className="mt-2 line-clamp-2 text-sm text-zinc-400">
                                            {r.reviewText}
                                        </p>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
