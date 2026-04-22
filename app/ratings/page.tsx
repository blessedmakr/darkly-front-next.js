import Image from "next/image";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import ScoreGrid from "../../components/ScoreGrid";

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
            <div className="mx-auto max-w-5xl">
                <h1 className="text-3xl font-semibold tracking-tight">My Ratings</h1>
                <p className="mt-2 text-zinc-400">
                    {ratings.length === 0
                        ? "You haven't rated any films yet."
                        : `${ratings.length} film${ratings.length === 1 ? "" : "s"} rated`}
                </p>

                {ratings.length > 0 && (
                    <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {ratings.map((r) => (
                            <Link
                                key={r.motionPictureId}
                                href={`/motion-pictures/${r.motionPictureId}`}
                                className="flex gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3 transition-colors hover:border-zinc-700"
                            >
                                <div className="relative w-10 min-h-[80px] shrink-0 self-stretch overflow-hidden rounded">
                                    {r.posterUrl ? (
                                        <Image
                                            src={r.posterUrl}
                                            alt={r.originalTitle}
                                            fill
                                            className="object-cover"
                                            sizes="40px"
                                        />
                                    ) : (
                                        <div className="h-full w-full bg-zinc-800" />
                                    )}
                                </div>
                                <div className="min-w-0 flex-1 flex flex-col justify-center">
                                    <p className="line-clamp-2 text-sm font-medium leading-tight text-zinc-100">{r.originalTitle}</p>
                                    {r.releaseYear != null && r.releaseYear > 0 && (
                                        <p className="mt-0.5 text-xs text-zinc-500">{r.releaseYear}</p>
                                    )}
                                    <div className="mt-2">
                                        <ScoreGrid
                                            score={r.overallScore}
                                            fearScore={r.fearScore}
                                            atmosphereScore={r.atmosphereScore}
                                            goreScore={r.goreScore}
                                        />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
